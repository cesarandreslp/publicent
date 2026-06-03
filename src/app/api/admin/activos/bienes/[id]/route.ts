import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireActivosBienes } from "@/lib/frisco-guard"
import { activoBienUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const bien = await prisma.activoBien.findUnique({
    where: { id },
    include: {
      asignaciones:   { orderBy: { fechaInicio: 'desc' } },
      mantenimientos: { orderBy: { fecha: 'desc' } },
      movimientos:    { orderBy: { fecha: 'desc' } },
    },
  })
  if (!bien) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(bien)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json()
  const v = validateBody(activoBienUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  // Si cambia código, verificar unicidad
  if (v.data.codigo) {
    const existe = await prisma.activoBien.findFirst({ where: { codigo: v.data.codigo, NOT: { id } } })
    if (existe) return NextResponse.json({ error: 'Ese código ya está en uso' }, { status: 409 })
  }

  const bien = await prisma.activoBien.update({
    where: { id },
    data: {
      ...(v.data.codigo             !== undefined ? { codigo:            v.data.codigo }            : {}),
      ...(v.data.nombre             !== undefined ? { nombre:            v.data.nombre }            : {}),
      ...(v.data.descripcion        !== undefined ? { descripcion:       v.data.descripcion }       : {}),
      ...(v.data.categoria          !== undefined ? { categoria:         v.data.categoria }         : {}),
      ...(v.data.tipo               !== undefined ? { tipo:              v.data.tipo }              : {}),
      ...(v.data.marca              !== undefined ? { marca:             v.data.marca }             : {}),
      ...(v.data.modelo             !== undefined ? { modelo:            v.data.modelo }            : {}),
      ...(v.data.serial             !== undefined ? { serial:            v.data.serial }            : {}),
      ...(v.data.color              !== undefined ? { color:             v.data.color }             : {}),
      ...(v.data.valorAdquisicion   !== undefined ? { valorAdquisicion:  v.data.valorAdquisicion }  : {}),
      ...(v.data.fechaAdquisicion   !== undefined ? { fechaAdquisicion:  new Date(v.data.fechaAdquisicion!) } : {}),
      ...(v.data.vidaUtilAnios      !== undefined ? { vidaUtilAnios:     v.data.vidaUtilAnios }     : {}),
      ...(v.data.dependenciaId      !== undefined ? { dependenciaId:     v.data.dependenciaId }     : {}),
      ...(v.data.dependenciaNombre  !== undefined ? { dependenciaNombre: v.data.dependenciaNombre } : {}),
      ...(v.data.responsableId      !== undefined ? { responsableId:     v.data.responsableId }     : {}),
      ...(v.data.responsableNombre  !== undefined ? { responsableNombre: v.data.responsableNombre } : {}),
      ...(v.data.ubicacion          !== undefined ? { ubicacion:         v.data.ubicacion }         : {}),
      ...(v.data.estado             !== undefined ? { estado:            v.data.estado }            : {}),
      ...(v.data.imagenUrl          !== undefined ? { imagenUrl:         v.data.imagenUrl }         : {}),
      ...(v.data.observaciones      !== undefined ? { observaciones:     v.data.observaciones }     : {}),
    },
  })
  return NextResponse.json(bien)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()

  // Solo permite eliminar si está en DADO_DE_BAJA o EN_BODEGA y sin historial relevante
  const bien = await prisma.activoBien.findUnique({
    where: { id },
    include: { _count: { select: { movimientos: true } } },
  })
  if (!bien) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (bien._count.movimientos > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un activo con historial de movimientos. Dé de baja en su lugar.' }, { status: 409 })
  }

  await prisma.activoBien.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
