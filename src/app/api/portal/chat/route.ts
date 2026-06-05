/**
 * /api/portal/chat
 * POST — Endpoint público del asistente IA ciudadano (RAG).
 * Sin autenticación. Rate limiting: 20 mensajes por IP por hora.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTenantId, isTenantModuleActive, MODULO_IDS } from '@/lib/tenant'
import { chatPreguntaSchema, validateBody } from '@/lib/validations'
import { responderPregunta } from '@/lib/chat-ia'

// ─── Rate limiting en memoria ─────────────────────────────────────────────────
// Suficiente para el volumen de una entidad pública colombiana típica.
const rl = new Map<string, { count: number; resetAt: number }>()
const RL_LIMITE = 20
const RL_VENTANA_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const ahora = Date.now()
  const entrada = rl.get(ip)
  if (!entrada || ahora > entrada.resetAt) {
    rl.set(ip, { count: 1, resetAt: ahora + RL_VENTANA_MS })
    return true
  }
  if (entrada.count >= RL_LIMITE) return false
  entrada.count++
  return true
}

export async function POST(req: NextRequest) {
  // Módulo activo
  if (!(await isTenantModuleActive(MODULO_IDS.CHAT_IA_CIUDADANO))) {
    return NextResponse.json({ error: 'Módulo chat IA no disponible' }, { status: 404 })
  }

  // Rate limit por IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Demasiadas preguntas. Por favor espera un momento antes de continuar.' },
      { status: 429 }
    )
  }

  // Validar body
  const body = await req.json().catch(() => null)
  const validated = validateBody(chatPreguntaSchema, body)
  if (!validated.success) return validated.response

  const { pregunta, historial, sessionId: _sessionId } = validated.data

  try {
    const tenantId = await getTenantId()
    const resultado = await responderPregunta(tenantId, pregunta, historial)
    return NextResponse.json(resultado)
  } catch (e) {
    console.error('[chat-ia] Error al responder:', e instanceof Error ? e.message : String(e))
    return NextResponse.json(
      { error: 'No fue posible procesar tu pregunta. Intenta de nuevo en unos segundos.' },
      { status: 500 }
    )
  }
}
