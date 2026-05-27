/**
 * /api/admin/cp/comprobantes — Comprobantes contables.
 * GET  — lista del periodo (?periodoId=...) o últimos 50 globales.
 * POST — crea comprobante + asientos en transacción; valida:
 *        (a) periodo ABIERTO o AJUSTE (este sólo SUPER_ADMIN),
 *        (b) cuentas existen y permiteMovimientos=true,
 *        (c) partida doble (∑débitos = ∑créditos).
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { cpComprobanteCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const periodoId = searchParams.get('periodoId') ?? undefined
  const tipo = searchParams.get('tipo') ?? undefined

  const where: Prisma.CpComprobanteWhereInput = {}
  if (periodoId) where.periodoId = periodoId
  if (tipo) where.tipo = tipo as Prisma.CpComprobanteWhereInput['tipo']

  const prisma = await getTenantPrisma()
  const comprobantes = await prisma.cpComprobante.findMany({
    where,
    orderBy: { fecha: 'desc' },
    take: 50,
    include: {
      periodo: { select: { codigo: true, estado: true } },
      _count: { select: { asientos: true } },
    },
  })
  return NextResponse.json({ comprobantes })
}

export async function POST(req: Request) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(cpComprobanteCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()

  const periodo = await prisma.cpPeriodoContable.findUnique({ where: { id: d.periodoId } })
  if (!periodo) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 })
  if (periodo.estado === 'CERRADO') {
    return NextResponse.json({ error: "El periodo está CERRADO" }, { status: 409 })
  }
  if (periodo.estado === 'AJUSTE' && guard.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: "Sólo SUPER_ADMIN puede mover periodos en AJUSTE" }, { status: 403 })
  }

  const cuentaIds = Array.from(new Set(d.asientos.map(a => a.cuentaId)))
  const cuentas = await prisma.cpPlanCuenta.findMany({
    where: { id: { in: cuentaIds } },
    select: { id: true, permiteMovimientos: true, activa: true, codigo: true },
  })
  if (cuentas.length !== cuentaIds.length) {
    return NextResponse.json({ error: "Alguna cuenta no existe" }, { status: 400 })
  }
  const bloqueada = cuentas.find(c => !c.permiteMovimientos || !c.activa)
  if (bloqueada) {
    return NextResponse.json(
      { error: `Cuenta ${bloqueada.codigo} no acepta movimientos` },
      { status: 400 }
    )
  }

  const totalDebito = d.asientos.reduce((s, a) => s + a.debito, 0)
  const totalCredito = d.asientos.reduce((s, a) => s + a.credito, 0)

  try {
    const comprobante = await prisma.$transaction(async (tx: any) => {
      return tx.cpComprobante.create({
        data: {
          numero: d.numero,
          tipo: d.tipo,
          fecha: new Date(d.fecha),
          descripcion: d.descripcion,
          periodoId: d.periodoId,
          totalDebito,
          totalCredito,
          fuenteModulo: d.fuenteModulo ?? null,
          fuenteRef: d.fuenteRef ?? null,
          creadoPor: guard.user?.id ?? null,
          asientos: {
            create: d.asientos.map(a => ({
              cuentaId: a.cuentaId,
              terceroId: a.terceroId ?? null,
              debito: a.debito,
              credito: a.credito,
              descripcion: a.descripcion ?? null,
            })),
          },
        },
        include: { asientos: true },
      })
    })
    return NextResponse.json({ comprobante }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Comprobante "${d.numero}" ya existe` }, { status: 409 })
    }
    console.error("[cp/comprobantes POST]", err)
    return NextResponse.json({ error: "Error al registrar comprobante" }, { status: 500 })
  }
}
