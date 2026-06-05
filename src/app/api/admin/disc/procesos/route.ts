/**
 * /api/admin/disc/procesos
 * GET  — listar procesos (filtros: estado, tipo, instructor, q)
 * POST — abrir un nuevo proceso disciplinario
 *
 * Gateado por el módulo `funcion_disciplinaria`.
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discProcesoCreateSchema, validateBody } from "@/lib/validations"
import { generarNumeroProceso } from "@/lib/disc-consecutivo"
import { calcularFechaVencimientoEtapa, calcularTerminoEtapa, ACTUACION_POR_ESTADO } from "@/lib/disc-terminos"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const estado      = searchParams.get('estado')
  const tipo        = searchParams.get('tipo')
  const instructorId = searchParams.get('instructorId')
  const q           = searchParams.get('q')?.trim()
  const take        = Math.min(parseInt(searchParams.get('take') ?? '200'), 500)

  const where: Prisma.DiscProcesoWhereInput = {}
  if (estado)       where.estado = estado as Prisma.DiscProcesoWhereInput['estado']
  if (tipo)         where.tipo = tipo as Prisma.DiscProcesoWhereInput['tipo']
  if (instructorId) where.instructorId = instructorId
  if (q) {
    where.OR = [
      { numero:             { contains: q, mode: 'insensitive' } },
      { disciplinadoNombre: { contains: q, mode: 'insensitive' } },
      { disciplinadoCargo:  { contains: q, mode: 'insensitive' } },
      { quejoso:            { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const procesos = await prisma.discProceso.findMany({
    where,
    include: {
      instructor: { select: { id: true, nombre: true, apellido: true } },
      _count: { select: { actuaciones: true, documentos: true, tutelas: true } },
    },
    orderBy: { createdAt: 'desc' },
    take,
  })
  return NextResponse.json(procesos)
}

export async function POST(req: NextRequest) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json().catch(() => null)
  const v = validateBody(discProcesoCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const tenantId = await getTenantId()
  const anio = new Date().getFullYear()
  const numero = await generarNumeroProceso(anio)

  // El proceso nace en INDAGACION_PRELIMINAR: calcular su término inicial.
  const fechaInicio = new Date()
  const fechaVencimiento = await calcularFechaVencimientoEtapa(fechaInicio, 'INDAGACION_PRELIMINAR', v.data.tipo)
  const terminoDiasHabiles = calcularTerminoEtapa('INDAGACION_PRELIMINAR', v.data.tipo)

  const proceso = await prisma.discProceso.create({
    data: {
      tenantId,
      numero,
      anio,
      tipo:                v.data.tipo,
      estado:              'INDAGACION_PRELIMINAR',
      quejoso:             v.data.anonima ? null : (v.data.quejoso ?? null),
      anonima:             v.data.anonima ?? false,
      disciplinadoNombre:  v.data.disciplinadoNombre,
      disciplinadoCargo:   v.data.disciplinadoCargo,
      disciplinadoEntidad: v.data.disciplinadoEntidad,
      hechos:              v.data.hechos,
      normaInfringida:     v.data.normaInfringida ?? null,
      calificacionFalta:   v.data.calificacionFalta ?? null,
      fechaQueja:          new Date(v.data.fechaQueja),
      terminoDiasHabiles:  terminoDiasHabiles || null,
      fechaVencimiento,
      instructorId:        v.data.instructorId ?? null,
      expedienteGdId:      v.data.expedienteGdId ?? null,
      // Actuación de apertura automática
      actuaciones: {
        create: {
          tipo:        'INDAGACION_PRELIMINAR',
          descripcion: ACTUACION_POR_ESTADO.INDAGACION_PRELIMINAR,
          usuarioId:   guard.user!.id,
        },
      },
    },
  })

  try {
    await registrarAuditoria({
      accion: 'CREATE',
      entidad: 'DiscProceso',
      entidadId: proceso.id,
      usuarioId: guard.user?.id,
      descripcion: `Apertura de proceso disciplinario ${numero}`,
    })
  } catch { /* auditoría no crítica */ }

  return NextResponse.json(proceso, { status: 201 })
}
