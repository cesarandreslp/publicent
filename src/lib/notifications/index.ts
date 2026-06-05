/**
 * notifications/index.ts — Despacho unificado de notificaciones a ciudadanos.
 *
 * Resuelve la configuración del tenant (WhatsApp cifrado en la meta-DB) y despacha
 * por el canal solicitado. Diseñado para ser fire-and-forget: nunca lanza, devuelve
 * el resultado por canal para que el llamador lo registre si quiere.
 */

import { prismaMeta } from '@/lib/prisma-meta'
import { decryptSecretos } from '@/lib/encryption'
import { sendMail } from '@/lib/mail'
import { sendWhatsApp, bodyParams, type WhatsAppConfig, type WhatsAppResult } from './whatsapp'

export type CanalNotificacion = 'EMAIL' | 'WHATSAPP' | 'AMBOS'
export type EventoCiudadano = 'radicado' | 'respondida' | 'por_vencer'

export interface DatosCiudadano {
  /** Teléfono del ciudadano (cualquier formato; se normaliza a E.164). */
  telefono?: string | null
  /** Email del ciudadano. */
  email?: string | null
  /** Número de radicado. */
  radicado: string
  /** Tipo legible de la solicitud (Petición, Queja, etc.). */
  tipo?: string
  /** Fecha de vencimiento legible (solo para 'radicado'). */
  fechaVencimiento?: string
  /** URL pública de consulta del radicado. */
  urlConsulta?: string
  /** Días hábiles restantes (solo para 'por_vencer'). */
  diasRestantes?: number
  /** Asunto del email (si se despacha por EMAIL). */
  asuntoEmail?: string
  /** Cuerpo HTML del email (si se despacha por EMAIL). */
  htmlEmail?: string
  /** Remitente del email opcional. */
  fromEmail?: string
}

export interface ResultadoNotificacion {
  whatsapp?: WhatsAppResult
  email?: { success: boolean; error?: string }
}

/**
 * Lee y descifra la configuración WhatsApp del tenant desde la meta-DB.
 * Retorna null si no está configurada.
 */
export async function getWhatsAppConfig(tenantId: string): Promise<WhatsAppConfig | null> {
  try {
    const tenant = await prismaMeta.tenant.findUnique({
      where: { id: tenantId },
      select: { secretosEncriptados: true },
    })
    const secretos = decryptSecretos(tenant?.secretosEncriptados)
    const wa = secretos.whatsapp
    if (!wa?.phoneNumberId || !wa?.accessToken) return null
    return { phoneNumberId: wa.phoneNumberId, accessToken: wa.accessToken, fromPhone: wa.fromPhone ?? '' }
  } catch {
    return null
  }
}

/** Mapea un evento + datos a (plantilla, components) de WhatsApp. */
function plantillaParaEvento(evento: EventoCiudadano, d: DatosCiudadano): { template: string; components: object[] } | null {
  switch (evento) {
    case 'radicado':
      return {
        template: 'pqrsd_radicado',
        components: bodyParams(d.tipo ?? 'solicitud', d.radicado, d.fechaVencimiento ?? '-', d.urlConsulta ?? '-'),
      }
    case 'respondida':
      return {
        template: 'pqrsd_respondida',
        components: bodyParams(d.tipo ?? 'solicitud', d.radicado, d.urlConsulta ?? '-'),
      }
    case 'por_vencer':
      return {
        template: 'pqrsd_por_vencer',
        components: bodyParams(d.tipo ?? 'solicitud', d.diasRestantes ?? 0, d.radicado),
      }
    default:
      return null
  }
}

/**
 * Despacha una notificación al ciudadano por el canal indicado.
 * - WhatsApp: silencia el error si el tenant no lo tiene configurado o falta teléfono.
 * - Email: usa `htmlEmail`/`asuntoEmail` si se proveen.
 */
export async function notificarCiudadano(
  tenantId: string,
  canal: CanalNotificacion,
  evento: EventoCiudadano,
  datos: DatosCiudadano
): Promise<ResultadoNotificacion> {
  const resultado: ResultadoNotificacion = {}

  const quiereWhatsApp = canal === 'WHATSAPP' || canal === 'AMBOS'
  const quiereEmail = canal === 'EMAIL' || canal === 'AMBOS'

  if (quiereWhatsApp && datos.telefono) {
    const config = await getWhatsAppConfig(tenantId)
    if (config) {
      const plantilla = plantillaParaEvento(evento, datos)
      if (plantilla) {
        resultado.whatsapp = await sendWhatsApp(config, datos.telefono, plantilla.template, plantilla.components)
      }
    } else {
      resultado.whatsapp = { success: false, error: 'WhatsApp no configurado' }
    }
  }

  if (quiereEmail && datos.email && datos.htmlEmail && !datos.email.includes('placeholder')) {
    try {
      await sendMail({
        to: datos.email,
        subject: datos.asuntoEmail ?? `Notificación de su radicado ${datos.radicado}`,
        html: datos.htmlEmail,
        from: datos.fromEmail,
        tenantId,
      })
      resultado.email = { success: true }
    } catch (e) {
      resultado.email = { success: false, error: e instanceof Error ? e.message : String(e) }
    }
  }

  return resultado
}
