/**
 * VU - Notification Hooks
 *
 * Hooks no invasivos para disparar notificaciones desde los flujos del
 * modulo Ventanilla Unica.
 *
 * Reglas:
 *  - Los errores NUNCA se propagan: las notificaciones son opcionales.
 *  - Si no hay email del destinatario, se loguea y se omite el envio.
 *  - Tipos de notificacion mapeados al enum espanol VuTipoNotificacion:
 *      CASE_FILED          -> RADICACION
 *      CASE_ASSIGNED       -> ASIGNACION
 *      CASE_STATE_CHANGED  -> CAMBIO_ESTADO
 *      CASE_OVERDUE        -> PROXIMO_A_VENCER
 *      INFORMATION_REQUIRED-> MENCION
 *      GENERIC (notas)     -> MENCION
 */

import { NotificationService } from './NotificationService'
import { EmailService } from './EmailService'

const FECHA_ES_CO: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }

export class NotificationHooks {
  /**
   * PQRS radicado — notifica al ciudadano.
   */
  static async onCaseFiled(caseData: {
    id: string
    filingNumber: string
    citizenId: string
    citizenName: string
    citizenEmail?: string
    caseType: string
    filedAt: Date
    dueDate: Date
    tenantId?: string
  }): Promise<void> {
    try {
      if (!caseData.citizenEmail) {
        console.log('[VU/Hook] sin email de ciudadano, omito notificacion de radicacion')
        return
      }

      await NotificationService.createNotification({
        recipientType: 'CITIZEN',
        recipientId: caseData.citizenId,
        recipientEmail: caseData.citizenEmail,
        caseId: caseData.id,
        type: 'RADICACION',
        channel: 'EMAIL',
        tenantId: caseData.tenantId,
        templateData: {
          citizenName: caseData.citizenName,
          filingNumber: caseData.filingNumber,
          caseType: caseData.caseType,
          filedAt: caseData.filedAt.toLocaleDateString('es-CO', FECHA_ES_CO),
          dueDate: caseData.dueDate.toLocaleDateString('es-CO', FECHA_ES_CO),
        },
      })
      console.log(`[VU/Hook] notificacion de radicacion creada (${caseData.filingNumber})`)
    } catch (error) {
      console.error('[VU/Hook] error en onCaseFiled:', error)
    }
  }

  /**
   * PQRS asignado a un funcionario — notifica al funcionario.
   */
  static async onCaseAssigned(assignmentData: {
    caseId: string
    filingNumber: string
    userId: string
    userName: string
    userEmail?: string
    citizenName: string
    caseType: string
    dueDate: Date
    tenantId?: string
  }): Promise<void> {
    try {
      if (!assignmentData.userEmail) {
        console.log('[VU/Hook] sin email de funcionario, omito notificacion de asignacion')
        return
      }

      const baseUrl = await EmailService.getBaseUrlForTenant(assignmentData.tenantId)

      const notificationId = await NotificationService.createNotification({
        recipientType: 'USER',
        recipientId: assignmentData.userId,
        recipientEmail: assignmentData.userEmail,
        caseId: assignmentData.caseId,
        type: 'ASIGNACION',
        channel: 'EMAIL',
        tenantId: assignmentData.tenantId,
        templateData: {
          userName: assignmentData.userName,
          filingNumber: assignmentData.filingNumber,
          citizenName: assignmentData.citizenName,
          caseType: assignmentData.caseType,
          dueDate: assignmentData.dueDate.toLocaleDateString('es-CO', FECHA_ES_CO),
          caseUrl: `${baseUrl}/admin/ventanilla/${assignmentData.caseId}`,
        },
      })

      if (notificationId) {
        await NotificationService.sendNotification(notificationId)
      }
      console.log(`[VU/Hook] notificacion de asignacion creada (${assignmentData.filingNumber})`)
    } catch (error) {
      console.error('[VU/Hook] error en onCaseAssigned:', error)
    }
  }

  /**
   * Cambio de estado del PQRS — notifica al ciudadano.
   */
  static async onStateChanged(stateData: {
    caseId: string
    filingNumber: string
    citizenId: string
    citizenName: string
    citizenEmail?: string
    previousState: string
    newState: string
    comment?: string
    tenantId?: string
  }): Promise<void> {
    try {
      if (!stateData.citizenEmail) {
        console.log('[VU/Hook] sin email de ciudadano, omito notificacion de cambio de estado')
        return
      }

      await NotificationService.createNotification({
        recipientType: 'CITIZEN',
        recipientId: stateData.citizenId,
        recipientEmail: stateData.citizenEmail,
        caseId: stateData.caseId,
        type: 'CAMBIO_ESTADO',
        channel: 'EMAIL',
        tenantId: stateData.tenantId,
        templateData: {
          citizenName: stateData.citizenName,
          filingNumber: stateData.filingNumber,
          previousState: stateData.previousState,
          newState: stateData.newState,
          stateComment: stateData.comment || '',
        },
      })
      console.log(`[VU/Hook] notificacion de cambio de estado creada (${stateData.filingNumber})`)
    } catch (error) {
      console.error('[VU/Hook] error en onStateChanged:', error)
    }
  }

  /**
   * PQRS proximo a vencer — alerta al funcionario asignado.
   */
  static async onCaseOverdue(overdueData: {
    caseId: string
    filingNumber: string
    userId: string
    userName: string
    userEmail?: string
    citizenName: string
    caseType: string
    dueDate: Date
    daysRemaining: number
    tenantId?: string
  }): Promise<void> {
    try {
      if (!overdueData.userEmail) {
        console.log('[VU/Hook] sin email de funcionario, omito alerta de vencimiento')
        return
      }

      await NotificationService.createNotification({
        recipientType: 'USER',
        recipientId: overdueData.userId,
        recipientEmail: overdueData.userEmail,
        caseId: overdueData.caseId,
        type: 'PROXIMO_A_VENCER',
        channel: 'EMAIL',
        tenantId: overdueData.tenantId,
        templateData: {
          userName: overdueData.userName,
          filingNumber: overdueData.filingNumber,
          citizenName: overdueData.citizenName,
          caseType: overdueData.caseType,
          dueDate: overdueData.dueDate.toLocaleDateString('es-CO', FECHA_ES_CO),
          daysRemaining: overdueData.daysRemaining,
        },
      })
      console.log(`[VU/Hook] alerta de vencimiento creada (${overdueData.filingNumber})`)
    } catch (error) {
      console.error('[VU/Hook] error en onCaseOverdue:', error)
    }
  }

  /**
   * Solicitud de informacion adicional al ciudadano.
   */
  static async onInformationRequired(infoData: {
    caseId: string
    filingNumber: string
    citizenId: string
    citizenName: string
    citizenEmail?: string
    requiredInformation: string
    tenantId?: string
  }): Promise<void> {
    try {
      if (!infoData.citizenEmail) {
        console.log('[VU/Hook] sin email de ciudadano, omito solicitud de informacion')
        return
      }

      await NotificationService.createNotification({
        recipientType: 'CITIZEN',
        recipientId: infoData.citizenId,
        recipientEmail: infoData.citizenEmail,
        caseId: infoData.caseId,
        type: 'MENCION',
        channel: 'EMAIL',
        tenantId: infoData.tenantId,
        templateData: {
          citizenName: infoData.citizenName,
          filingNumber: infoData.filingNumber,
          requiredInformation: infoData.requiredInformation,
        },
      })
      console.log(`[VU/Hook] solicitud de info adicional creada (${infoData.filingNumber})`)
    } catch (error) {
      console.error('[VU/Hook] error en onInformationRequired:', error)
    }
  }

  /**
   * Nota interna agregada al PQRS — notifica al funcionario asignado.
   */
  static async onInternalNote(noteData: {
    caseId: string
    filingNumber: string
    authorName: string
    funcionarioId: string
    funcionarioName: string
    funcionarioEmail: string
    tenantId?: string
  }): Promise<void> {
    try {
      const notificationId = await NotificationService.createNotification({
        recipientType: 'USER',
        recipientId: noteData.funcionarioId,
        recipientEmail: noteData.funcionarioEmail,
        caseId: noteData.caseId,
        type: 'MENCION',
        channel: 'EMAIL',
        tenantId: noteData.tenantId,
        templateData: {
          message: `${noteData.authorName} dejo una nota interna en el caso ${noteData.filingNumber}. Revisa tu bandeja.`,
          userName: noteData.funcionarioName,
          filingNumber: noteData.filingNumber,
        },
      })

      if (notificationId) {
        await NotificationService.sendNotification(notificationId)
      }
      console.log(`[VU/Hook] notificacion de nota interna enviada (${noteData.filingNumber})`)
    } catch (error) {
      console.error('[VU/Hook] error en onInternalNote:', error)
    }
  }

  /**
   * Notificacion personalizada generica.
   */
  static async sendCustomNotification(customData: {
    recipientType: 'CITIZEN' | 'USER'
    recipientId: string
    recipientEmail?: string
    caseId?: string
    message: string
    tenantId?: string
  }): Promise<void> {
    try {
      if (!customData.recipientEmail) {
        console.log('[VU/Hook] sin email, omito notificacion personalizada')
        return
      }

      await NotificationService.createNotification({
        recipientType: customData.recipientType,
        recipientId: customData.recipientId,
        recipientEmail: customData.recipientEmail,
        caseId: customData.caseId,
        type: 'MENCION',
        channel: 'EMAIL',
        tenantId: customData.tenantId,
        templateData: { message: customData.message },
      })
      console.log('[VU/Hook] notificacion personalizada creada')
    } catch (error) {
      console.error('[VU/Hook] error en sendCustomNotification:', error)
    }
  }
}
