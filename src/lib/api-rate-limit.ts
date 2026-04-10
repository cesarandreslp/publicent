/**
 * API Pública REST — Rate Limiting
 *
 * Sliding window en memoria para rate limiting por API key.
 * - BASICO: 100 req/min
 * - PROFESIONAL: 1000 req/min
 * - ENTERPRISE: ilimitado
 */

const requestWindows = new Map<string, number[]>()

const LIMITS: Record<string, number> = {
  BASICO: 100,
  PROFESIONAL: 1000,
  ENTERPRISE: Infinity,
}

const WINDOW_MS = 60_000 // 1 minuto

/**
 * Verifica si una API key ha excedido su rate limit.
 * Retorna true si la solicitud debe ser rechazada (429).
 */
export function isRateLimited(apiKeyId: string, planNivel: string): boolean {
  const limit = LIMITS[planNivel] ?? LIMITS.BASICO
  if (limit === Infinity) return false

  const now = Date.now()
  const windowStart = now - WINDOW_MS

  // Obtener o crear ventana
  let timestamps = requestWindows.get(apiKeyId) ?? []

  // Limpiar timestamps fuera de la ventana
  timestamps = timestamps.filter(t => t > windowStart)

  // Verificar límite
  if (timestamps.length >= limit) {
    requestWindows.set(apiKeyId, timestamps)
    return true
  }

  // Registrar nueva solicitud
  timestamps.push(now)
  requestWindows.set(apiKeyId, timestamps)

  return false
}

/**
 * Retorna headers informativos de rate limiting para la respuesta.
 */
export function rateLimitHeaders(apiKeyId: string, planNivel: string): Record<string, string> {
  const limit = LIMITS[planNivel] ?? LIMITS.BASICO
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  const timestamps = (requestWindows.get(apiKeyId) ?? []).filter(t => t > windowStart)

  return {
    "X-RateLimit-Limit": String(limit === Infinity ? "unlimited" : limit),
    "X-RateLimit-Remaining": String(Math.max(0, limit - timestamps.length)),
    "X-RateLimit-Reset": String(Math.ceil((windowStart + WINDOW_MS) / 1000)),
  }
}

// Limpieza periódica de ventanas expiradas (cada 5 minutos)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const cutoff = Date.now() - WINDOW_MS * 2
    for (const [key, timestamps] of requestWindows) {
      const filtered = timestamps.filter(t => t > cutoff)
      if (filtered.length === 0) {
        requestWindows.delete(key)
      } else {
        requestWindows.set(key, filtered)
      }
    }
  }, 5 * 60_000)
}
