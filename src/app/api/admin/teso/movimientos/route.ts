import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"
import { tesoMovimientoCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const cuentaId    = searchParams.get('cuentaId')
  const conciliado  = searchParams.get('conciliado')
  const take        = Math.min(Number(searchParams.get('take') ?? 100), 500)

  const prisma = await getTenantPrisma()
  const movimientos = await prisma.tesoMovimiento.findMany({
    where: {
      ...(cuentaId   ? { cuentaId } : {}),
      ...(conciliado !== null ? { conciliado: conciliado === 'true' } : {}),
    },
    orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
    take,
  })
  return NextResponse.json(movimientos)
}

export async function POST(req: NextRequest) {
  const guard = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(tesoMovimientoCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const cuenta = await prisma.tesoCuenta.findUnique({ where: { id: v.data.cuentaId } })
  if (!cuenta || !cuenta.activa)
    return NextResponse.json({ error: 'Cuenta no encontrada o inactiva' }, { status: 400 })

  const mov = await prisma.tesoMovimiento.create({
    data: {
      cuentaId:      v.data.cuentaId,
      tipo:          v.data.tipo,
      fecha:         new Date(v.data.fecha),
      valor:         v.data.valor,
      descripcion:   v.data.descripcion,
      numero:        v.data.numero ?? null,
      tercero:       v.data.tercero ?? null,
      terceroNit:    v.data.terceroNit ?? null,
      comprobanteId: v.data.comprobanteId ?? null,
      pagoPresupId:  v.data.pagoPresupId ?? null,
      creadoPor:     guard.user?.id ?? null,
    },
  })
  return NextResponse.json(mov, { status: 201 })
}
