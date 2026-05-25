/**
 * VU - Inbox Service
 *
 * Bandejas de trabajo del modulo VU:
 *  - Personal: PQRS del usuario (FUNCIONARIO) o todos (ADMIN/DIRECTOR)
 *  - Pendientes: PQRS no cerrados ni anulados
 *  - Vencidos: pqrs.vencido === true
 *
 * Mapeos respecto a ventanilla_unica_base:
 *   Case -> PQRS, Assignment -> VuAsignacionFuncionario (estado ACTIVA),
 *   citizen -> campos embebidos, state -> EstadoPQRS, slaStatus -> colorSemaforo.
 */

import { getTenantPrisma } from '@/lib/tenant'
import { Prisma, EstadoPQRS, VuColorSemaforo } from '@prisma/client'

export interface InboxFilters {
  stateCode?: EstadoPQRS
  filedFrom?: string  // YYYY-MM-DD
  filedTo?: string
  assignedTo?: string // userId — solo para ADMIN/DIRECTOR
}

export interface CaseInboxItem {
  id: string
  filingNumber: string
  subject: string
  citizenName: string
  stateCode: EstadoPQRS
  stateName: string
  assignedTo: string | null
  dueDate: Date | null
  isOverdue: boolean
  filedAt: Date
  slaStatus: 'green' | 'yellow' | 'red' | 'black'
}

const SUPERVISOR_ROLES = ['ADMIN', 'DIRECTOR', 'SUPERVISOR']
const CLOSED_STATES: EstadoPQRS[] = [EstadoPQRS.CERRADA, EstadoPQRS.ANULADA]

function mapSLAStatus(c: VuColorSemaforo | null): 'green' | 'yellow' | 'red' | 'black' {
  switch (c) {
    case 'AMARILLO': return 'yellow'
    case 'ROJO':     return 'red'
    case 'NEGRO':    return 'black'
    case 'VERDE':
    default:         return 'green'
  }
}

type PqrsInboxRow = Prisma.PQRSGetPayload<{
  include: {
    vuAsignacionesReales: {
      include: { funcionario: { select: { nombre: true; apellido: true } } }
    }
  }
}>

function formatRow(p: PqrsInboxRow): CaseInboxItem {
  const activa = p.vuAsignacionesReales.find((a) => a.estado === 'ACTIVA')
  const assignedTo = activa
    ? `${activa.funcionario.nombre} ${activa.funcionario.apellido}`.trim()
    : null
  return {
    id: p.id,
    filingNumber: p.radicado,
    subject: p.asunto,
    citizenName: p.nombreSolicitante,
    stateCode: p.estado,
    stateName: p.estado,
    assignedTo,
    dueDate: p.fechaVencimiento,
    isOverdue: p.vencido,
    filedAt: p.fechaRadicacion,
    slaStatus: mapSLAStatus(p.colorSemaforo),
  }
}

export class InboxService {
  /**
   * WHERE clause comun segun rol y filtros.
   */
  private buildWhere(
    userId: string,
    userRole: string,
    filters: InboxFilters,
    onlyOverdue = false,
    onlyActive = false,
  ): Prisma.PQRSWhereInput {
    const where: Prisma.PQRSWhereInput = {}
    const isSupervisor = SUPERVISOR_ROLES.includes(userRole)

    if (!isSupervisor) {
      // FUNCIONARIO solo ve los PQRS donde tiene asignacion activa
      where.vuAsignacionesReales = { some: { funcionarioId: userId, estado: 'ACTIVA' } }
    }

    if (onlyOverdue) {
      where.vencido = true
      where.estado = { notIn: CLOSED_STATES }
    } else if (onlyActive) {
      where.estado = { notIn: CLOSED_STATES }
    }

    if (filters.stateCode) where.estado = filters.stateCode

    if (filters.filedFrom || filters.filedTo) {
      where.fechaRadicacion = {}
      if (filters.filedFrom) where.fechaRadicacion.gte = new Date(filters.filedFrom)
      if (filters.filedTo)   where.fechaRadicacion.lte = new Date(filters.filedTo)
    }

    if (filters.assignedTo && isSupervisor) {
      where.vuAsignacionesReales = {
        some: { funcionarioId: filters.assignedTo, estado: 'ACTIVA' },
      }
    }

    return where
  }

  /**
   * /admin/ventanilla/inbox — bandeja personal o global segun rol.
   */
  async getPersonalInbox(userId: string, userRole: string, filters: InboxFilters = {}) {
    return this.queryInbox(this.buildWhere(userId, userRole, filters), { vencidoFirst: true })
  }

  /**
   * /admin/ventanilla/inbox/pending — solo abiertos.
   */
  async getPendingInbox(userId: string, userRole: string, filters: InboxFilters = {}) {
    return this.queryInbox(this.buildWhere(userId, userRole, filters, false, true), { dueAsc: true })
  }

  /**
   * /admin/ventanilla/inbox/overdue — solo vencidos.
   */
  async getOverdueInbox(userId: string, userRole: string, filters: InboxFilters = {}) {
    return this.queryInbox(this.buildWhere(userId, userRole, filters, true, false), { dueAsc: true })
  }

  private async queryInbox(
    where: Prisma.PQRSWhereInput,
    opts: { vencidoFirst?: boolean; dueAsc?: boolean } = {},
  ): Promise<{ success: boolean; cases: CaseInboxItem[]; error?: string }> {
    try {
      const prisma = await getTenantPrisma()
      const orderBy: Prisma.PQRSOrderByWithRelationInput[] = []
      if (opts.vencidoFirst) orderBy.push({ vencido: 'desc' })
      if (opts.dueAsc)       orderBy.push({ fechaVencimiento: 'asc' })
      if (orderBy.length === 0) orderBy.push({ fechaRadicacion: 'desc' })

      const rows = await prisma.pQRS.findMany({
        where,
        include: {
          vuAsignacionesReales: {
            include: {
              funcionario: { select: { nombre: true, apellido: true } },
            },
          },
        },
        orderBy,
        take: 100,
      })

      return { success: true, cases: rows.map(formatRow) }
    } catch (error) {
      console.error('[VU/Inbox] error consultando bandeja:', error)
      return { success: false, cases: [], error: 'Error al obtener bandeja' }
    }
  }
}

export const inboxService = new InboxService()
