/**
 * VU - Notification Service
 *
 * Gestion de la cola de notificaciones del modulo VU (sobre `VuNotificacion`).
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - prisma global -> getTenantPrisma() (per-tenant DB)
 *  - Modelo Notification -> VuNotificacion (campos en espanol)
 *  - Estados PENDING/SENT/FAILED/READ -> PENDIENTE/ENVIADA/FALLIDA/LEIDA
 *  - Tipos NotificationType -> VuTipoNotificacion (Spanish enum)
 *  - Canales NotificationChannel -> VuCanalNotificacion
 *  - Sin campo maxAttempts en DB; se usa NOTIFICATION_MAX_ATTEMPTS env (default 3)
 *  - recipientType (CITIZEN/USER) inferido: si destinatarioUsuarioId existe es USER,
 *    si solo destinatarioEmail/telefono es CITIZEN/externo.
 */

import { getTenantPrisma } from '@/lib/tenant'
import {
  VuTipoNotificacion,
  VuCanalNotificacion,
  VuEstadoNotificacion,
} from '@prisma/client'
import { EmailService } from './EmailService'
import { SMSService } from './SMSService'
import { TemplateService } from './TemplateService'
import { AuditService } from './AuditService'

const MAX_ATTEMPTS = parseInt(process.env.NOTIFICATION_MAX_ATTEMPTS || '3', 10)

export interface CreateNotificationParams {
  recipientType: 'CITIZEN' | 'USER'
  recipientId: string                  // userId o citizenId logico (solo para metadata)
  recipientEmail?: string
  recipientPhone?: string
  caseId?: string                      // pqrsId
  type: VuTipoNotificacion
  channel: VuCanalNotificacion
  templateData: Record<string, unknown>
  tenantId?: string                    // se ignora (per-tenant DB) — solo metadata
}

export interface ProcessResult {
  sent: number
  failed: number
  skipped: number
}

export class NotificationService {
  /**
   * Crea una notificacion en estado PENDIENTE (no la envia aun).
   */
  static async createNotification(params: CreateNotificationParams): Promise<string> {
    const prisma = await getTenantPrisma()
    const template = await TemplateService.getTemplate(params.type, params.channel)
    const subject = TemplateService.render(template.subject, params.templateData)
    const body = TemplateService.render(template.html, params.templateData)

    const isInternalUser = params.recipientType === 'USER'

    const created = await prisma.vuNotificacion.create({
      data: {
        pqrsId: params.caseId,
        destinatarioUsuarioId: isInternalUser ? params.recipientId : undefined,
        destinatarioEmail: params.recipientEmail,
        destinatarioTelefono: params.recipientPhone,
        tipo: params.type,
        canal: params.channel,
        estado: 'PENDIENTE',
        asunto: subject,
        contenido: body,
        intentos: 0,
      },
    })

    console.log(`[VU/Notification] creada ${created.id} (${params.type})`)
    return created.id
  }

  /**
   * Procesa hasta 50 notificaciones pendientes.
   */
  static async processPendingNotifications(): Promise<ProcessResult> {
    const result: ProcessResult = { sent: 0, failed: 0, skipped: 0 }
    try {
      const prisma = await getTenantPrisma()
      const pending = await prisma.vuNotificacion.findMany({
        where: { estado: 'PENDIENTE' },
        orderBy: { createdAt: 'asc' },
        take: 50,
      })

      console.log(`[VU/Notification] procesando ${pending.length} pendientes...`)

      for (const n of pending) {
        const success = await this.sendNotification(n.id)
        if (success) result.sent++
        else if (n.intentos >= MAX_ATTEMPTS - 1) result.failed++
        else result.skipped++
      }

      console.log('[VU/Notification] procesamiento:', result)
      return result
    } catch (error) {
      console.error('[VU/Notification] error procesando cola:', error)
      return result
    }
  }

  /**
   * Envia una notificacion por su id. Reintenta con limite MAX_ATTEMPTS.
   */
  static async sendNotification(notificationId: string): Promise<boolean> {
    const prisma = await getTenantPrisma()
    try {
      const n = await prisma.vuNotificacion.findUnique({ where: { id: notificationId } })
      if (!n) {
        console.error('[VU/Notification] no encontrada:', notificationId)
        return false
      }

      if (n.intentos >= MAX_ATTEMPTS) {
        await this.markAsFailed(notificationId, 'Maximo de intentos alcanzado')
        return false
      }

      await prisma.vuNotificacion.update({
        where: { id: notificationId },
        data: { intentos: n.intentos + 1 },
      })

      let success = false
      switch (n.canal) {
        case 'EMAIL':
          if (n.destinatarioEmail) {
            success = await EmailService.sendEmail({
              to: n.destinatarioEmail,
              subject: n.asunto || '(sin asunto)',
              html: n.contenido,
            })
          }
          break
        case 'SMS':
          if (n.destinatarioTelefono) {
            success = await SMSService.sendSMS({ to: n.destinatarioTelefono, message: n.contenido })
          }
          break
        case 'WHATSAPP':
        case 'IN_APP':
        case 'WEBHOOK':
        default:
          console.warn(`[VU/Notification] canal no implementado: ${n.canal}`)
          success = false
      }

      const audit = new AuditService()
      if (success) {
        await this.markAsSent(notificationId)
        await audit.log({
          action: 'NOTIFICATION_SENT',
          userId: 'system',
          userEmail: 'system@vu.local',
          userRole: 'SYSTEM',
          tenantId: null,
          entityType: 'VuNotificacion',
          entityId: notificationId,
          ipAddress: 'system',
          userAgent: 'system',
          metadata: { tipo: n.tipo, canal: n.canal },
        })
      } else if (n.intentos + 1 >= MAX_ATTEMPTS) {
        await this.markAsFailed(notificationId, 'Error al enviar')
        await audit.log({
          action: 'NOTIFICATION_FAILED',
          userId: 'system',
          userEmail: 'system@vu.local',
          userRole: 'SYSTEM',
          tenantId: null,
          entityType: 'VuNotificacion',
          entityId: notificationId,
          ipAddress: 'system',
          userAgent: 'system',
          metadata: { tipo: n.tipo, canal: n.canal, intentos: n.intentos + 1 },
        })
      }

      return success
    } catch (error) {
      console.error('[VU/Notification] error enviando:', error)
      return false
    }
  }

  // ─── Helpers privados ─────────────────────────────────────────────────────

  private static async markAsSent(notificationId: string): Promise<void> {
    const prisma = await getTenantPrisma()
    await prisma.vuNotificacion.update({
      where: { id: notificationId },
      data: { estado: 'ENVIADA', enviadaEn: new Date() },
    })
  }

  private static async markAsFailed(notificationId: string, msg: string): Promise<void> {
    const prisma = await getTenantPrisma()
    await prisma.vuNotificacion.update({
      where: { id: notificationId },
      data: { estado: 'FALLIDA', ultimoError: msg },
    })
  }

  static async markAsRead(notificationId: string): Promise<void> {
    const prisma = await getTenantPrisma()
    await prisma.vuNotificacion.update({
      where: { id: notificationId },
      data: { estado: 'LEIDA', leidaEn: new Date() },
    })
  }

  // ─── Consultas ────────────────────────────────────────────────────────────

  static async getNotificationHistory(params: {
    caseId?: string
    recipientId?: string                  // destinatarioUsuarioId
    status?: VuEstadoNotificacion
    type?: VuTipoNotificacion
    limit?: number
    offset?: number
  }) {
    const prisma = await getTenantPrisma()
    return prisma.vuNotificacion.findMany({
      where: {
        pqrsId: params.caseId,
        destinatarioUsuarioId: params.recipientId,
        estado: params.status,
        tipo: params.type,
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
    })
  }

  static async getStatistics(params?: { dateFrom?: Date; dateTo?: Date }) {
    const prisma = await getTenantPrisma()
    const where: { createdAt?: { gte?: Date; lte?: Date } } = {}
    if (params?.dateFrom || params?.dateTo) {
      where.createdAt = { gte: params?.dateFrom, lte: params?.dateTo }
    }

    const [total, sent, pending, failed, byType, byChannel] = await Promise.all([
      prisma.vuNotificacion.count({ where }),
      prisma.vuNotificacion.count({ where: { ...where, estado: 'ENVIADA' } }),
      prisma.vuNotificacion.count({ where: { ...where, estado: 'PENDIENTE' } }),
      prisma.vuNotificacion.count({ where: { ...where, estado: 'FALLIDA' } }),
      prisma.vuNotificacion.groupBy({ by: ['tipo'], where, _count: true }),
      prisma.vuNotificacion.groupBy({ by: ['canal'], where, _count: true }),
    ])

    return {
      total,
      sent,
      pending,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0',
      byType: byType.map((i) => ({ type: i.tipo, count: i._count })),
      byChannel: byChannel.map((i) => ({ channel: i.canal, count: i._count })),
    }
  }

  /**
   * Reenvia una notificacion fallida (resetea estado e intentos).
   */
  static async retryNotification(notificationId: string): Promise<boolean> {
    const prisma = await getTenantPrisma()
    await prisma.vuNotificacion.update({
      where: { id: notificationId },
      data: { estado: 'PENDIENTE', intentos: 0, ultimoError: null },
    })
    return this.sendNotification(notificationId)
  }
}
