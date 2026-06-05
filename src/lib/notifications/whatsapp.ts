/**
 * whatsapp.ts — Cliente de WhatsApp Cloud API (Meta) para notificaciones a ciudadanos.
 *
 * Meta Cloud API es gratuita hasta 1.000 conversaciones de servicio/mes — ideal para
 * entidades públicas. Las plantillas deben estar APROBADAS en Meta Business Manager
 * antes de poder enviarse; este código sólo las invoca por nombre.
 *
 * Plantillas esperadas (el admin de la entidad las registra en su cuenta de Meta):
 *   - pqrsd_radicado    → "Tu solicitud {{1}} fue radicada con número {{2}}. Vence el {{3}}. Consulta en: {{4}}"
 *   - pqrsd_respondida  → "Tu solicitud {{1}} fue respondida. Radicado: {{2}}. Consulta la respuesta en: {{3}}"
 *   - pqrsd_por_vencer  → "Tu solicitud {{1}} vence en {{2}} días hábiles. Radicado: {{3}}"
 *
 * NUNCA loguear el accessToken.
 */

const GRAPH_API_VERSION = 'v18.0'

export interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  fromPhone: string
}

export interface WhatsAppResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Normaliza un teléfono colombiano a formato E.164 (+57XXXXXXXXXX).
 * Si ya tiene indicativo o '+', lo respeta. Si son 10 dígitos, antepone +57.
 */
export function normalizarTelefonoCo(toPhone: string): string {
  const limpio = toPhone.replace(/[\s\-()]/g, '')
  if (limpio.startsWith('+')) return limpio
  const soloDigitos = limpio.replace(/\D/g, '')
  if (soloDigitos.length === 10) return `+57${soloDigitos}`
  if (soloDigitos.startsWith('57')) return `+${soloDigitos}`
  return `+${soloDigitos}`
}

/**
 * Envía un mensaje de plantilla por WhatsApp Cloud API.
 * No lanza excepciones: retorna `{ success, messageId?, error? }` para que el
 * llamador maneje el fallo sin romper el flujo principal.
 *
 * @param components Parámetros de la plantilla (estructura `components` de Meta).
 *   Típicamente: `[{ type: 'body', parameters: [{ type: 'text', text: '...' }] }]`
 * @param idiomaPlantilla Código de idioma de la plantilla aprobada (default 'es').
 */
export async function sendWhatsApp(
  config: WhatsAppConfig,
  toPhone: string,
  templateName: string,
  components: object[],
  idiomaPlantilla = 'es'
): Promise<WhatsAppResult> {
  if (!config.phoneNumberId || !config.accessToken) {
    return { success: false, error: 'WhatsApp no configurado para este tenant' }
  }

  const destino = normalizarTelefonoCo(toPhone)
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.phoneNumberId}/messages`

  const body = {
    messaging_product: 'whatsapp',
    to: destino.replace(/^\+/, ''), // Meta acepta el número sin el '+'
    type: 'template',
    template: {
      name: templateName,
      language: { code: idiomaPlantilla },
      components,
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })

    const data = (await res.json().catch(() => ({}))) as {
      messages?: Array<{ id: string }>
      error?: { message?: string }
    }

    if (!res.ok) {
      return { success: false, error: data.error?.message ?? `HTTP ${res.status}` }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * Helper para construir el `components` de body con parámetros de texto posicionales.
 * Los parámetros se mapean a {{1}}, {{2}}, ... en el orden dado.
 */
export function bodyParams(...textos: Array<string | number>): object[] {
  return [
    {
      type: 'body',
      parameters: textos.map((t) => ({ type: 'text', text: String(t) })),
    },
  ]
}
