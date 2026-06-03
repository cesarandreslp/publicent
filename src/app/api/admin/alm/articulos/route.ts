import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireAlmacen } from "@/lib/frisco-guard"
import { almArticuloCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const categoria    = searchParams.get('categoria')
  const soloActivos  = searchParams.get('activo') !== 'false'
  const soloAlertas  = searchParams.get('alertas') === 'true'
  const q            = searchParams.get('q')

  const prisma = await getTenantPrisma()
  const articulos = await prisma.almArticulo.findMany({
    where: {
      activo: soloActivos,
      ...(categoria ? { categoria: categoria as never } : {}),
      ...(q ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { codigo: { contains: q, mode: 'insensitive' } },
          { marca:  { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    orderBy: { nombre: 'asc' },
    take: 500,
  })
  const result = soloAlertas ? articulos.filter(a => a.stockActual <= a.stockMinimo) : articulos
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const guard = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(almArticuloCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const existe = await prisma.almArticulo.findUnique({ where: { codigo: v.data.codigo } })
  if (existe) return NextResponse.json({ error: 'Ya existe un artículo con ese código' }, { status: 409 })

  const art = await prisma.almArticulo.create({
    data: {
      codigo:          v.data.codigo,
      nombre:          v.data.nombre,
      descripcion:     v.data.descripcion ?? null,
      unidad:          v.data.unidad,
      categoria:       v.data.categoria,
      marca:           v.data.marca ?? null,
      stockMinimo:     v.data.stockMinimo ?? 0,
      ubicacionBodega: v.data.ubicacionBodega ?? null,
      imagenUrl:       v.data.imagenUrl ?? null,
      creadoPor:       guard.user?.id ?? null,
    },
  })
  return NextResponse.json(art, { status: 201 })
}
