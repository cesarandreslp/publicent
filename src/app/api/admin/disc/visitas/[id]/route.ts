/**
 * /api/admin/disc/visitas/[id]
 * GET   — detalle de la visita preventiva
 * PATCH — actualizar (seguimiento, hallazgos, etc.)
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discVisitaUpdateSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const visita = await prisma.discVisitaPreventiva.findUnique({
    where: { id },
    include: { funcionario: { select: { id: true, nombre: true, apellido: true } } },
  })
  if (!visita) return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })
  return NextResponse.json(visita)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const v = validateBody(discVisitaUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const existe = await prisma.discVisitaPreventiva.findUnique({ where: { id }, select: { id: true, numero: true } })
  if (!existe) return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })

  const visita = await prisma.discVisitaPreventiva.update({
    where: { id },
    data: {
      ...(v.data.entidadVisitada   !== undefined ? { entidadVisitada: v.data.entidadVisitada } : {}),
      ...(v.data.dependencia       !== undefined ? { dependencia: v.data.dependencia } : {}),
      ...(v.data.fecha             !== undefined ? { fecha: new Date(v.data.fecha!) } : {}),
      ...(v.data.objetivo          !== undefined ? { objetivo: v.data.objetivo } : {}),
      ...(v.data.hallazgos         !== undefined ? { hallazgos: v.data.hallazgos } : {}),
      ...(v.data.recomendaciones   !== undefined ? { recomendaciones: v.data.recomendaciones } : {}),
      ...(v.data.compromisos       !== undefined ? { compromisos: v.data.compromisos } : {}),
      ...(v.data.fechaSeguimiento  !== undefined ? { fechaSeguimiento: v.data.fechaSeguimiento ? new Date(v.data.fechaSeguimiento) : null } : {}),
      ...(v.data.estadoSeguimiento !== undefined ? { estadoSeguimiento: v.data.estadoSeguimiento } : {}),
      ...(v.data.funcionarioId     !== undefined ? { funcionarioId: v.data.funcionarioId ?? undefined } : {}),
    },
  })

  try {
    await registrarAuditoria({
      accion: 'UPDATE',
      entidad: 'DiscVisitaPreventiva',
      entidadId: id,
      usuarioId: guard.user?.id,
      descripcion: `Actualización de visita ${existe.numero}`,
    })
  } catch { /* no crítico */ }

  return NextResponse.json(visita)
}
