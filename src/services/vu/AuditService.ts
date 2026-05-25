/**
 * VU - Audit Service
 *
 * Adapter sobre lib/auditoria.ts (que escribe en `RegistroAuditoria`).
 * Conserva la API de ventanilla_unica_base para no romper llamadores VU.
 *
 * Notas:
 *  - El "checksum chain" del AuditService original no se porta: la tabla
 *    RegistroAuditoria de personeriabuga no tiene los campos checksum/
 *    previousHash. Si en el futuro se quiere chain inmutable, agregar esos
 *    campos al schema y reactivar el calculo aqui.
 *  - tenantId/userEmail/userRole no se persisten en RegistroAuditoria:
 *    el contexto multi-tenant ya esta resuelto por getTenantPrisma() en
 *    la llamada a registrarAuditoria. Esos datos quedan en `metadata`
 *    para conservar trazabilidad opcional.
 */

import { registrarAuditoria, obtenerAuditoria } from '@/lib/auditoria'
import type { AccionAuditoria } from '@/lib/auditoria'

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CASE_CREATED'
  | 'CASE_VIEWED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'INTERNAL_NOTE'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_DELETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DEACTIVATED'
  | 'USER_ACTIVATED'
  | 'CITIZEN_REQUEST'
  | 'CITIZEN_CONTACT'
  | 'ASSIGNED'
  | 'REASSIGNED'
  | 'SLA_CREATED'
  | 'SLA_UPDATED'
  | 'SUPERVISION_VIEWED'
  | 'SUPERVISION_EXPORTED'
  | 'METRICS_VIEWED'
  | 'REPORT_GENERATED'
  | 'REPORT_DOWNLOADED'
  | 'SETTING_CREATED'
  | 'SETTING_UPDATED'
  | 'NOTIFICATION_SENT'
  | 'NOTIFICATION_FAILED'
  | 'NOTIFICATION_DELIVERED'
  | 'TENANT_CREATED'
  | 'TENANT_UPDATED'
  | 'TENANT_DEACTIVATED'
  | 'TENANT_ACTIVATED'
  | 'ADMIN_CREATED'
  | 'ADMIN_UPDATED'
  | 'ADMIN_PASSWORD_RESET'
  | 'SOLICITUD_RESPONDIDA'
  | 'SOLICITUD_RECHAZADA'

export interface AuditLogInput {
  action: AuditAction
  userId: string | null
  userEmail: string
  userRole: string
  entityType: string
  entityId: string
  tenantId: string | null
  ipAddress: string
  userAgent: string
  metadata?: Record<string, unknown>
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  caseId?: string
}

/** Mapea AuditAction (VU) a AccionAuditoria (lib/auditoria) preservando todo lo que no encaja. */
function mapAccion(action: AuditAction): AccionAuditoria {
  switch (action) {
    case 'CASE_CREATED':
    case 'USER_CREATED':
    case 'SLA_CREATED':
    case 'SETTING_CREATED':
    case 'TENANT_CREATED':
    case 'ADMIN_CREATED':
      return 'CREATE'
    case 'USER_UPDATED':
    case 'USER_DEACTIVATED':
    case 'USER_ACTIVATED':
    case 'SLA_UPDATED':
    case 'SETTING_UPDATED':
    case 'TENANT_UPDATED':
    case 'TENANT_DEACTIVATED':
    case 'TENANT_ACTIVATED':
    case 'ADMIN_UPDATED':
    case 'ADMIN_PASSWORD_RESET':
    case 'STATUS_CHANGED':
    case 'COMMENT_ADDED':
    case 'INTERNAL_NOTE':
      return 'UPDATE'
    case 'DOCUMENT_DELETED':
      return 'DELETE'
    case 'LOGIN':
      return 'LOGIN'
    case 'LOGOUT':
      return 'LOGOUT'
    case 'CASE_VIEWED':
    case 'DOCUMENT_VIEWED':
    case 'SUPERVISION_VIEWED':
    case 'METRICS_VIEWED':
      return 'VIEW'
    case 'DOCUMENT_UPLOADED':
      return 'UPLOAD'
    case 'REPORT_DOWNLOADED':
      return 'DOWNLOAD'
    case 'REPORT_GENERATED':
      return 'EXPORT'
    case 'ASSIGNED':
    case 'REASSIGNED':
      return 'ASSIGN'
    case 'SOLICITUD_RESPONDIDA':
    case 'SOLICITUD_RECHAZADA':
      return 'RESPOND'
    case 'CITIZEN_REQUEST':
    case 'CITIZEN_CONTACT':
    case 'NOTIFICATION_SENT':
    case 'NOTIFICATION_FAILED':
    case 'NOTIFICATION_DELIVERED':
    case 'SUPERVISION_EXPORTED':
    default:
      return 'UPDATE'
  }
}

export class AuditService {
  /**
   * Registra una accion en la tabla RegistroAuditoria.
   * Devuelve { success } por compatibilidad con el AuditService original.
   */
  async log(input: AuditLogInput): Promise<{ success: boolean; logId?: string; error?: string }> {
    try {
      await registrarAuditoria({
        accion: mapAccion(input.action),
        entidad: input.entityType,
        entidadId: input.entityId,
        usuarioId: input.userId ?? undefined,
        datosAntes: input.before,
        datosDespues: input.after,
        descripcion: `[VU/${input.action}] ${input.metadata ? JSON.stringify({
          ...input.metadata,
          userEmail: input.userEmail,
          userRole: input.userRole,
          tenantId: input.tenantId,
          caseId: input.caseId,
        }) : ''}`,
      })
      return { success: true }
    } catch (error) {
      console.error('[VU/AUDIT ERROR]', error)
      console.log('[VU/AUDIT FALLBACK]', { timestamp: new Date().toISOString(), ...input })
      return { success: false, error: 'Failed to create audit log' }
    }
  }

  async getLogsForEntity(_tenantId: string, entityType: string, entityId: string) {
    return obtenerAuditoria({ entidad: entityType, entidadId: entityId } as never).catch(() => [])
  }

  async getLogsForUser(_tenantId: string, userId: string, limit = 50) {
    return obtenerAuditoria({ usuarioId: userId, limit } as never).catch(() => [])
  }

  // ─── Convenience methods (wrappers sobre log) ─────────────────────────────

  async logLogin(userId: string, userEmail: string, userRole: string, tenantId: string | null, ip: string, ua: string) {
    return this.log({ action: 'LOGIN', userId, userEmail, userRole, entityType: 'Session', entityId: userId, tenantId, ipAddress: ip, userAgent: ua })
  }

  async logLogout(userId: string, userEmail: string, userRole: string, tenantId: string | null, ip: string, ua: string) {
    return this.log({ action: 'LOGOUT', userId, userEmail, userRole, entityType: 'Session', entityId: userId, tenantId, ipAddress: ip, userAgent: ua })
  }

  async logCaseCreated(caseId: string, userId: string, userEmail: string, userRole: string, tenantId: string, metadata?: Record<string, unknown>) {
    return this.log({ action: 'CASE_CREATED', userId, userEmail, userRole, entityType: 'PQRS', entityId: caseId, tenantId, ipAddress: 'system', userAgent: 'system', metadata, caseId })
  }

  async logStatusChanged(caseId: string, userId: string, userEmail: string, userRole: string, tenantId: string, before: Record<string, unknown>, after: Record<string, unknown>) {
    return this.log({ action: 'STATUS_CHANGED', userId, userEmail, userRole, entityType: 'PQRS', entityId: caseId, tenantId, ipAddress: 'system', userAgent: 'system', before, after, caseId })
  }

  async logDocumentUploaded(documentId: string, userId: string, userEmail: string, userRole: string, tenantId: string, metadata?: Record<string, unknown>) {
    return this.log({ action: 'DOCUMENT_UPLOADED', userId, userEmail, userRole, entityType: 'Documento', entityId: documentId, tenantId, ipAddress: 'system', userAgent: 'system', metadata })
  }

  async logCitizenAction(action: AuditAction, citizenId: string, tenantId: string, metadata?: Record<string, unknown>) {
    return this.log({ action, userId: null, userEmail: 'citizen', userRole: 'CIUDADANO', entityType: 'Ciudadano', entityId: citizenId, tenantId, ipAddress: 'system', userAgent: 'system', metadata })
  }
}

// Singleton para uso directo
export const auditService = new AuditService()
