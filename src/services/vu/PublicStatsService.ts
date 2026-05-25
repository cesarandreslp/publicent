/**
 * VU - Public Stats Service
 *
 * Estadisticas publicas (no requieren auth) del modulo Ventanilla Unica.
 * Versiones compactas para alimentar dashboards de transparencia.
 */

import { getTenantPrisma } from '@/lib/tenant'
import { EstadoPQRS } from '@prisma/client'

export interface PublicStats {
  period: { from: Date; to: Date }
  totalCases: number
  totalClosed: number
  totalOverdue: number
  closureRate: number
  byType: Array<{ tipo: string; count: number }>
  byMonth: Array<{ month: string; total: number }>
}

const CLOSED: EstadoPQRS[] = [EstadoPQRS.CERRADA, EstadoPQRS.ANULADA]

export class PublicStatsService {
  static async getPublicStats(from?: Date, to?: Date): Promise<PublicStats> {
    const _from = from ?? new Date(new Date().getFullYear(), 0, 1)
    const _to = to ?? new Date()
    const prisma = await getTenantPrisma()
    const where = { fechaRadicacion: { gte: _from, lte: _to } }

    const [total, closed, overdue, byType, all] = await Promise.all([
      prisma.pQRS.count({ where }),
      prisma.pQRS.count({ where: { ...where, estado: { in: CLOSED } } }),
      prisma.pQRS.count({ where: { ...where, vencido: true } }),
      prisma.pQRS.groupBy({ by: ['tipo'], where, _count: { id: true } }),
      prisma.pQRS.findMany({ where, select: { fechaRadicacion: true } }),
    ])

    const months = new Map<string, number>()
    for (const p of all) {
      const k = p.fechaRadicacion.toISOString().slice(0, 7)
      months.set(k, (months.get(k) ?? 0) + 1)
    }

    return {
      period: { from: _from, to: _to },
      totalCases: total,
      totalClosed: closed,
      totalOverdue: overdue,
      closureRate: total > 0 ? parseFloat(((closed / total) * 100).toFixed(2)) : 0,
      byType: byType.map((r) => ({ tipo: r.tipo, count: r._count.id })),
      byMonth: Array.from(months.entries())
        .map(([month, totalM]) => ({ month, total: totalM }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    }
  }

  static async getCurrentMonthStats(): Promise<PublicStats> {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return this.getPublicStats(from, now)
  }

  static async getYearStats(): Promise<PublicStats> {
    const now = new Date()
    const from = new Date(now.getFullYear(), 0, 1)
    return this.getPublicStats(from, now)
  }
}

export const publicStatsService = PublicStatsService
