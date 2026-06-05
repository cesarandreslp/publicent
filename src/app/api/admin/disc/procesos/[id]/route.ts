/**
 * /api/admin/disc/procesos/[id]
 * GET   — detalle del proceso (con actuaciones, documentos, tutelas)
 * PATCH — actualizar datos del proceso (no el estado: eso va por /avanzar)
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discProcesoUpdateSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const proceso = await prisma.discProceso.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, nombre: true, apellido: true } },
      actuaciones: {
        orderBy: { fecha: 'desc' },
        include: { usuario: { select: { id: true, nombre: true, apellido: true } } },
      },
      documentos: { orderBy: { createdAt: 'desc' } },
      tutelas: { select: { id: true, numero: true, estado: true, accionante: true } },
    },
  })

  if (!proceso) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })
  return NextResponse.json(proceso)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const v = validateBody(discProcesoUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const existe = await prisma.discProceso.findUnique({ where: { id }, select: { id: true, numero: true } })
  if (!existe) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })

  const proceso = await prisma.discProceso.update({
    where: { id },
    data: {
      ...(v.data.quejoso             !== undefined ? { quejoso: v.data.quejoso } : {}),
      ...(v.data.disciplinadoNombre  !== undefined ? { disciplinadoNombre: v.data.disciplinadoNombre } : {}),
      ...(v.data.disciplinadoCargo   !== undefined ? { disciplinadoCargo: v.data.disciplinadoCargo } : {}),
      ...(v.data.disciplinadoEntidad !== undefined ? { disciplinadoEntidad: v.data.disciplinadoEntidad } : {}),
      ...(v.data.hechos              !== undefined ? { hechos: v.data.hechos } : {}),
      ...(v.data.normaInfringida     !== undefined ? { normaInfringida: v.data.normaInfringida } : {}),
      ...(v.data.calificacionFalta   !== undefined ? { calificacionFalta: v.data.calificacionFalta } : {}),
      ...(v.data.sancion             !== undefined ? { sancion: v.data.sancion } : {}),
      ...(v.data.sancionDetalle      !== undefined ? { sancionDetalle: v.data.sancionDetalle } : {}),
      ...(v.data.instructorId        !== undefined ? { instructorId: v.data.instructorId } : {}),
      ...(v.data.expedienteGdId      !== undefined ? { expedienteGdId: v.data.expedienteGdId } : {}),
    },
  })

  try {
    await registrarAuditoria({
      accion: 'UPDATE',
      entidad: 'DiscProceso',
      entidadId: id,
      usuarioId: guard.user?.id,
      descripcion: `Actualización del proceso ${existe.numero}`,
    })
  } catch { /* no crítico */ }

  return NextResponse.json(proceso)
}
