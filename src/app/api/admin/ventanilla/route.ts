/**
 * GET /api/admin/ventanilla
 * Bandeja de radicados VU para el funcionario autenticado.
 *
 * Filtros: tipo, estado, colorSemaforo, prioridad, asignadoId, search, page, limit
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from '@/lib/tenant'
import { auth } from '@/lib/auth'
import type { TipoPQRS, EstadoPQRS, PrioridadPQRS } from '@prisma/client'
import { calcularSemaforo } from '@/lib/groq-client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const vuActivo = await isTenantModuleActive(MODULO_IDS.VENTANILLA_UNICA)
  if (!vuActivo) {
    return NextResponse.json({ error: 'Módulo Ventanilla Única no activo' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page      = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
  const limit     = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))
  const search    = searchParams.get('search')    ?? ''
  const tipo      = searchParams.get('tipo')      ?? ''
  const estado    = searchParams.get('estado')    ?? ''
  const semaforo  = searchParams.get('semaforo')  ?? ''  // VERDE|AMARILLO|ROJO|NEGRO
  const prioridad = searchParams.get('prioridad') ?? ''
  const soloMios  = searchParams.get('soloMios')  === 'true'

  try {
    const prisma = await getTenantPrisma()
    const usuarioId = (session.user as any).id as string

    const where: any = {
      ...(search && {
        OR: [
          { radicado:          { contains: search, mode: 'insensitive' } },
          { asunto:            { contains: search, mode: 'insensitive' } },
          { nombreSolicitante: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(tipo      && { tipo:      tipo      as TipoPQRS }),
      ...(estado    && { estado:    estado    as EstadoPQRS }),
      ...(prioridad && { prioridad: prioridad as PrioridadPQRS }),
      ...(semaforo  && { colorSemaforo: semaforo as any }),
      ...(soloMios  && { asignadoId: usuarioId }),
    }

    const [pqrs, total] = await Promise.all([
      prisma.pQRS.findMany({
        where,
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: [
          { colorSemaforo: 'asc' },   // NEGRO primero (orden alfabético inverso no aplica, manejado en UI)
          { prioridad: 'desc' },
          { fechaVencimiento: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          asignado:    { select: { id: true, nombre: true, apellido: true, cargo: true } },
          vuAsignacion: { select: { dependenciaSugerida: true, diasTerminoLegal: true } },
          _count:      { select: { vuChat: { where: { esInterno: false, leido: false, usuarioId: null } } } },
        },
      }),
      prisma.pQRS.count({ where }),
    ])

    // Recalcular semáforo en tiempo real y adjuntar mensajes no leídos
    const items = pqrs.map(p => {
      const semActual = p.fechaVencimiento && p.vuAsignacion?.diasTerminoLegal
        ? calcularSemaforo(p.createdAt, p.vuAsignacion.diasTerminoLegal)
        : (p.colorSemaforo ?? null)

      return {
        id:               p.id,
        radicado:         p.radicado,
        tipo:             p.tipo,
        estado:           p.estado,
        prioridad:        p.prioridad,
        asunto:           p.asunto,
        nombreSolicitante: p.nombreSolicitante,
        anonimo:          p.anonimo,
        fechaRadicacion:  p.createdAt.toISOString().slice(0, 10),
        fechaVencimiento: p.fechaVencimiento?.toISOString().slice(0, 10) ?? null,
        colorSemaforo:    semActual,
        dependencia:      p.vuAsignacion?.dependenciaSugerida ?? null,
        asignado:         p.asignado
          ? { id: p.asignado.id, nombre: `${p.asignado.nombre} ${p.asignado.apellido}`, cargo: p.asignado.cargo }
          : null,
        mensajesNoLeidos: (p._count as any).vuChat ?? 0,
      }
    })

    // Métricas rápidas para el header de la bandeja
    const [totalPendientes, totalVencidos, totalUrgentes] = await Promise.all([
      prisma.pQRS.count({ where: { estado: { notIn: ['RESPONDIDA', 'CERRADA', 'ANULADA'] } } }),
      prisma.pQRS.count({ where: { colorSemaforo: 'NEGRO' as any, estado: { notIn: ['RESPONDIDA', 'CERRADA', 'ANULADA'] } } }),
      prisma.pQRS.count({ where: { colorSemaforo: { in: ['ROJO', 'NEGRO'] as any }, estado: { notIn: ['RESPONDIDA', 'CERRADA', 'ANULADA'] } } }),
    ])

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      metricas: { totalPendientes, totalVencidos, totalUrgentes },
    })
  } catch (err) {
    console.error('[GET /api/admin/ventanilla]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
