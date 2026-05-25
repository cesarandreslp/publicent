/**
 * VU - Email Service
 *
 * Adapter delgado sobre lib/mail.ts (Resend) de personeriabuga.
 * Conserva la API publica de EmailService de ventanilla_unica_base.
 *
 * Notas de adaptacion:
 *  - El EmailService original usaba SMTP directo con nodemailer y soportaba
 *    multiples configuraciones por tenant. personeriabuga usa Resend (mas
 *    simple, multi-tenant transparente). Se conserva la firma de sendEmail()
 *    pero los parametros SMTP-especificos (fromEmail/fromName/replyTo) se
 *    mapean al equivalente Resend.
 *  - Los metodos especializados (sendCitizenConfirmationEmail, etc.)
 *    delegan en sendEmail con plantillas HTML simplificadas. Si se requiere
 *    paridad pixel-a-pixel con el HTML original, puede importarse desde
 *    TemplateService o expandirse aqui.
 *  - tenantId es opcional y se ignora: la BD ya esta resuelta por contexto.
 */

import { sendMail } from '@/lib/mail'

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string | false
  fromEmail?: string
  fromName?: string
  tenantId?: string
}

export class EmailService {
  static getBaseUrl(): string {
    return process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000'
  }

  static async getBaseUrlForTenant(_tenantId?: string): Promise<string> {
    return this.getBaseUrl()
  }

  /**
   * Envio basico. Devuelve true si Resend reporta envio exitoso.
   */
  static async sendEmail(params: SendEmailParams): Promise<boolean> {
    try {
      const from = params.fromName && params.fromEmail
        ? `${params.fromName} <${params.fromEmail}>`
        : params.fromEmail
      await sendMail({
        to: params.to,
        subject: params.subject,
        html: params.html,
        from,
      })
      return true
    } catch (error) {
      console.error('[VU/Email] error enviando:', error)
      return false
    }
  }

  /**
   * Render con placeholders {{var}}. Igual que TemplateService.render pero
   * sin el soporte de {{#if}}, conservado por compatibilidad.
   */
  static renderTemplate(template: string, data: Record<string, unknown>): string {
    let out = template
    Object.entries(data).forEach(([key, value]) => {
      const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      out = out.replace(re, String(value ?? ''))
    })
    return out
  }

  static async validateConfiguration(): Promise<boolean> {
    return Boolean(process.env.RESEND_API_KEY)
  }

  // ─── Metodos especializados (wrappers sobre sendEmail) ────────────────────

  /**
   * Confirma al ciudadano que su PQRS fue radicado.
   */
  static async sendCitizenConfirmationEmail(params: {
    email: string
    citizenName: string
    filingNumber: string
    caseType: string
    dueDate: string
    portalUrl?: string
  }): Promise<boolean> {
    const html = `
      <h2>Confirmacion de radicacion</h2>
      <p>Estimado(a) ${params.citizenName},</p>
      <p>Hemos recibido su solicitud. Datos:</p>
      <ul>
        <li><strong>Radicado:</strong> ${params.filingNumber}</li>
        <li><strong>Tipo:</strong> ${params.caseType}</li>
        <li><strong>Fecha limite de respuesta:</strong> ${params.dueDate}</li>
      </ul>
      ${params.portalUrl ? `<p>Consulte el estado en: <a href="${params.portalUrl}">${params.portalUrl}</a></p>` : ''}
      <p>Cordialmente,<br/>Entidad Institucional</p>
    `
    return this.sendEmail({
      to: params.email,
      subject: `Radicado de su solicitud - ${params.filingNumber}`,
      html,
    })
  }

  /**
   * Notifica al ciudadano que su PQRS fue reasignado a otra entidad.
   */
  static async sendCitizenReassignmentEmail(params: {
    email: string
    citizenName: string
    filingNumber: string
    entityDestination: string
    reason?: string
  }): Promise<boolean> {
    const html = `
      <h2>Reasignacion de su solicitud</h2>
      <p>Estimado(a) ${params.citizenName},</p>
      <p>Su solicitud <strong>${params.filingNumber}</strong> ha sido reasignada a:
      <strong>${params.entityDestination}</strong>.</p>
      ${params.reason ? `<p><strong>Motivo:</strong> ${params.reason}</p>` : ''}
      <p>Cordialmente,<br/>Entidad Institucional</p>
    `
    return this.sendEmail({
      to: params.email,
      subject: `Reasignacion de su solicitud - ${params.filingNumber}`,
      html,
    })
  }

  /**
   * Envia la respuesta oficial al ciudadano.
   */
  static async sendCaseResponseEmail(params: {
    email: string
    citizenName: string
    filingNumber: string
    responseMessage: string
    attachmentUrl?: string
  }): Promise<boolean> {
    const html = `
      <h2>Respuesta a su solicitud</h2>
      <p>Estimado(a) ${params.citizenName},</p>
      <p>Su solicitud <strong>${params.filingNumber}</strong> ha sido respondida:</p>
      <blockquote style="border-left:4px solid #4caf50;padding-left:12px;margin:16px 0;">
        ${params.responseMessage}
      </blockquote>
      ${params.attachmentUrl ? `<p>Documento adjunto: <a href="${params.attachmentUrl}">descargar</a></p>` : ''}
      <p>Cordialmente,<br/>Entidad Institucional</p>
    `
    return this.sendEmail({
      to: params.email,
      subject: `Respuesta a su solicitud - ${params.filingNumber}`,
      html,
    })
  }

  /**
   * Notifica al ciudadano que su PQRS fue escalado a otro nivel.
   */
  static async sendEscalationNoticeToCitizen(params: {
    email: string
    citizenName: string
    filingNumber: string
    escalationReason?: string
  }): Promise<boolean> {
    const html = `
      <h2>Escalamiento de su solicitud</h2>
      <p>Estimado(a) ${params.citizenName},</p>
      <p>Su solicitud <strong>${params.filingNumber}</strong> ha sido escalada al nivel correspondiente.</p>
      ${params.escalationReason ? `<p><strong>Motivo:</strong> ${params.escalationReason}</p>` : ''}
      <p>Cordialmente,<br/>Entidad Institucional</p>
    `
    return this.sendEmail({
      to: params.email,
      subject: `Escalamiento de su solicitud - ${params.filingNumber}`,
      html,
    })
  }

  /**
   * Envia email a una entidad externa (remision/traslado).
   */
  static async sendEntityEmail(params: {
    to: string
    subject: string
    body: string
    filingNumber?: string
    attachmentUrl?: string
  }): Promise<boolean> {
    const html = `
      <h2>${params.subject}</h2>
      ${params.filingNumber ? `<p><strong>Radicado origen:</strong> ${params.filingNumber}</p>` : ''}
      <div>${params.body}</div>
      ${params.attachmentUrl ? `<p>Documento adjunto: <a href="${params.attachmentUrl}">descargar</a></p>` : ''}
    `
    return this.sendEmail({
      to: params.to,
      subject: params.subject,
      html,
    })
  }
}
