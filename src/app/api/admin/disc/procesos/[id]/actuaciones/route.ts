/**
 * /api/admin/disc/procesos/[id]/actuaciones
 * GET  — listar actuaciones del proceso
 * POST — registrar una actuación manual
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discActuacionSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const actuaciones = await prisma.discActuacion.findMany({
    where: { procesoId: id },
    orderBy: { fecha: 'desc' },
    include: { usuario: { select: { id: true, nombre: true, apellido: true } } },
  })
  return NextResponse.json(actuaciones)
}

export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const v = validateBody(discActuacionSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const proceso = await prisma.discProceso.findUnique({ where: { id }, select: { id: true, numero: true } })
  if (!proceso) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })

  const actuacion = await prisma.discActuacion.create({
    data: {
      procesoId:   id,
      tipo:        v.data.tipo,
      descripcion: v.data.descripcion,
      fecha:       v.data.fecha ? new Date(v.data.fecha) : new Date(),
      usuarioId:   guard.user!.id,
    },
    include: { usuario: { select: { id: true, nombre: true, apellido: true } } },
  })

  try {
    await registrarAuditoria({
      accion: 'CREATE',
      entidad: 'DiscActuacion',
      entidadId: actuacion.id,
      usuarioId: guard.user?.id,
      descripcion: `Actuación en proceso ${proceso.numero}: ${v.data.tipo}`,
    })
  } catch { /* no crítico */ }

  return NextResponse.json(actuacion, { status: 201 })
}
