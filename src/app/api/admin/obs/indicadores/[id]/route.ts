import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireObservatorio } from "@/lib/frisco-guard"
import { obsIndicadorUpdateSchema, validateBody } from "@/lib/validations"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireObservatorio(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json()
  const v = validateBody(obsIndicadorUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  if (v.data.codigo) {
    const existe = await prisma.obsIndicador.findFirst({ where: { codigo: v.data.codigo, NOT: { id } } })
    if (existe) return NextResponse.json({ error: 'Ese código ya está en uso' }, { status: 409 })
  }

  const ind = await prisma.obsIndicador.update({
    where: { id },
    data: {
      ...(v.data.codigo            !== undefined ? { codigo:            v.data.codigo }            : {}),
      ...(v.data.nombre            !== undefined ? { nombre:            v.data.nombre }            : {}),
      ...(v.data.descripcion       !== undefined ? { descripcion:       v.data.descripcion }       : {}),
      ...(v.data.unidad            !== undefined ? { unidad:            v.data.unidad }            : {}),
      ...(v.data.categoria         !== undefined ? { categoria:         v.data.categoria }         : {}),
      ...(v.data.periodicidad      !== undefined ? { periodicidad:      v.data.periodicidad }      : {}),
      ...(v.data.meta              !== undefined ? { meta:              v.data.meta }              : {}),
      ...(v.data.metaTipo          !== undefined ? { metaTipo:          v.data.metaTipo }          : {}),
      ...(v.data.dependenciaNombre !== undefined ? { dependenciaNombre: v.data.dependenciaNombre } : {}),
      ...(v.data.responsableNombre !== undefined ? { responsableNombre: v.data.responsableNombre } : {}),
      ...(v.data.publicado         !== undefined ? { publicado:         v.data.publicado }         : {}),
      ...(v.data.orden             !== undefined ? { orden:             v.data.orden }             : {}),
    },
  })
  return NextResponse.json(ind)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireObservatorio(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  await prisma.obsIndicador.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
