/**
 * /api/admin/disc/tutelas/[id]
 * GET   — detalle de la tutela
 * PATCH — actualizar estado/fallo/cumplimiento
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discTutelaUpdateSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const tutela = await prisma.discTutela.findUnique({
    where: { id },
    include: {
      funcionario: { select: { id: true, nombre: true, apellido: true } },
      proceso: { select: { id: true, numero: true } },
      documentos: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!tutela) return NextResponse.json({ error: 'Tutela no encontrada' }, { status: 404 })
  return NextResponse.json(tutela)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const v = validateBody(discTutelaUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const existe = await prisma.discTutela.findUnique({ where: { id }, select: { id: true, numero: true } })
  if (!existe) return NextResponse.json({ error: 'Tutela no encontrada' }, { status: 404 })

  const tutela = await prisma.discTutela.update({
    where: { id },
    data: {
      ...(v.data.estado             !== undefined ? { estado: v.data.estado } : {}),
      ...(v.data.juzgado            !== undefined ? { juzgado: v.data.juzgado } : {}),
      ...(v.data.fechaVencimiento   !== undefined ? { fechaVencimiento: v.data.fechaVencimiento ? new Date(v.data.fechaVencimiento) : null } : {}),
      ...(v.data.fechaFallo         !== undefined ? { fechaFallo: v.data.fechaFallo ? new Date(v.data.fechaFallo) : null } : {}),
      ...(v.data.falloSentido       !== undefined ? { falloSentido: v.data.falloSentido } : {}),
      ...(v.data.impugnada          !== undefined ? { impugnada: v.data.impugnada } : {}),
      ...(v.data.fechaImpugnacion   !== undefined ? { fechaImpugnacion: v.data.fechaImpugnacion ? new Date(v.data.fechaImpugnacion) : null } : {}),
      ...(v.data.estadoCumplimiento !== undefined ? { estadoCumplimiento: v.data.estadoCumplimiento } : {}),
      ...(v.data.observaciones      !== undefined ? { observaciones: v.data.observaciones } : {}),
      ...(v.data.funcionarioId      !== undefined ? { funcionarioId: v.data.funcionarioId } : {}),
    },
  })

  try {
    await registrarAuditoria({
      accion: 'UPDATE',
      entidad: 'DiscTutela',
      entidadId: id,
      usuarioId: guard.user?.id,
      descripcion: `Actualización de tutela ${existe.numero}`,
    })
  } catch { /* no crítico */ }

  return NextResponse.json(tutela)
}
