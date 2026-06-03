import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"
import { tesoCuentaUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const cuenta = await prisma.tesoCuenta.findUnique({
    where: { id },
    include: {
      movimientos: { orderBy: { fecha: 'desc' }, take: 50 },
      extractos:   { orderBy: { periodo: 'desc' }, take: 12 },
    },
  })
  if (!cuenta) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
  return NextResponse.json(cuenta)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const v = validateBody(tesoCuentaUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const cuenta = await prisma.tesoCuenta.update({ where: { id }, data: v.data })
  return NextResponse.json(cuenta)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const count = await prisma.tesoMovimiento.count({ where: { cuentaId: id } })
  if (count > 0) {
    await prisma.tesoCuenta.update({ where: { id }, data: { activa: false } })
    return NextResponse.json({ inactivada: true })
  }
  await prisma.tesoCuenta.delete({ where: { id } })
  return NextResponse.json({ eliminada: true })
}
