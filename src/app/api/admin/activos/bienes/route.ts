import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireActivosBienes } from "@/lib/frisco-guard"
import { activoBienCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const categoria  = searchParams.get('categoria')
  const estado     = searchParams.get('estado')
  const q          = searchParams.get('q')
  const take       = Math.min(parseInt(searchParams.get('take') ?? '200'), 500)

  const prisma = await getTenantPrisma()
  const bienes = await prisma.activoBien.findMany({
    where: {
      ...(categoria ? { categoria: categoria as never } : {}),
      ...(estado    ? { estado:    estado    as never } : {}),
      ...(q ? {
        OR: [
          { nombre:   { contains: q, mode: 'insensitive' } },
          { codigo:   { contains: q, mode: 'insensitive' } },
          { serial:   { contains: q, mode: 'insensitive' } },
          { marca:    { contains: q, mode: 'insensitive' } },
          { ubicacion:{ contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: { _count: { select: { asignaciones: true, mantenimientos: true } } },
    orderBy: { createdAt: 'desc' },
    take,
  })
  return NextResponse.json(bienes)
}

export async function POST(req: NextRequest) {
  const guard = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(activoBienCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  // Verificar código único
  const existe = await prisma.activoBien.findUnique({ where: { codigo: v.data.codigo } })
  if (existe) return NextResponse.json({ error: 'Ya existe un activo con ese código' }, { status: 409 })

  const bien = await prisma.activoBien.create({
    data: {
      codigo:            v.data.codigo,
      nombre:            v.data.nombre,
      descripcion:       v.data.descripcion ?? null,
      categoria:         v.data.categoria,
      tipo:              v.data.tipo ?? null,
      marca:             v.data.marca ?? null,
      modelo:            v.data.modelo ?? null,
      serial:            v.data.serial ?? null,
      color:             v.data.color ?? null,
      valorAdquisicion:  v.data.valorAdquisicion ?? null,
      fechaAdquisicion:  v.data.fechaAdquisicion ? new Date(v.data.fechaAdquisicion) : null,
      vidaUtilAnios:     v.data.vidaUtilAnios ?? null,
      dependenciaId:     v.data.dependenciaId ?? null,
      dependenciaNombre: v.data.dependenciaNombre ?? null,
      responsableId:     v.data.responsableId ?? null,
      responsableNombre: v.data.responsableNombre ?? null,
      ubicacion:         v.data.ubicacion ?? null,
      estado:            v.data.estado ?? 'EN_SERVICIO',
      imagenUrl:         v.data.imagenUrl ?? null,
      observaciones:     v.data.observaciones ?? null,
      creadoPor:         guard.user?.id ?? null,
    },
  })
  return NextResponse.json(bien, { status: 201 })
}
