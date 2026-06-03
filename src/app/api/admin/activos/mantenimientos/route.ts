import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireActivosBienes } from "@/lib/frisco-guard"
import { activoMantenimientoSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const activoId = searchParams.get('activoId')
  const tipo     = searchParams.get('tipo')

  const prisma = await getTenantPrisma()
  const rows = await prisma.activoMantenimiento.findMany({
    where: {
      ...(activoId ? { activoId } : {}),
      ...(tipo     ? { tipo: tipo as never } : {}),
    },
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
  const v = validateBody(activoMantenimientoSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const bien = await prisma.activoBien.findUnique({ where: { id: v.data.activoId } })
  if (!bien) return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })

  const mnt = await prisma.$transaction(async (tx) => {
    const m = await tx.activoMantenimiento.create({
      data: {
        activoId:             v.data.activoId,
        tipo:                 v.data.tipo,
        fecha:                new Date(v.data.fecha),
        descripcion:          v.data.descripcion,
        proveedor:            v.data.proveedor ?? null,
        costo:                v.data.costo ?? null,
        proximoMantenimiento: v.data.proximoMantenimiento ? new Date(v.data.proximoMantenimiento) : null,
        creadoPor:            guard.user?.id ?? null,
      },
    })
    if (bien.estado === 'EN_SERVICIO') {
      await tx.activoBien.update({
        where: { id: v.data.activoId },
        data: { estado: 'EN_MANTENIMIENTO' },
      })
    }
    return m
  })

  return NextResponse.json(mnt, { status: 201 })
}
