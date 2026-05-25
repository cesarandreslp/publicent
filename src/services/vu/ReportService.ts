/**
 * VU - Report Service
 *
 * Generacion de reportes sobre PQRS + persistencia opcional en VuReporte.
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - Report -> VuReporte (sin tenantId — multi-tenant via prisma)
 *  - ReportTemplate -> VuPlantillaReporte
 *  - Case -> PQRS; los CSV se construyen con campos del PQRS
 */

import { getTenantPrisma } from '@/lib/tenant'
import { TipoPQRS, EstadoPQRS } from '@prisma/client'

export type ReportType =
  | 'PQRS_POR_TIPO'
  | 'PQRS_POR_ESTADO'
  | 'PQRS_POR_FUNCIONARIO'
  | 'PQRS_VENCIDOS'
  | 'PQRS_DETALLE'

export interface GenerateReportInput {
  type: ReportType
  from?: Date
  to?: Date
  filters?: { tipo?: TipoPQRS; estado?: EstadoPQRS; funcionarioId?: string }
  generadoPorId?: string
  guardar?: boolean
  plantillaId?: string
}

export interface ReportData {
  type: ReportType
  generatedAt: Date
  period?: { from?: Date; to?: Date }
  rows: Array<Record<string, unknown>>
}

export class ReportService {
  static async generateReport(input: GenerateReportInput): Promise<ReportData> {
    const prisma = await getTenantPrisma()
    const where = {
      fechaRadicacion: input.from || input.to ? { gte: input.from, lte: input.to } : undefined,
      tipo: input.filters?.tipo,
      estado: input.filters?.estado,
    }

    let rows: Array<Record<string, unknown>> = []

    switch (input.type) {
      case 'PQRS_POR_TIPO': {
        const g = await prisma.pQRS.groupBy({ by: ['tipo'], where, _count: { id: true } })
        rows = g.map((r) => ({ tipo: r.tipo, total: r._count.id }))
        break
      }
      case 'PQRS_POR_ESTADO': {
        const g = await prisma.pQRS.groupBy({ by: ['estado'], where, _count: { id: true } })
        rows = g.map((r) => ({ estado: r.estado, total: r._count.id }))
        break
      }
      case 'PQRS_POR_FUNCIONARIO': {
        const g = await prisma.vuAsignacionFuncionario.groupBy({
          by: ['funcionarioId'],
          where: { estado: 'ACTIVA' },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        })
        const users = await prisma.usuario.findMany({
          where: { id: { in: g.map((x) => x.funcionarioId) } },
          select: { id: true, nombre: true, apellido: true, email: true },
        })
        const map = new Map(users.map((u) => [u.id, u]))
        rows = g.map((r) => {
          const u = map.get(r.funcionarioId)
          return {
            funcionario: u ? `${u.nombre} ${u.apellido}`.trim() : r.funcionarioId,
            email: u?.email ?? '',
            asignacionesActivas: r._count.id,
          }
        })
        break
      }
      case 'PQRS_VENCIDOS': {
        const list = await prisma.pQRS.findMany({
          where: { ...where, vencido: true },
          select: { radicado: true, asunto: true, tipo: true, estado: true, fechaVencimiento: true, asignadoId: true },
          orderBy: { fechaVencimiento: 'asc' },
        })
        rows = list as unknown as Array<Record<string, unknown>>
        break
      }
      case 'PQRS_DETALLE':
      default: {
        const list = await prisma.pQRS.findMany({
          where,
          select: {
            radicado: true, asunto: true, tipo: true, estado: true, prioridad: true,
            canal: true, fechaRadicacion: true, fechaVencimiento: true, vencido: true,
            nombreSolicitante: true, numeroDocumento: true, email: true,
          },
          orderBy: { fechaRadicacion: 'desc' },
          take: 1000,
        })
        rows = list as unknown as Array<Record<string, unknown>>
        break
      }
    }

    const data: ReportData = {
      type: input.type,
      generatedAt: new Date(),
      period: { from: input.from, to: input.to },
      rows,
    }

    if (input.guardar) {
      await prisma.vuReporte.create({
        data: {
          plantillaId: input.plantillaId,
          parametros: { type: input.type, filters: input.filters } as object,
          resultado: data as unknown as object,
          generadoPorId: input.generadoPorId,
          periodoDesde: input.from,
          periodoHasta: input.to,
        },
      })
    }

    return data
  }

  /**
   * Convierte ReportData a CSV (separador `,`). Maneja strings con comas.
   */
  static generateCSV(reportData: ReportData): string {
    if (reportData.rows.length === 0) return ''
    const headers = Object.keys(reportData.rows[0])
    const escape = (v: unknown): string => {
      if (v === null || v === undefined) return ''
      const s = v instanceof Date ? v.toISOString() : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
      headers.join(','),
      ...reportData.rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
    ]
    return lines.join('\n')
  }

  static async getReports(generadoPorId?: string, limit = 50) {
    const prisma = await getTenantPrisma()
    return prisma.vuReporte.findMany({
      where: generadoPorId ? { generadoPorId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  static async getReportById(reportId: string) {
    const prisma = await getTenantPrisma()
    return prisma.vuReporte.findUnique({ where: { id: reportId } })
  }
}

export const reportService = ReportService
