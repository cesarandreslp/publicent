/**
 * VU - Case State Service
 *
 * Gestion del ciclo de vida del PQRS en el modulo Ventanilla Unica.
 * En personeriabuga el estado es un enum (EstadoPQRS), no un modelo.
 * Las transiciones se registran en `HistorialPQRS`.
 *
 * Equivalencias respecto a ventanilla_unica_base:
 *   Case             -> PQRS
 *   CaseState        -> EstadoPQRS (enum)
 *   CaseStateHistory -> HistorialPQRS
 *   ensureStatesExist -> no-op (enum estatico)
 */

import { getTenantPrisma } from '@/lib/tenant'
import { EstadoPQRS } from '@prisma/client'
import { auditService } from './AuditService'
import { stateMachineService, ROLES, type Role } from './StateMachineService'

export type CaseStateCode = EstadoPQRS

/** Metadata estatica para presentar los estados en la UI. */
export const STATE_METADATA: Record<EstadoPQRS, {
  code: EstadoPQRS
  name: string
  description: string
  color: string
  displayOrder: number
  isInitial: boolean
  isFinal: boolean
  requiresComment: boolean
}> = {
  RECIBIDA:    { code: 'RECIBIDA',    name: 'Recibida',     description: 'PQRS recibida y radicada',                  color: '#3B82F6', displayOrder: 1, isInitial: true,  isFinal: false, requiresComment: false },
  EN_TRAMITE:  { code: 'EN_TRAMITE',  name: 'En tramite',   description: 'Funcionario gestionando la solicitud',      color: '#F59E0B', displayOrder: 2, isInitial: false, isFinal: false, requiresComment: false },
  EN_REVISION: { code: 'EN_REVISION', name: 'En revision',  description: 'Se requiere informacion adicional o VoBo',  color: '#EF4444', displayOrder: 3, isInitial: false, isFinal: false, requiresComment: true  },
  RESPONDIDA:  { code: 'RESPONDIDA',  name: 'Respondida',   description: 'Respuesta oficial emitida',                 color: '#10B981', displayOrder: 4, isInitial: false, isFinal: false, requiresComment: false },
  CERRADA:     { code: 'CERRADA',     name: 'Cerrada',      description: 'PQRS cerrado definitivamente',              color: '#6B7280', displayOrder: 5, isInitial: false, isFinal: true,  requiresComment: true  },
  ANULADA:     { code: 'ANULADA',     name: 'Anulada',      description: 'PQRS anulado por la autoridad',             color: '#1F2937', displayOrder: 6, isInitial: false, isFinal: true,  requiresComment: true  },
}

export interface ChangeStateInput {
  caseId: string                         // pqrsId
  newStateCode: EstadoPQRS
  userId: string
  userEmail: string
  userRole: Role | string                // tolerante a strings legacy
  comment?: string
  ipAddress?: string
  userAgent?: string
}

export class CaseStateService {
  /**
   * No-op: los estados son enum estatico. Conservado por compatibilidad.
   */
  async ensureStatesExist(): Promise<void> { return }

  /**
   * Cambia el estado de un PQRS validando la transicion + registrando
   * en HistorialPQRS + auditoria.
   */
  async changeState(input: ChangeStateInput): Promise<{
    success: boolean
    case?: { id: string; stateCode: EstadoPQRS; stateName: string; filingNumber: string }
    error?: string
  }> {
    try {
      const prisma = await getTenantPrisma()
      const existing = await prisma.pQRS.findUnique({ where: { id: input.caseId } })
      if (!existing) return { success: false, error: 'PQRS no encontrado' }

      if (existing.estado === input.newStateCode) {
        return { success: false, error: 'El PQRS ya esta en ese estado' }
      }

      // Validar transicion via StateMachine (incluye reglas de rol y comentario)
      const validation = stateMachineService.validateTransition({
        currentState: existing.estado,
        targetState: input.newStateCode,
        userRole: (input.userRole as Role) || ROLES.FUNCIONARIO,
        comment: input.comment,
      })
      if (!validation.valid) return { success: false, error: validation.error }

      const newMeta = STATE_METADATA[input.newStateCode]
      const cierre = newMeta.isFinal
        ? { cerradoEn: new Date(), cerradoPor: input.userId, motivoCierre: input.comment }
        : {}

      const updated = await prisma.pQRS.update({
        where: { id: input.caseId },
        data: { estado: input.newStateCode, ...cierre },
      })

      await prisma.historialPQRS.create({
        data: {
          pqrsId: input.caseId,
          accion: 'CAMBIO_ESTADO',
          descripcion: input.comment,
          estadoAnterior: existing.estado,
          estadoNuevo: input.newStateCode,
          usuarioId: input.userId,
        },
      })

      await auditService.logStatusChanged(
        input.caseId,
        input.userId,
        input.userEmail,
        String(input.userRole),
        '',  // tenantId implicito por contexto
        { estado: existing.estado },
        { estado: input.newStateCode, comentario: input.comment },
      )

      return {
        success: true,
        case: {
          id: updated.id,
          stateCode: updated.estado,
          stateName: STATE_METADATA[updated.estado].name,
          filingNumber: updated.radicado,
        },
      }
    } catch (error) {
      console.error('[VU/CaseState] error cambiando estado:', error)
      return { success: false, error: 'Error interno al cambiar estado' }
    }
  }

  /**
   * Historial de cambios de estado.
   */
  async getStateHistory(caseId: string) {
    try {
      const prisma = await getTenantPrisma()
      const history = await prisma.historialPQRS.findMany({
        where: { pqrsId: caseId, accion: 'CAMBIO_ESTADO' },
        include: {
          usuario: { select: { id: true, email: true, nombre: true, apellido: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return { success: true, history }
    } catch (error) {
      console.error('[VU/CaseState] error historial:', error)
      return { success: false, error: 'Error al obtener historial', history: [] }
    }
  }

  /**
   * Estados disponibles para un caso segun su estado actual y rol.
   */
  async getAvailableStates(caseId: string, userRole: Role | string = ROLES.FUNCIONARIO) {
    try {
      const prisma = await getTenantPrisma()
      const existing = await prisma.pQRS.findUnique({
        where: { id: caseId },
        select: { estado: true },
      })
      if (!existing) return { success: false, error: 'PQRS no encontrado', states: [] }
      const { states } = await stateMachineService.getAvailableStates(existing.estado, userRole as Role)
      const enriched = states.map((s) => ({
        ...STATE_METADATA[s.code],
        ...s,
      }))
      return { success: true, states: enriched }
    } catch (error) {
      console.error('[VU/CaseState] error estados disponibles:', error)
      return { success: false, error: 'Error al obtener estados disponibles', states: [] }
    }
  }

  /**
   * Estadisticas: PQRS por estado en el tenant actual.
   */
  async getStatsByState() {
    try {
      const prisma = await getTenantPrisma()
      const stats = await prisma.pQRS.groupBy({
        by: ['estado'],
        _count: { id: true },
      })
      return {
        success: true,
        stats: stats.map((s) => ({
          stateCode: s.estado,
          stateName: STATE_METADATA[s.estado].name,
          count: s._count.id,
        })),
      }
    } catch (error) {
      console.error('[VU/CaseState] error stats:', error)
      return { success: false, error: 'Error al obtener estadisticas', stats: [] }
    }
  }

  /**
   * Todos los estados (estatico, no consulta BD).
   */
  async getAllStates() {
    return {
      success: true,
      states: Object.values(STATE_METADATA).sort((a, b) => a.displayOrder - b.displayOrder),
    }
  }

  /**
   * Estado actual de un caso.
   */
  async getCurrentState(caseId: string): Promise<{
    success: boolean
    state?: typeof STATE_METADATA[EstadoPQRS]
    error?: string
  }> {
    try {
      const prisma = await getTenantPrisma()
      const existing = await prisma.pQRS.findUnique({
        where: { id: caseId },
        select: { estado: true },
      })
      if (!existing) return { success: false, error: 'PQRS no encontrado' }
      return { success: true, state: STATE_METADATA[existing.estado] }
    } catch (error) {
      console.error('[VU/CaseState] error estado actual:', error)
      return { success: false, error: 'Error al obtener estado actual' }
    }
  }
}

export const caseStateService = new CaseStateService()
