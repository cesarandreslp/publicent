import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireAlmacen } from "@/lib/frisco-guard"
import { almEntradaSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const articuloId = searchParams.get('articuloId')

  const prisma = await getTenantPrisma()
  const rows = await prisma.almEntrada.findMany({
    where: { ...(articuloId ? { articuloId } : {}) },
    include: { articulo: { select: { codigo: true, nombre: true, unidad: true } } },
    orderBy: { fechaEntrada: 'desc' },
    take: 200,
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const guard = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(almEntradaSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const art = await prisma.almArticulo.findUnique({ where: { id: v.data.articuloId } })
  if (!art) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })
  if (!art.activo) return NextResponse.json({ error: 'El artículo está inactivo' }, { status: 409 })

  const entrada = await prisma.$transaction(async (tx) => {
    const e = await tx.almEntrada.create({
      data: {
        articuloId:        v.data.articuloId,
        tipo:              v.data.tipo,
        cantidad:          v.data.cantidad,
        valorUnitario:     v.data.valorUnitario ?? null,
        fechaEntrada:      new Date(v.data.fechaEntrada),
        ordenCompraNumero: v.data.ordenCompraNumero ?? null,
        facturaNumero:     v.data.facturaNumero ?? null,
        proveedor:         v.data.proveedor ?? null,
        observacion:       v.data.observacion ?? null,
        creadoPor:         guard.user?.id ?? null,
      },
    })
    await tx.almArticulo.update({
      where: { id: v.data.articuloId },
      data: { stockActual: { increment: v.data.cantidad } },
    })
    return e
  })

  return NextResponse.json(entrada, { status: 201 })
}
