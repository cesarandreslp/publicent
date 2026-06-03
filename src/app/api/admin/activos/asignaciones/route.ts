import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireActivosBienes } from "@/lib/frisco-guard"
import { activoAsignacionSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const activoId = searchParams.get('activoId')

  const prisma = await getTenantPrisma()
  const rows = await prisma.activoAsignacion.findMany({
    where: { ...(activoId ? { activoId } : {}) },
    orderBy: { fechaInicio: 'desc' },
    take: 100,
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const guard = await requireActivosBienes(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(activoAsignacionSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const bien = await prisma.activoBien.findUnique({ where: { id: v.data.activoId } })
  if (!bien) return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })

  const asignacion = await prisma.$transaction(async (tx) => {
    const a = await tx.activoAsignacion.create({
      data: {
        activoId:          v.data.activoId,
        funcionarioId:     v.data.funcionarioId ?? null,
        funcionarioNombre: v.data.funcionarioNombre,
        dependenciaNombre: v.data.dependenciaNombre ?? null,
        fechaInicio:       new Date(v.data.fechaInicio),
        fechaFin:          v.data.fechaFin ? new Date(v.data.fechaFin) : null,
        actaNumero:        v.data.actaNumero ?? null,
        observacion:       v.data.observacion ?? null,
        creadoPor:         guard.user?.id ?? null,
      },
    })
    // Actualizar responsable en el bien
    await tx.activoBien.update({
      where: { id: v.data.activoId },
      data: {
        responsableId:    v.data.funcionarioId ?? null,
        responsableNombre: v.data.funcionarioNombre,
        estado: 'EN_SERVICIO',
      },
    })
    return a
  })

  return NextResponse.json(asignacion, { status: 201 })
}
