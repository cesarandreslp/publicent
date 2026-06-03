import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireAlmacen } from "@/lib/frisco-guard"
import { almArticuloUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const art = await prisma.almArticulo.findUnique({
    where: { id },
    include: {
      entradas: { orderBy: { fechaEntrada: 'desc' }, take: 50 },
      salidas:  { orderBy: { fechaSalida:  'desc' }, take: 50 },
    },
  })
  if (!art) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(art)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json()
  const v = validateBody(almArticuloUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  if (v.data.codigo) {
    const existe = await prisma.almArticulo.findFirst({ where: { codigo: v.data.codigo, NOT: { id } } })
    if (existe) return NextResponse.json({ error: 'Ese código ya está en uso' }, { status: 409 })
  }

  const art = await prisma.almArticulo.update({
    where: { id },
    data: {
      ...(v.data.codigo          !== undefined ? { codigo:          v.data.codigo }          : {}),
      ...(v.data.nombre          !== undefined ? { nombre:          v.data.nombre }          : {}),
      ...(v.data.descripcion     !== undefined ? { descripcion:     v.data.descripcion }     : {}),
      ...(v.data.unidad          !== undefined ? { unidad:          v.data.unidad }          : {}),
      ...(v.data.categoria       !== undefined ? { categoria:       v.data.categoria }       : {}),
      ...(v.data.marca           !== undefined ? { marca:           v.data.marca }           : {}),
      ...(v.data.stockMinimo     !== undefined ? { stockMinimo:     v.data.stockMinimo }     : {}),
      ...(v.data.ubicacionBodega !== undefined ? { ubicacionBodega: v.data.ubicacionBodega } : {}),
      ...(v.data.imagenUrl       !== undefined ? { imagenUrl:       v.data.imagenUrl }       : {}),
      ...(v.data.activo          !== undefined ? { activo:          v.data.activo }          : {}),
    },
  })
  return NextResponse.json(art)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAlmacen(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()

  const art = await prisma.almArticulo.findUnique({
    where: { id },
    include: { _count: { select: { entradas: true, salidas: true } } },
  })
  if (!art) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  if (art._count.entradas > 0 || art._count.salidas > 0) {
    return NextResponse.json({ error: 'No se puede eliminar un artículo con movimientos. Inactívelo en su lugar.' }, { status: 409 })
  }

  await prisma.almArticulo.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
