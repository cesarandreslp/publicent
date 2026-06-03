import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireObservatorio } from "@/lib/frisco-guard"
import { obsIndicadorCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireObservatorio(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const categoria = searchParams.get('categoria')

  const prisma = await getTenantPrisma()
  const indicadores = await prisma.obsIndicador.findMany({
    where: { ...(categoria ? { categoria: categoria as never } : {}) },
    include: {
      mediciones: { orderBy: { fecha: 'desc' }, take: 12 },
      _count: { select: { mediciones: true } },
    },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
  })
  return NextResponse.json(indicadores)
}

export async function POST(req: NextRequest) {
  const guard = await requireObservatorio(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(obsIndicadorCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const existe = await prisma.obsIndicador.findUnique({ where: { codigo: v.data.codigo } })
  if (existe) return NextResponse.json({ error: 'Ya existe un indicador con ese código' }, { status: 409 })

  const ind = await prisma.obsIndicador.create({
    data: {
      codigo:            v.data.codigo,
      nombre:            v.data.nombre,
      descripcion:       v.data.descripcion ?? null,
      unidad:            v.data.unidad,
      categoria:         v.data.categoria,
      periodicidad:      v.data.periodicidad,
      meta:              v.data.meta,
      metaTipo:          v.data.metaTipo ?? 'MAYOR_ES_MEJOR',
      dependenciaNombre: v.data.dependenciaNombre ?? null,
      responsableNombre: v.data.responsableNombre ?? null,
      publicado:         v.data.publicado ?? true,
      orden:             v.data.orden ?? 0,
      creadoPor:         guard.user?.id ?? null,
    },
  })
  return NextResponse.json(ind, { status: 201 })
}
