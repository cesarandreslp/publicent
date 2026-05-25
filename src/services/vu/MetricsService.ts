/**
 * VU - Metrics Service
 *
 * Indicadores institucionales del modulo Ventanilla Unica sobre PQRS + VU.
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - Case -> PQRS; slaStatus (ON_TIME/WARNING/OVERDUE) -> colorSemaforo
 *    (VERDE/AMARILLO/ROJO/NEGRO). NEGRO se considera overdue.
 *  - caseType (modelo) -> tipo (enum TipoPQRS)
 *  - state (modelo)    -> estado (enum EstadoPQRS)
 *  - assignments       -> vuAsignacionesReales (estado ACTIVA)
 *  - tenantId          -> implicito por contexto (multi-tenant via prisma)
 */

import { getTenantPrisma } from '@/lib/tenant'
import { EstadoPQRS } from '@prisma/client'

export interface MetricsFilters {
  from?: Date
  to?: Date
}

export interface SLAMetrics {
  totalCasesWithSLA: number
  casesOnTime: number
  casesWarning: number
  casesOverdue: number
  compliancePercentage: number
}

export interface TimeMetrics {
  averageDays: number
  minDays: number
  maxDays: number
  totalClosed: number
}

export interface DistributionMetrics {
  byType: Array<{ tipo: string; count: number }>
  byState: Array<{ estado: string; count: number }>
  byChannel: Array<{ canal: string; count: number }>
  byPriority: Array<{ prioridad: string; count: number }>
}

export interface UserMetrics {
  totalActiveUsers: number
  topAssignees: Array<{ userId: string; fullName: string; cases: number }>
}

export interface QualityMetrics {
  reassignmentRate: number
  responseRate: number
}

export interface MonthlyTrend {
  month: string
  total: number
  cerrados: number
  vencidos: number
}

export interface InstitutionalMetrics {
  period: { from: Date; to: Date }
  sla: SLAMetrics
  time: TimeMetrics
  distribution: DistributionMetrics
  users: UserMetrics
  quality: QualityMetrics
  trends: MonthlyTrend[]
}

const CLOSED_STATES: EstadoPQRS[] = [EstadoPQRS.CERRADA, EstadoPQRS.ANULADA]

export class MetricsService {
  static async getInstitutionalMetrics(filters: MetricsFilters = {}): Promise<InstitutionalMetrics> {
    const from = filters.from ?? new Date(0)
    const to   = filters.to   ?? new Date()
    const [sla, time, distribution, users, quality, trends] = await Promise.all([
      this.calculateSLAMetrics(from, to),
      this.calculateTimeMetrics(from, to),
      this.calculateCaseDistribution(from, to),
      this.calculateUserMetrics(from, to),
      this.calculateQualityMetrics(from, to),
      this.calculateMonthlyTrends(from, to),
    ])
    return { period: { from, to }, sla, time, distribution, users, quality, trends }
  }

  static async calculateSLAMetrics(from: Date, to: Date): Promise<SLAMetrics> {
    const prisma = await getTenantPrisma()
    const baseWhere = { fechaRadicacion: { gte: from, lte: to } }
    const [total, verde, amarillo, rojo, negro] = await Promise.all([
      prisma.pQRS.count({ where: baseWhere }),
      prisma.pQRS.count({ where: { ...baseWhere, colorSemaforo: 'VERDE' } }),
      prisma.pQRS.count({ where: { ...baseWhere, colorSemaforo: 'AMARILLO' } }),
      prisma.pQRS.count({ where: { ...baseWhere, colorSemaforo: 'ROJO' } }),
      prisma.pQRS.count({ where: { ...baseWhere, colorSemaforo: 'NEGRO' } }),
    ])
    const compliance = total > 0 ? ((verde + amarillo) / total) * 100 : 0
    return {
      totalCasesWithSLA: total,
      casesOnTime: verde,
      casesWarning: amarillo + rojo,
      casesOverdue: negro,
      compliancePercentage: parseFloat(compliance.toFixed(2)),
    }
  }

  static async calculateTimeMetrics(from: Date, to: Date): Promise<TimeMetrics> {
    const prisma = await getTenantPrisma()
    const closed = await prisma.pQRS.findMany({
      where: { fechaRadicacion: { gte: from, lte: to }, cerradoEn: { not: null } },
      select: { fechaRadicacion: true, cerradoEn: true },
    })
    if (closed.length === 0) {
      return { averageDays: 0, minDays: 0, maxDays: 0, totalClosed: 0 }
    }
    const days = closed.map((c) =>
      Math.max(0, Math.floor(((c.cerradoEn as Date).getTime() - c.fechaRadicacion.getTime()) / 86_400_000)),
    )
    return {
      averageDays: parseFloat((days.reduce((a, b) => a + b, 0) / days.length).toFixed(2)),
      minDays: Math.min(...days),
      maxDays: Math.max(...days),
      totalClosed: closed.length,
    }
  }

  static async calculateCaseDistribution(from: Date, to: Date): Promise<DistributionMetrics> {
    const prisma = await getTenantPrisma()
    const where = { fechaRadicacion: { gte: from, lte: to } }
    const [byTipo, byEstado, byCanal, byPrioridad] = await Promise.all([
      prisma.pQRS.groupBy({ by: ['tipo'],      where, _count: { id: true } }),
      prisma.pQRS.groupBy({ by: ['estado'],    where, _count: { id: true } }),
      prisma.pQRS.groupBy({ by: ['canal'],     where, _count: { id: true } }),
      prisma.pQRS.groupBy({ by: ['prioridad'], where, _count: { id: true } }),
    ])
    return {
      byType:     byTipo.map((r) => ({ tipo: r.tipo, count: r._count.id })),
      byState:    byEstado.map((r) => ({ estado: r.estado, count: r._count.id })),
      byChannel:  byCanal.map((r) => ({ canal: r.canal, count: r._count.id })),
      byPriority: byPrioridad.map((r) => ({ prioridad: r.prioridad, count: r._count.id })),
    }
  }

  static async calculateUserMetrics(from: Date, to: Date): Promise<UserMetrics> {
    const prisma = await getTenantPrisma()
    const active = await prisma.usuario.count({ where: { activo: true } })

    const groups = await prisma.vuAsignacionFuncionario.groupBy({
      by: ['funcionarioId'],
      where: { estado: 'ACTIVA', createdAt: { gte: from, lte: to } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })
    const userIds = groups.map((g) => g.funcionarioId)
    const users = userIds.length
      ? await prisma.usuario.findMany({
          where: { id: { in: userIds } },
          select: { id: true, nombre: true, apellido: true },
        })
      : []
    const userMap = new Map(users.map((u) => [u.id, `${u.nombre} ${u.apellido}`.trim()]))

    return {
      totalActiveUsers: active,
      topAssignees: groups.map((g) => ({
        userId: g.funcionarioId,
        fullName: userMap.get(g.funcionarioId) || g.funcionarioId,
        cases: g._count.id,
      })),
    }
  }

  static async calculateQualityMetrics(from: Date, to: Date): Promise<QualityMetrics> {
    const prisma = await getTenantPrisma()
    const baseWhere = { fechaRadicacion: { gte: from, lte: to } }
    const [total, withReassignment, responded] = await Promise.all([
      prisma.pQRS.count({ where: baseWhere }),
      prisma.pQRS.count({ where: { ...baseWhere, vuHistorialAsign: { some: {} } } }),
      prisma.pQRS.count({ where: { ...baseWhere, estado: EstadoPQRS.RESPONDIDA } }),
    ])
    return {
      reassignmentRate: total > 0 ? parseFloat(((withReassignment / total) * 100).toFixed(2)) : 0,
      responseRate:     total > 0 ? parseFloat(((responded / total) * 100).toFixed(2)) : 0,
    }
  }

  static async calculateMonthlyTrends(from: Date, to: Date): Promise<MonthlyTrend[]> {
    const prisma = await getTenantPrisma()
    const months = new Map<string, MonthlyTrend>()

    const all = await prisma.pQRS.findMany({
      where: { fechaRadicacion: { gte: from, lte: to } },
      select: { fechaRadicacion: true, estado: true, vencido: true },
    })

    for (const p of all) {
      const key = p.fechaRadicacion.toISOString().slice(0, 7) // YYYY-MM
      const cur = months.get(key) ?? { month: key, total: 0, cerrados: 0, vencidos: 0 }
      cur.total += 1
      if (CLOSED_STATES.includes(p.estado)) cur.cerrados += 1
      if (p.vencido) cur.vencidos += 1
      months.set(key, cur)
    }
    return Array.from(months.values()).sort((a, b) => a.month.localeCompare(b.month))
  }
}

export const metricsService = MetricsService
