import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { cpTerceroUpdateSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(cpTerceroUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  try {
    const tercero = await prisma.cpAuxiliarTercero.update({
      where: { id },
      data: v.data,
    })
    return NextResponse.json({ tercero })
  } catch {
    return NextResponse.json({ error: "Tercero no encontrado" }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()

  // Inactivar si tiene asientos; borrar si no
  const count = await prisma.cpAsiento.count({ where: { terceroId: id } })
  if (count > 0) {
    await prisma.cpAuxiliarTercero.update({ where: { id }, data: { activo: false } })
    return NextResponse.json({ inactivado: true })
  }
  await prisma.cpAuxiliarTercero.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
