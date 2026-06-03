import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireAlmacen } from "@/lib/frisco-guard"
import { almSalidaSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const articuloId = searchParams.get('articuloId')

  const prisma = await getTenantPrisma()
  const rows = await prisma.almSalida.findMany({
    where: { ...(articuloId ? { articuloId } : {}) },
    include: { articulo: { select: { codigo: true, nombre: true, unidad: true } } },
    orderBy: { fechaSalida: 'desc' },
    take: 200,
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const guard = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(almSalidaSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const art = await prisma.almArticulo.findUnique({ where: { id: v.data.articuloId } })
  if (!art) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })
  if (!art.activo) return NextResponse.json({ error: 'El artículo está inactivo' }, { status: 409 })
  if (art.stockActual < v.data.cantidad) {
    return NextResponse.json({ error: `Stock insuficiente. Disponible: ${art.stockActual} ${art.unidad}` }, { status: 409 })
  }

  const salida = await prisma.$transaction(async (tx) => {
    const s = await tx.almSalida.create({
      data: {
        articuloId:        v.data.articuloId,
        cantidad:          v.data.cantidad,
        fechaSalida:       new Date(v.data.fechaSalida),
        dependenciaNombre: v.data.dependenciaNombre ?? null,
        funcionarioNombre: v.data.funcionarioNombre ?? null,
        actaNumero:        v.data.actaNumero ?? null,
        observacion:       v.data.observacion ?? null,
        creadoPor:         guard.user?.id ?? null,
      },
    })
    await tx.almArticulo.update({
      where: { id: v.data.articuloId },
      data: { stockActual: { decrement: v.data.cantidad } },
    })
    return s
  })

  return NextResponse.json(salida, { status: 201 })
}
