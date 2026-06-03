import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"
import { renConceptoUpdateSchema, validateBody } from "@/lib/validations"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error
  const { id } = await params
  const v = validateBody(renConceptoUpdateSchema, await req.json())
  if (!v.success) return v.response
  const prisma = await getTenantPrisma()
  const row = await prisma.renConcepto.update({
    where: { id },
    data: {
      ...(v.data.codigo       !== undefined ? { codigo:       v.data.codigo }       : {}),
      ...(v.data.nombre       !== undefined ? { nombre:       v.data.nombre }       : {}),
      ...(v.data.descripcion  !== undefined ? { descripcion:  v.data.descripcion }  : {}),
      ...(v.data.tipo         !== undefined ? { tipo:         v.data.tipo }         : {}),
      ...(v.data.periodicidad !== undefined ? { periodicidad: v.data.periodicidad } : {}),
      ...(v.data.tasaBase     !== undefined ? { tasaBase:     v.data.tasaBase }     : {}),
      ...(v.data.activo       !== undefined ? { activo:       v.data.activo }       : {}),
    },
  })
  return NextResponse.json(row)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error
  void req
  const { id } = await params
  const prisma = await getTenantPrisma()
  const c = await prisma.renConcepto.findUnique({ where: { id }, include: { _count: { select: { liquidaciones: true } } } })
  if (!c) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (c._count.liquidaciones > 0) return NextResponse.json({ error: 'Tiene liquidaciones asociadas. Inactívelo en su lugar.' }, { status: 409 })
  await prisma.renConcepto.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
