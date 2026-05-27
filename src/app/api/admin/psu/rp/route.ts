/**
 * /api/admin/psu/rp — Registros Presupuestales (compromisos).
 * Afecta a un CDP. Valida saldo del CDP y que no esté ANULADO.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { psuRpCreateSchema, validateBody } from "@/lib/validations"
import { saldoCdp } from "@/lib/presupuesto-saldos"

export async function GET(req: NextRequest) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const cdpId = searchParams.get('cdpId') ?? undefined

  const prisma = await getTenantPrisma()
  const rps = await prisma.psuRp.findMany({
    where: { ...(cdpId ? { cdpId } : {}) },
    include: {
      cdp: { select: { numero: true, rubro: { select: { codigo: true } } } },
      tercero: { select: { documento: true, razonSocial: true } },
      _count: { select: { obligaciones: true } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  })
  return NextResponse.json({ rps })
}

export async function POST(req: Request) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(psuRpCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  const saldo = await saldoCdp(prisma, d.cdpId)
  if (!saldo) return NextResponse.json({ error: "CDP no encontrado" }, { status: 404 })
  if (saldo.cdp.estado === 'ANULADO') {
    return NextResponse.json({ error: "El CDP está anulado" }, { status: 409 })
  }
  if (d.valor > saldo.disponible + 0.005) {
    return NextResponse.json(
      { error: `Saldo CDP insuficiente. Disponible: ${saldo.disponible.toFixed(2)}` },
      { status: 409 }
    )
  }

  try {
    const rp = await prisma.psuRp.create({
      data: {
        numero: d.numero,
        fecha: new Date(d.fecha),
        cdpId: d.cdpId,
        terceroId: d.terceroId ?? null,
        valor: d.valor,
        objeto: d.objeto,
        creadoPor: guard.user?.id ?? null,
      },
    })
    return NextResponse.json({ rp }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `RP "${d.numero}" ya existe` }, { status: 409 })
    }
    console.error("[psu/rp POST]", err)
    return NextResponse.json({ error: "Error al crear RP" }, { status: 500 })
  }
}
