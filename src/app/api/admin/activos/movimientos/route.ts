import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireActivosBienes } from "@/lib/frisco-guard"
import { activoMovimientoSchema, validateBody } from "@/lib/validations"

const ESTADO_POR_MOVIMIENTO: Record<string, string> = {
  INGRESO:    'EN_SERVICIO',
  ASIGNACION: 'EN_SERVICIO',
  TRASLADO:   'EN_SERVICIO',
  DEVOLUCION: 'EN_BODEGA',
  BAJA:       'DADO_DE_BAJA',
  REINTEGRO:  'EN_SERVICIO',
}

export async function GET(req: NextRequest) {
  const { error } = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const activoId = searchParams.get('activoId')

  const prisma = await getTenantPrisma()
  const rows = await prisma.activoMovimiento.findMany({
    where: { ...(activoId ? { activoId } : {}) },
    include: { activo: { select: { codigo: true, nombre: true } } },
    orderBy: { fecha: 'desc' },
    take: 200,
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const guard = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(activoMovimientoSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const bien = await prisma.activoBien.findUnique({ where: { id: v.data.activoId } })
  if (!bien) return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })

  if (v.data.tipo === 'BAJA' && bien.estado === 'DADO_DE_BAJA') {
    return NextResponse.json({ error: 'El activo ya está dado de baja' }, { status: 409 })
  }

  const mov = await prisma.$transaction(async (tx) => {
    const m = await tx.activoMovimiento.create({
      data: {
        activoId:           v.data.activoId,
        tipo:               v.data.tipo,
        fecha:              new Date(v.data.fecha),
        descripcion:        v.data.descripcion,
        origenDependencia:  v.data.origenDependencia ?? null,
        destinoDependencia: v.data.destinoDependencia ?? null,
        actaNumero:         v.data.actaNumero ?? null,
        creadoPor:          guard.user?.id ?? null,
      },
    })
    await tx.activoBien.update({
      where: { id: v.data.activoId },
      data: { estado: ESTADO_POR_MOVIMIENTO[v.data.tipo] as never },
    })
    return m
  })

  return NextResponse.json(mov, { status: 201 })
}
