/**
 * VU - Template Service
 *
 * Plantillas de notificaciones (email) por tipo de evento del modulo VU.
 *
 * Adaptaciones respecto a ventanilla_unica_base:
 *  - NotificationType (ingles) -> VuTipoNotificacion (espanol)
 *  - Mapping de claves:
 *      CASE_FILED          -> RADICACION
 *      CASE_ASSIGNED       -> ASIGNACION
 *      CASE_STATE_CHANGED  -> CAMBIO_ESTADO
 *      CASE_RESPONSE       -> RESPUESTA
 *      CASE_OVERDUE        -> PROXIMO_A_VENCER / VENCIDO
 *      INFORMATION_REQUIRED -> MENCION (reutilizada)
 *      GENERIC             -> default (no key)
 */

import { VuTipoNotificacion, VuCanalNotificacion } from '@prisma/client'

interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

const HEADER_STYLE_BLUE   = 'background-color:#0066cc;color:white;padding:20px;text-align:center;'
const HEADER_STYLE_GREEN  = 'background-color:#4caf50;color:white;padding:20px;text-align:center;'
const HEADER_STYLE_RED    = 'background-color:#f44336;color:white;padding:20px;text-align:center;'
const HEADER_STYLE_ORANGE = 'background-color:#ff9800;color:white;padding:20px;text-align:center;'

function shell(headerStyle: string, headerTitle: string, body: string): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="${headerStyle}"><h1>${headerTitle}</h1></div>
    <div style="padding:20px;background-color:#f9f9f9;">${body}</div>
    <div style="text-align:center;padding:20px;font-size:12px;color:#666;">
      <p>Sistema de Ventanilla Unica</p>
    </div>
  </div>
</body></html>`
}

export const DEFAULT_EMAIL_TEMPLATES: Partial<Record<VuTipoNotificacion, EmailTemplate>> = {
  RADICACION: {
    subject: 'Radicado de su solicitud - {{filingNumber}}',
    html: shell(HEADER_STYLE_BLUE, 'Entidad Institucional', `
      <p>Estimado(a) {{citizenName}},</p>
      <p>Su solicitud ha sido radicada exitosamente con el siguiente numero:</p>
      <div style="background-color:#fff;padding:15px;margin:20px 0;border-left:4px solid #0066cc;">
        <h2 style="margin:0;color:#0066cc;">{{filingNumber}}</h2>
        <p><strong>Tipo:</strong> {{caseType}}</p>
        <p><strong>Fecha de radicacion:</strong> {{filedAt}}</p>
        <p><strong>Fecha limite de respuesta:</strong> {{dueDate}}</p>
      </div>
      <p>Puede consultar el estado de su solicitud en cualquier momento desde nuestro portal.</p>
      <p>Cordialmente,<br><strong>Entidad Institucional</strong></p>
    `),
  },

  ASIGNACION: {
    subject: 'Caso asignado - {{filingNumber}}',
    html: shell(HEADER_STYLE_BLUE, 'Asignacion de Caso', `
      <p>Estimado(a) {{userName}},</p>
      <p>Se le ha asignado el siguiente caso para su gestion:</p>
      <div style="background-color:#fff;padding:15px;margin:20px 0;border-left:4px solid #ff9800;">
        <p><strong>Radicado:</strong> {{filingNumber}}</p>
        <p><strong>Ciudadano:</strong> {{citizenName}}</p>
        <p><strong>Tipo:</strong> {{caseType}}</p>
        <p><strong>Fecha limite:</strong> {{dueDate}}</p>
      </div>
      <p>Acceda al caso desde su bandeja de entrada:</p>
      <p style="text-align:center;">
        <a href="{{caseUrl}}" style="display:inline-block;padding:10px 20px;background-color:#ff9800;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">Ver caso</a>
      </p>
    `),
  },

  CAMBIO_ESTADO: {
    subject: 'Actualizacion de su solicitud - {{filingNumber}}',
    html: shell(HEADER_STYLE_BLUE, 'Actualizacion de Estado', `
      <p>Estimado(a) {{citizenName}},</p>
      <p>Su solicitud <strong>{{filingNumber}}</strong> ha cambiado de estado:</p>
      <div style="background-color:#fff;padding:15px;margin:20px 0;border-left:4px solid #4caf50;">
        <p><strong>Estado anterior:</strong> {{previousState}}</p>
        <p><strong>Nuevo estado:</strong> {{newState}}</p>
        {{#if stateComment}}<p><strong>Comentario:</strong> {{stateComment}}</p>{{/if}}
      </div>
      <p>Consulte mas detalles en nuestro portal.</p>
    `),
  },

  RESPUESTA: {
    subject: 'Respuesta a su solicitud - {{filingNumber}}',
    html: shell(HEADER_STYLE_GREEN, 'Respuesta Disponible', `
      <p>Estimado(a) {{citizenName}},</p>
      <p>Tenemos una respuesta disponible para su solicitud <strong>{{filingNumber}}</strong>.</p>
      <div style="background-color:#fff;padding:15px;margin:20px 0;">
        <p>{{responseMessage}}</p>
      </div>
      <p>Puede descargar los documentos oficiales desde nuestro portal.</p>
    `),
  },

  PROXIMO_A_VENCER: {
    subject: 'Caso proximo a vencer - {{filingNumber}}',
    html: shell(HEADER_STYLE_ORANGE, 'Alerta de Vencimiento', `
      <p>Estimado(a) {{userName}},</p>
      <p>El caso <strong>{{filingNumber}}</strong> esta proximo a vencer.</p>
      <div style="background-color:#fff3cd;padding:15px;margin:20px 0;border-left:4px solid #ff9800;">
        <p><strong>Ciudadano:</strong> {{citizenName}}</p>
        <p><strong>Tipo:</strong> {{caseType}}</p>
        <p><strong>Fecha limite:</strong> {{dueDate}}</p>
        <p><strong>Dias restantes:</strong> {{daysRemaining}}</p>
      </div>
      <p><strong>Por favor, gestione este caso con prioridad.</strong></p>
    `),
  },

  VENCIDO: {
    subject: 'Caso VENCIDO - {{filingNumber}}',
    html: shell(HEADER_STYLE_RED, 'Caso Vencido', `
      <p>Estimado(a) {{userName}},</p>
      <p>El caso <strong>{{filingNumber}}</strong> ha excedido el termino legal de respuesta.</p>
      <div style="background-color:#fff3cd;padding:15px;margin:20px 0;border-left:4px solid #f44336;">
        <p><strong>Ciudadano:</strong> {{citizenName}}</p>
        <p><strong>Tipo:</strong> {{caseType}}</p>
        <p><strong>Vencimiento:</strong> {{dueDate}}</p>
      </div>
      <p>Atienda este caso de manera inmediata.</p>
    `),
  },

  MENCION: {
    subject: 'Solicitud de informacion adicional - {{filingNumber}}',
    html: shell(HEADER_STYLE_ORANGE, 'Informacion Adicional Requerida', `
      <p>Estimado(a) {{citizenName}},</p>
      <p>Para continuar con su solicitud <strong>{{filingNumber}}</strong>, necesitamos:</p>
      <div style="background-color:#fff;padding:15px;margin:20px 0;border-left:4px solid #ff9800;">
        <p>{{requiredInformation}}</p>
      </div>
      <p>Responda a la mayor brevedad posible para continuar el tramite.</p>
    `),
  },
}

const GENERIC_TEMPLATE: EmailTemplate = {
  subject: 'Notificacion - Entidad Institucional',
  html: shell(HEADER_STYLE_BLUE, 'Entidad Institucional', '<p>{{message}}</p>'),
}

export class TemplateService {
  /**
   * Obtiene la plantilla por tipo. Si no hay especifica devuelve la generica.
   * El parametro `_canal` se reserva para soportar plantillas SMS/WhatsApp.
   */
  static async getTemplate(
    tipo: VuTipoNotificacion,
    _canal: VuCanalNotificacion,
  ): Promise<EmailTemplate> {
    void _canal
    return DEFAULT_EMAIL_TEMPLATES[tipo] || GENERIC_TEMPLATE
  }

  /**
   * Renderiza una plantilla reemplazando placeholders {{key}} y {{#if key}}…{{/if}}.
   */
  static render(template: string, data: Record<string, unknown>): string {
    let out = template
    Object.entries(data).forEach(([key, value]) => {
      const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      out = out.replace(re, String(value ?? ''))
    })
    out = out.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_m, key, content) => {
      return data[key] ? content : ''
    })
    return out
  }

  /**
   * Verifica que la plantilla incluya todas las variables requeridas.
   */
  static validateTemplate(template: string, requiredVars: string[]): boolean {
    return requiredVars.every((v) => template.includes(`{{${v}}}`))
  }
}
