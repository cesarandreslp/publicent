/**
 * /api/admin/disc/visitas
 * GET  — listar visitas preventivas (filtros: q)
 * POST — registrar una visita preventiva
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discVisitaCreateSchema, validateBody } from "@/lib/validations"
import { generarNumeroVisita } from "@/lib/disc-consecutivo"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const q    = searchParams.get('q')?.trim()
  const take = Math.min(parseInt(searchParams.get('take') ?? '200'), 500)

  const where: Prisma.DiscVisitaPreventivaWhereInput = {}
  if (q) {
    where.OR = [
      { numero:          { contains: q, mode: 'insensitive' } },
      { entidadVisitada: { contains: q, mode: 'insensitive' } },
      { objetivo:        { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const visitas = await prisma.discVisitaPreventiva.findMany({
    where,
    include: { funcionario: { select: { id: true, nombre: true, apellido: true } } },
    orderBy: { fecha: 'desc' },
    take,
  })
  return NextResponse.json(visitas)
}

export async function POST(req: NextRequest) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json().catch(() => null)
  const v = validateBody(discVisitaCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const tenantId = await getTenantId()
  const anio = new Date().getFullYear()
  const numero = await generarNumeroVisita(anio)

  const visita = await prisma.discVisitaPreventiva.create({
    data: {
      tenantId,
      numero,
      entidadVisitada:  v.data.entidadVisitada,
      dependencia:      v.data.dependencia ?? null,
      fecha:            new Date(v.data.fecha),
      objetivo:         v.data.objetivo,
      hallazgos:        v.data.hallazgos,
      recomendaciones:  v.data.recomendaciones ?? null,
      compromisos:      v.data.compromisos ?? null,
      fechaSeguimiento: v.data.fechaSeguimiento ? new Date(v.data.fechaSeguimiento) : null,
      funcionarioId:    v.data.funcionarioId ?? guard.user!.id,
    },
  })

  try {
    await registrarAuditoria({
      accion: 'CREATE',
      entidad: 'DiscVisitaPreventiva',
      entidadId: visita.id,
      usuarioId: guard.user?.id,
      descripcion: `Registro de visita preventiva ${numero}`,
    })
  } catch { /* no crítico */ }

  return NextResponse.json(visita, { status: 201 })
}
