/**
 * superadmin-ai.ts — Motor de IA para informes mensuales del SuperAdmin SaaS
 *
 * A diferencia de groq-client.ts (que usa la API key propia de CADA TENANT),
 * este módulo usa la API key del SuperAdmin para análisis internos del SaaS:
 *  - Tendencias de PQRSD agregadas por tenant
 *  - Detección de tenants con alto riesgo de vencimiento de radicados
 *  - Sugerencias de mejora operativa
 *  - Comparativas entre entidades similares
 *
 * API key: SUPERADMIN_GROQ_API_KEY (env del servidor — nunca en cliente)
 * Modelo: llama-3.3-70b-versatile (Groq)
 * Fallback: SUPERADMIN_SHIPU_API_KEY → z1-32b (Shipu z.ai)
 */

const GROQ_BASE_URL  = 'https://api.groq.com/openai/v1'
const SHIPU_BASE_URL = 'https://api.z.ai/v1'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TenantResumen {
  /** Nombre del tenant */
  nombre: string
  /** Slug */
  slug: string
  /** Total de PQRSD radicadas en el período */
  totalRadicados: number
  /** Radicados vencidos */
  vencidos: number
  /** Radicados en semáforo rojo */
  enRiesgo: number
  /** Promedio de días de respuesta */
  promedioDiasRespuesta: number | null
  /** Distribución por tipo */
  porTipo: Record<string, number>
  /** Plan activo */
  plan: string
  /** Módulos activos */
  modulos: string[]
}

export interface InformeMensual {
  /** Período analizado */
  periodo: string
  /** Fecha de generación */
  generadoEn: string
  /** Resumen ejecutivo generado por IA */
  resumenEjecutivo: string
  /** Hallazgos por tenant */
  hallazgosPorTenant: HallazgoTenant[]
  /** Oportunidades de mejora del SaaS */
  oportunidadesMejora: string[]
  /** Tenants que requieren atención inmediata */
  alertasCriticas: string[]
  /** Métricas globales */
  metricasGlobales: MetricasGlobales
  /** Proveedor IA usado */
  proveedor: string
  /** Modelo usado */
  modelo: string
  /** Tokens consumidos */
  tokensTotal: number
}

export interface HallazgoTenant {
  tenant: string
  nivel: 'CRITICO' | 'ADVERTENCIA' | 'NORMAL' | 'DESTACADO'
  hallazgos: string[]
  recomendaciones: string[]
}

export interface MetricasGlobales {
  totalTenants: number
  tenantActivos: number
  totalRadicados: number
  tasaVencimiento: number
  tipoMasFrecuente: string
}

// ─── Llamada al proveedor IA ──────────────────────────────────────────────────

interface RespuestaIA {
  contenido: string
  modelo: string
  tokens: number
}

async function llamarIA(
  baseUrl: string,
  apiKey: string,
  modelo: string,
  prompt: string,
  jsonMode = true,
): Promise<RespuestaIA> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:       modelo,
      temperature: 0.2,
      max_tokens:  2048,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => 'sin detalle')
    throw new Error(`IA error ${response.status}: ${err}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
    usage:   { prompt_tokens: number; completion_tokens: number }
    model:   string
  }

  const contenido = data.choices[0]?.message?.content
  if (!contenido) throw new Error('Respuesta vacía del proveedor IA')

  return {
    contenido,
    modelo: data.model ?? modelo,
    tokens: (data.usage?.prompt_tokens ?? 0) + (data.usage?.completion_tokens ?? 0),
  }
}

// ─── Obtener keys del SuperAdmin ──────────────────────────────────────────────

interface SAKeys {
  groqKey:   string | null
  shipuKey:  string | null
}

function getSAKeys(): SAKeys {
  return {
    groqKey:  process.env.SUPERADMIN_GROQ_API_KEY  ?? null,
    shipuKey: process.env.SUPERADMIN_SHIPU_API_KEY ?? null,
  }
}

// ─── Llamada con fallback automático ─────────────────────────────────────────

async function llamarConFallback(prompt: string, jsonMode = true): Promise<RespuestaIA & { proveedor: string }> {
  const keys = getSAKeys()
  const errores: string[] = []

  // Intentar Groq primero
  if (keys.groqKey) {
    try {
      const res = await llamarIA(GROQ_BASE_URL, keys.groqKey, 'llama-3.3-70b-versatile', prompt, jsonMode)
      return { ...res, proveedor: 'groq' }
    } catch (e) {
      errores.push(`Groq: ${e instanceof Error ? e.message : String(e)}`)
    }
  } else {
    errores.push('Groq: SUPERADMIN_GROQ_API_KEY no configurada')
  }

  // Fallback a Shipu
  if (keys.shipuKey) {
    try {
      const res = await llamarIA(SHIPU_BASE_URL, keys.shipuKey, 'z1-32b', prompt, jsonMode)
      return { ...res, proveedor: 'shipu' }
    } catch (e) {
      errores.push(`Shipu: ${e instanceof Error ? e.message : String(e)}`)
    }
  } else {
    errores.push('Shipu: SUPERADMIN_SHIPU_API_KEY no configurada')
  }

  throw new Error(`[superadmin-ai] Sin proveedores disponibles. ${errores.join(' | ')}`)
}

// ─── Prompt de informe mensual ────────────────────────────────────────────────

function buildPromptInforme(periodo: string, tenants: TenantResumen[]): string {
  const resumenTenants = tenants.map(t => `
TENANT: ${t.nombre} (${t.slug}) — Plan: ${t.plan}
  - Radicados totales: ${t.totalRadicados}
  - Vencidos: ${t.vencidos} | En riesgo (rojo): ${t.enRiesgo}
  - Promedio días respuesta: ${t.promedioDiasRespuesta ?? 'N/A'}
  - Por tipo: ${JSON.stringify(t.porTipo)}
  - Módulos: ${t.modulos.join(', ') || 'ninguno'}
`).join('\n')

  return `Eres el analista estratégico de un SaaS de gestión institucional para entidades públicas colombianas (personerías, contralorías, alcaldías).

PERÍODO ANALIZADO: ${periodo}
NÚMERO DE TENANTS: ${tenants.length}

DATOS DE TENANTS:
${resumenTenants}

Analiza estos datos y genera un informe mensual para el SuperAdmin del SaaS.

Responde ÚNICAMENTE con un JSON válido con esta estructura:
{
  "resumenEjecutivo": "Párrafo de 3-5 oraciones con los hallazgos más importantes del período",
  "hallazgosPorTenant": [
    {
      "tenant": "nombre del tenant",
      "nivel": "CRITICO|ADVERTENCIA|NORMAL|DESTACADO",
      "hallazgos": ["hallazgo 1", "hallazgo 2"],
      "recomendaciones": ["recomendación 1"]
    }
  ],
  "oportunidadesMejora": [
    "Oportunidad de mejora para el SaaS identificada a partir de los datos",
    "..."
  ],
  "alertasCriticas": [
    "Tenant X tiene N radicados vencidos que requieren atención inmediata",
    "..."
  ],
  "tipoMasFrecuente": "PETICION|QUEJA|etc."
}

Reglas:
- CRITICO: tasa de vencimiento > 20% o más de 5 vencidos
- ADVERTENCIA: tasa entre 10-20% o múltiples en semáforo rojo
- DESTACADO: tasa de vencimiento < 5% y promedio respuesta < 10 días
- NORMAL: todo lo demás
- Las oportunidades de mejora deben ser accionables y específicas para el producto
- Escribe en español formal colombiano`
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Genera el informe mensual del SaaS usando la API key del SuperAdmin.
 *
 * @param periodo  Período en formato "YYYY-MM" o "Mayo 2026"
 * @param tenants  Resúmenes estadísticos de cada tenant
 */
export async function generarInformeMensual(
  periodo: string,
  tenants: TenantResumen[],
): Promise<InformeMensual> {
  if (tenants.length === 0) {
    throw new Error('[superadmin-ai] No hay tenants para analizar')
  }

  const prompt = buildPromptInforme(periodo, tenants)
  const { contenido, modelo, tokens, proveedor } = await llamarConFallback(prompt, true)

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(contenido)
  } catch {
    throw new Error(`[superadmin-ai] JSON inválido: ${contenido.slice(0, 300)}`)
  }

  // Calcular métricas globales
  const totalRadicados = tenants.reduce((s, t) => s + t.totalRadicados, 0)
  const totalVencidos  = tenants.reduce((s, t) => s + t.vencidos, 0)
  const tiposFrecuencia: Record<string, number> = {}
  for (const t of tenants) {
    for (const [tipo, count] of Object.entries(t.porTipo)) {
      tiposFrecuencia[tipo] = (tiposFrecuencia[tipo] ?? 0) + count
    }
  }
  const tipoMasFrecuente = (parsed.tipoMasFrecuente as string)
    ?? Object.entries(tiposFrecuencia).sort(([, a], [, b]) => b - a)[0]?.[0]
    ?? 'PETICION'

  return {
    periodo,
    generadoEn:        new Date().toISOString(),
    resumenEjecutivo:  String(parsed.resumenEjecutivo ?? ''),
    hallazgosPorTenant: (parsed.hallazgosPorTenant as HallazgoTenant[]) ?? [],
    oportunidadesMejora: (parsed.oportunidadesMejora as string[]) ?? [],
    alertasCriticas:   (parsed.alertasCriticas as string[]) ?? [],
    metricasGlobales: {
      totalTenants:      tenants.length,
      tenantActivos:     tenants.filter(t => t.totalRadicados > 0).length,
      totalRadicados,
      tasaVencimiento:   totalRadicados > 0 ? +(totalVencidos / totalRadicados * 100).toFixed(1) : 0,
      tipoMasFrecuente,
    },
    proveedor,
    modelo,
    tokensTotal: tokens,
  }
}
