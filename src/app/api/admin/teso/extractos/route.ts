import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"
import { tesoExtractoCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const cuentaId = searchParams.get('cuentaId')

  const prisma = await getTenantPrisma()
  const extractos = await prisma.tesoExtracto.findMany({
    where: cuentaId ? { cuentaId } : {},
    include: { _count: { select: { lineas: true } } },
    orderBy: { periodo: 'desc' },
    take: 24,
  })
  return NextResponse.json(extractos)
}

export async function POST(req: NextRequest) {
  const guard = await requireTesoreria(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(tesoExtractoCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const cuenta = await prisma.tesoCuenta.findUnique({ where: { id: v.data.cuentaId } })
  if (!cuenta || !cuenta.activa)
    return NextResponse.json({ error: 'Cuenta no encontrada o inactiva' }, { status: 400 })

  const existe = await prisma.tesoExtracto.findUnique({
    where: { cuentaId_periodo: { cuentaId: v.data.cuentaId, periodo: v.data.periodo } },
  })
  if (existe)
    return NextResponse.json({ error: `Ya existe un extracto para ${v.data.periodo}` }, { status: 409 })

  const extracto = await prisma.tesoExtracto.create({
    data: {
      cuentaId:     v.data.cuentaId,
      periodo:      v.data.periodo,
      saldoInicial: v.data.saldoInicial,
      saldoFinal:   v.data.saldoFinal,
      observacion:  v.data.observacion ?? null,
      cargadoPor:   guard.user?.id ?? null,
      lineas: {
        create: v.data.lineas.map(l => ({
          fecha:       new Date(l.fecha),
          descripcion: l.descripcion,
          referencia:  l.referencia ?? null,
          debito:      l.debito ?? null,
          credito:     l.credito ?? null,
          saldo:       l.saldo ?? null,
        })),
      },
    },
    include: { lineas: true },
  })
  return NextResponse.json(extracto, { status: 201 })
}
