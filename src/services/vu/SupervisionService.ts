/**
 * VU - Supervision Service
 *
 * Vistas agregadas para roles DIRECTOR / ADMIN: carga por funcionario,
 * casos vencidos, productividad, exportacion CSV.
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - Case -> PQRS; Assignment -> VuAsignacionFuncionario
 *  - Spreadsheet helpers via CSV (no exceljs en personeriabuga aun);
 *    si se requiere XLSX, importar `exceljs` o usar `lib/storage` upload.
 */

import { getTenantPrisma } from '@/lib/tenant'
import { EstadoPQRS } from '@prisma/client'

export interface SupervisionFilters {
  from?: Date
  to?: Date
  funcionarioId?: string
  tipo?: string
}

export interface FuncionarioLoad {
  userId: string
  fullName: string
  email: string
  active: number
  closed: number
  overdue: number
  responseRate: number
}

const CLOSED: EstadoPQRS[] = [EstadoPQRS.CERRADA, EstadoPQRS.ANULADA]

export class SupervisionService {
  /**
   * Metricas de carga y productividad por funcionario.
   */
  async getMetrics(filters: SupervisionFilters = {}): Promise<{
    success: boolean
    funcionarios: FuncionarioLoad[]
    totals: { totalActiveCases: number; totalClosedCases: number; totalOverdueCases: number }
    error?: string
  }> {
    try {
      const prisma = await getTenantPrisma()
      const dateRange = filters.from || filters.to
        ? { gte: filters.from, lte: filters.to }
        : undefined

      const funcionarios = await prisma.usuario.findMany({
        where: {
          activo: true,
          ...(filters.funcionarioId ? { id: filters.funcionarioId } : {}),
          vuAsignacionesComoFuncionario: { some: {} },
        },
        select: { id: true, nombre: true, apellido: true, email: true },
      })

      const data: FuncionarioLoad[] = []
      let totalActive = 0
      let totalClosed = 0
      let totalOverdue = 0

      for (const f of funcionarios) {
        const baseAsignWhere = {
          funcionarioId: f.id,
          ...(dateRange ? { createdAt: dateRange } : {}),
        }
        // eslint-disable-next-line no-await-in-loop
        const [active, closed, overdue] = await Promise.all([
          prisma.vuAsignacionFuncionario.count({ where: { ...baseAsignWhere, estado: 'ACTIVA' } }),
          prisma.pQRS.count({
            where: {
              estado: { in: CLOSED },
              vuAsignacionesReales: { some: { funcionarioId: f.id } },
              ...(dateRange ? { cerradoEn: dateRange } : {}),
            },
          }),
          prisma.pQRS.count({
            where: {
              vencido: true,
              estado: { notIn: CLOSED },
              vuAsignacionesReales: { some: { funcionarioId: f.id, estado: 'ACTIVA' } },
            },
          }),
        ])

        const totalProcessed = active + closed
        const responseRate = totalProcessed > 0 ? parseFloat(((closed / totalProcessed) * 100).toFixed(2)) : 0

        data.push({
          userId: f.id,
          fullName: `${f.nombre} ${f.apellido}`.trim(),
          email: f.email,
          active,
          closed,
          overdue,
          responseRate,
        })

        totalActive += active
        totalClosed += closed
        totalOverdue += overdue
      }

      return {
        success: true,
        funcionarios: data.sort((a, b) => b.active - a.active),
        totals: { totalActiveCases: totalActive, totalClosedCases: totalClosed, totalOverdueCases: totalOverdue },
      }
    } catch (error) {
      console.error('[VU/Supervision] error metricas:', error)
      return {
        success: false,
        funcionarios: [],
        totals: { totalActiveCases: 0, totalClosedCases: 0, totalOverdueCases: 0 },
        error: 'Error al obtener metricas',
      }
    }
  }

  /**
   * Casos vencidos con info del funcionario asignado.
   */
  async getOverdueCases(filters: SupervisionFilters = {}) {
    try {
      const prisma = await getTenantPrisma()
      const list = await prisma.pQRS.findMany({
        where: {
          vencido: true,
          estado: { notIn: CLOSED },
          ...(filters.from || filters.to ? { fechaRadicacion: { gte: filters.from, lte: filters.to } } : {}),
        },
        include: {
          vuAsignacionesReales: {
            where: { estado: 'ACTIVA' },
            include: { funcionario: { select: { id: true, nombre: true, apellido: true, email: true } } },
            take: 1,
          },
        },
        orderBy: { fechaVencimiento: 'asc' },
        take: 500,
      })

      return {
        success: true,
        cases: list.map((p) => {
          const asign = p.vuAsignacionesReales[0]
          return {
            id: p.id,
            filingNumber: p.radicado,
            subject: p.asunto,
            tipo: p.tipo,
            estado: p.estado,
            fechaRadicacion: p.fechaRadicacion,
            fechaVencimiento: p.fechaVencimiento,
            ciudadano: p.nombreSolicitante,
            funcionario: asign
              ? {
                  id: asign.funcionario.id,
                  fullName: `${asign.funcionario.nombre} ${asign.funcionario.apellido}`.trim(),
                  email: asign.funcionario.email,
                }
              : null,
          }
        }),
      }
    } catch (error) {
      console.error('[VU/Supervision] error vencidos:', error)
      return { success: false, cases: [], error: 'Error al obtener vencidos' }
    }
  }

  /**
   * Exporta metricas de supervision como CSV.
   */
  async generateCSVExport(filters: SupervisionFilters = {}): Promise<{ success: boolean; csv?: string; error?: string }> {
    const m = await this.getMetrics(filters)
    if (!m.success) return { success: false, error: m.error }

    const headers = ['userId', 'fullName', 'email', 'active', 'closed', 'overdue', 'responseRate']
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const csv = [
      headers.join(','),
      ...m.funcionarios.map((f) => headers.map((h) => escape((f as unknown as Record<string, unknown>)[h])).join(',')),
    ].join('\n')

    return { success: true, csv }
  }
}

export const supervisionService = new SupervisionService()
