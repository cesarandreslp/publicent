/**
 * VU - Assignment Service
 *
 * Gestion de asignacion y reasignacion de PQRS a funcionarios.
 *
 * Mapeo respecto a ventanilla_unica_base:
 *   Case                  -> PQRS
 *   Assignment            -> VuAsignacionFuncionario
 *   CaseAssignmentHistory -> VuAsignacionHistorial
 *   User                  -> Usuario (con relacion rol)
 *
 * Reglas:
 *  - Un PQRS tiene UNA asignacion ACTIVA.
 *  - Reasignar requiere comentario (motivo) obligatorio.
 *  - Solo ADMIN/DIRECTOR/ASIGNACION_DE_CASOS/VENTANILLA_UNICA asignan
 *    (validacion en la capa API, no aqui).
 *  - Asignaciones anteriores se marcan como REEMPLAZADA.
 */

import { getTenantPrisma } from '@/lib/tenant'
import { auditService } from './AuditService'

export interface AssignCaseInput {
  caseId: string                 // pqrsId
  newAssigneeId: string          // usuario que recibe el caso
  assignedByUserId: string
  assignedByEmail: string
  assignedByRole: string
  reason?: string                // requerido si es reasignacion
  ipAddress?: string
  userAgent?: string
}

export class AssignmentService {
  /**
   * Asigna o reasigna un PQRS a un funcionario.
   */
  async assignCase(input: AssignCaseInput): Promise<{
    success: boolean
    assignment?: {
      id: string
      caseId: string
      userId: string
      assignedAt: Date
      isReassignment: boolean
    }
    error?: string
  }> {
    try {
      const prisma = await getTenantPrisma()

      // 1. PQRS existe?
      const pqrs = await prisma.pQRS.findUnique({ where: { id: input.caseId } })
      if (!pqrs) return { success: false, error: 'PQRS no encontrado' }

      // 2. Usuario destino existe y esta activo?
      const assignee = await prisma.usuario.findUnique({
        where: { id: input.newAssigneeId },
        include: { rol: true },
      })
      if (!assignee) return { success: false, error: 'Funcionario no encontrado' }
      if (!assignee.activo) return { success: false, error: 'El funcionario esta inactivo' }

      // 3. Asignacion activa actual
      const current = await prisma.vuAsignacionFuncionario.findFirst({
        where: { pqrsId: input.caseId, estado: 'ACTIVA' },
        orderBy: { createdAt: 'desc' },
      })

      const isReassignment = Boolean(current)
      if (isReassignment && current!.funcionarioId === input.newAssigneeId) {
        return { success: false, error: 'El PQRS ya esta asignado a ese funcionario' }
      }
      if (isReassignment && !input.reason?.trim()) {
        return { success: false, error: 'La reasignacion requiere comentario' }
      }

      // 4. Reemplazar asignacion previa
      if (current) {
        await prisma.vuAsignacionFuncionario.update({
          where: { id: current.id },
          data: { estado: 'REEMPLAZADA' },
        })
      }

      // 5. Crear nueva asignacion
      const created = await prisma.vuAsignacionFuncionario.create({
        data: {
          pqrsId: input.caseId,
          funcionarioId: input.newAssigneeId,
          asignadoPorId: input.assignedByUserId,
          estado: 'ACTIVA',
          motivo: input.reason || 'Asignacion inicial',
        },
      })

      // 6. Actualizar el campo flat asignadoId de PQRS (compat con UI vieja)
      await prisma.pQRS.update({
        where: { id: input.caseId },
        data: { asignadoId: input.newAssigneeId },
      })

      // 7. Historial
      await prisma.vuAsignacionHistorial.create({
        data: {
          pqrsId: input.caseId,
          funcionarioAnteriorId: current?.funcionarioId,
          funcionarioNuevoId: input.newAssigneeId,
          realizadoPorId: input.assignedByUserId,
          motivo: input.reason || 'Asignacion inicial',
        },
      })

      // 8. Auditoria
      await auditService.log({
        action: isReassignment ? 'REASSIGNED' : 'ASSIGNED',
        userId: input.assignedByUserId,
        userEmail: input.assignedByEmail,
        userRole: input.assignedByRole,
        tenantId: null,
        entityType: 'PQRS',
        entityId: input.caseId,
        ipAddress: input.ipAddress ?? 'system',
        userAgent: input.userAgent ?? 'system',
        caseId: input.caseId,
        metadata: {
          previousAssigneeId: current?.funcionarioId,
          newAssigneeId: input.newAssigneeId,
          reason: input.reason,
          isReassignment,
        },
      })

      return {
        success: true,
        assignment: {
          id: created.id,
          caseId: created.pqrsId,
          userId: created.funcionarioId,
          assignedAt: created.createdAt,
          isReassignment,
        },
      }
    } catch (error) {
      console.error('[VU/Assignment] error asignando:', error)
      return { success: false, error: 'Error interno al asignar PQRS' }
    }
  }

  /**
   * Asignacion activa actual de un PQRS.
   */
  async getCurrentAssignee(caseId: string): Promise<{
    success: boolean
    assignee?: { id: string; email: string; fullName: string; role: string; assignedAt: Date }
    error?: string
  }> {
    try {
      const prisma = await getTenantPrisma()
      const current = await prisma.vuAsignacionFuncionario.findFirst({
        where: { pqrsId: caseId, estado: 'ACTIVA' },
        include: { funcionario: { include: { rol: true } } },
        orderBy: { createdAt: 'desc' },
      })
      if (!current) return { success: true, assignee: undefined }
      return {
        success: true,
        assignee: {
          id: current.funcionario.id,
          email: current.funcionario.email,
          fullName: `${current.funcionario.nombre} ${current.funcionario.apellido}`.trim(),
          role: current.funcionario.rol?.nombre || 'Sin rol',
          assignedAt: current.createdAt,
        },
      }
    } catch (error) {
      console.error('[VU/Assignment] error obteniendo asignado:', error)
      return { success: false, error: 'Error al obtener asignado actual' }
    }
  }

  /**
   * Historial completo de asignaciones de un PQRS.
   */
  async getAssignmentHistory(caseId: string) {
    try {
      const prisma = await getTenantPrisma()
      const history = await prisma.vuAsignacionHistorial.findMany({
        where: { pqrsId: caseId },
        include: {
          funcionarioAnterior: { select: { id: true, email: true, nombre: true, apellido: true } },
          funcionarioNuevo:    { select: { id: true, email: true, nombre: true, apellido: true } },
          realizadoPor:        { select: { id: true, email: true, nombre: true, apellido: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return {
        success: true,
        history: history.map((h) => ({
          id: h.id,
          previousAssignee: h.funcionarioAnterior
            ? `${h.funcionarioAnterior.nombre} ${h.funcionarioAnterior.apellido}`.trim()
            : null,
          newAssignee: `${h.funcionarioNuevo.nombre} ${h.funcionarioNuevo.apellido}`.trim(),
          assignedBy: h.realizadoPor
            ? `${h.realizadoPor.nombre} ${h.realizadoPor.apellido}`.trim()
            : 'sistema',
          reason: h.motivo,
          createdAt: h.createdAt,
        })),
      }
    } catch (error) {
      console.error('[VU/Assignment] error historial:', error)
      return { success: false, history: [], error: 'Error al obtener historial' }
    }
  }

  /**
   * PQRS activos asignados a un funcionario.
   */
  async getCasesByAssignee(userId: string) {
    try {
      const prisma = await getTenantPrisma()
      const assignments = await prisma.vuAsignacionFuncionario.findMany({
        where: { funcionarioId: userId, estado: 'ACTIVA' },
        include: {
          pqrs: { select: { id: true, radicado: true, asunto: true, estado: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      return {
        success: true,
        cases: assignments.map((a) => ({
          id: a.pqrs.id,
          filingNumber: a.pqrs.radicado,
          subject: a.pqrs.asunto,
          stateCode: a.pqrs.estado,
          assignedAt: a.createdAt,
        })),
      }
    } catch (error) {
      console.error('[VU/Assignment] error casos por asignado:', error)
      return { success: false, cases: [], error: 'Error al obtener casos asignados' }
    }
  }
}

export const assignmentService = new AssignmentService()
