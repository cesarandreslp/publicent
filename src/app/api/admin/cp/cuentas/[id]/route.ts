/**
 * /api/admin/cp/cuentas/[id] — PATCH y DELETE de cuenta.
 * DELETE en realidad inactiva (activa=false). No se borra si tiene asientos.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { cpCuentaUpdateSchema, validateBody } from "@/lib/validations"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(cpCuentaUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const cuenta = await prisma.cpPlanCuenta.update({
    where: { id },
    data: v.data,
  })
  return NextResponse.json({ cuenta })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const movimientos = await prisma.cpAsiento.count({ where: { cuentaId: id } })
  if (movimientos > 0) {
    await prisma.cpPlanCuenta.update({ where: { id }, data: { activa: false } })
    return NextResponse.json({ inactivada: true, movimientos })
  }
  await prisma.cpPlanCuenta.delete({ where: { id } })
  return NextResponse.json({ eliminada: true })
}
