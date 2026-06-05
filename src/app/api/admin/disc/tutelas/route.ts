/**
 * /api/admin/disc/tutelas
 * GET  — listar tutelas (filtros: estado, q)
 * POST — registrar una tutela para acompañamiento
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discTutelaCreateSchema, validateBody } from "@/lib/validations"
import { generarNumeroTutela } from "@/lib/disc-consecutivo"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const estado = searchParams.get('estado')
  const q      = searchParams.get('q')?.trim()
  const take   = Math.min(parseInt(searchParams.get('take') ?? '200'), 500)

  const where: Prisma.DiscTutelaWhereInput = {}
  if (estado) where.estado = estado as Prisma.DiscTutelaWhereInput['estado']
  if (q) {
    where.OR = [
      { numero:           { contains: q, mode: 'insensitive' } },
      { accionante:       { contains: q, mode: 'insensitive' } },
      { accionado:        { contains: q, mode: 'insensitive' } },
      { derechoVulnerado: { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const tutelas = await prisma.discTutela.findMany({
    where,
    include: {
      funcionario: { select: { id: true, nombre: true, apellido: true } },
      _count: { select: { documentos: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
  })
  return NextResponse.json(tutelas)
}

export async function POST(req: NextRequest) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json().catch(() => null)
  const v = validateBody(discTutelaCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const tenantId = await getTenantId()
  const anio = new Date().getFullYear()
  const numero = await generarNumeroTutela(anio)

  const tutela = await prisma.discTutela.create({
    data: {
      tenantId,
      numero,
      anio,
      accionante:       v.data.accionante,
      accionado:        v.data.accionado,
      derechoVulnerado: v.data.derechoVulnerado,
      juzgado:          v.data.juzgado ?? null,
      estado:           'RECIBIDA',
      fechaRecepcion:   new Date(v.data.fechaRecepcion),
      fechaVencimiento: v.data.fechaVencimiento ? new Date(v.data.fechaVencimiento) : null,
      procesoId:        v.data.procesoId ?? null,
      funcionarioId:    v.data.funcionarioId ?? null,
      observaciones:    v.data.observaciones ?? null,
    },
  })

  try {
    await registrarAuditoria({
      accion: 'CREATE',
      entidad: 'DiscTutela',
      entidadId: tutela.id,
      usuarioId: guard.user?.id,
      descripcion: `Registro de tutela ${numero}`,
    })
  } catch { /* no crítico */ }

  return NextResponse.json(tutela, { status: 201 })
}
