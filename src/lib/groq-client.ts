/**
 * groq-client.ts — Motor de IA por tenant (Groq / LLaMA 3.3 70B + Shipu z.ai fallback)
 *
 * Responsabilidades:
 *  - Leer la API key de Groq del tenant desde la meta-DB (cifrada con encryption.ts)
 *  - Clasificar automáticamente solicitudes PQRSD entrantes
 *  - Calcular fecha límite legal según CPACA / Ley 1437 de 2011
 *  - Sugerir dependencia y funcionario responsable
 *  - Si Groq falla o no tiene key → intentar con Shipu (z.ai) como respaldo
 *
 * NUNCA hardcodear las API keys. Usar exclusivamente decryptSecretos().
 */

import { prismaMeta } from './prisma-meta'
import { decryptSecretos } from './encryption'
import type { TipoPQRS, PrioridadPQRS } from '@prisma/client'

// ─── Proveedores IA ───────────────────────────────────────────────────────────

const PROVEEDORES = {
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    modelo:  'llama-3.3-70b-versatile',
    nombre:  'Groq',
  },
  shipu: {
    // Shipu z.ai — API compatible con OpenAI
    baseUrl: 'https://api.z.ai/v1',
    modelo:  'z1-32b',
    nombre:  'Shipu z.ai',
  },
} as const

type Proveedor = keyof typeof PROVEEDORES

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ClasificacionPQRSD {
  /** Tipo detectado por el modelo */
  tipo:                 TipoPQRS
  /** Prioridad sugerida */
  prioridad:            PrioridadPQRS
  /** Dependencia sugerida (nombre) */
  dependenciaSugerida:  string
  /** Nombre del funcionario sugerido (si se puede inferir del contexto) */
  funcionarioSugerido:  string | null
  /** Días hábiles de término legal según CPACA */
  diasTerminoLegal:     number
  /** Razonamiento del modelo (para auditoría) */
  razon:                string
  /** Confianza del modelo entre 0 y 1 */
  confianza:            number
  /** Nombre del modelo usado */
  modelo:               string
  /** Proveedor IA que respondió (groq | shipu) */
  proveedor:            Proveedor
  /** Tokens consumidos en el prompt */
  tokensPrompt:         number
  /** Tokens consumidos en la respuesta */
  tokensRespuesta:      number
}

export interface ContextoEntidad {
  /** Nombre completo de la entidad */
  nombre:       string
  /** Tipo de entidad (PERSONERIA, ALCALDIA, etc.) */
  tipoEntidad:  string
  /** Municipio o ubicación principal */
  municipio:    string
  /** Dependencias disponibles donde puede asignarse */
  dependencias: string[]
  /** País (default: "Colombia"). Determina la normativa por defecto del prompt. */
  pais?:        string
  /**
   * Marco legal a referenciar en el prompt al modelo.
   * Default: "Ley 1755 de 2015, CPACA - Ley 1437 de 2011" (Colombia).
   * Cambia esto para entidades de otro país o con normativa propia.
   */
  marcoLegal?:  string
  /**
   * Override de los términos legales (días hábiles) por tipo de PQRSD.
   * Si se omite, se usa TERMINOS_LEGALES_DEFAULT.
   * Una entidad puede pasar aquí los valores derivados de su GdTrdTipoDocumental
   * para garantizar coherencia entre TRD y clasificación IA.
   */
  terminosLegales?: Partial<Record<TipoPQRS, number>>
  /**
   * Bloque de definiciones de los tipos de PQRSD para inyectar en el prompt.
   * Si se omite se usan las reglas estándar colombianas.
   */
  definicionesTipos?: string
}

// ─── Términos legales por defecto (CPACA / Ley 1755 de 2015 — Colombia) ───────
// Los callers pueden overridear estos valores vía ContextoEntidad.terminosLegales
// (típicamente leyéndolos de GdTrdTipoDocumental por tenant).

export const TERMINOS_LEGALES_DEFAULT: Record<TipoPQRS, number> = {
  PETICION:     15,  // Art. 14 — 15 días hábiles
  QUEJA:        15,
  RECLAMO:      15,
  SUGERENCIA:   15,
  DENUNCIA:     15,
  FELICITACION: 15,
  CONSULTA:     30,  // Art. 14 — 30 días hábiles para consultas
}

// ─── Reglas estándar para el prompt (sustituibles vía ContextoEntidad) ────────

const DEFINICIONES_TIPOS_DEFAULT = `Reglas de clasificación:
- PETICION: solicitud de información, trámite o servicio
- QUEJA: inconformidad con la conducta de un servidor público
- RECLAMO: inconformidad con la prestación de un servicio
- SUGERENCIA: propuesta de mejora
- DENUNCIA: reporte de irregularidad, corrupción o conducta indebida
- FELICITACION: reconocimiento positivo
- CONSULTA: pregunta sobre normativa o procedimientos
- URGENTE: riesgo para la vida, la salud o derechos fundamentales`

const MARCO_LEGAL_DEFAULT = 'Ley 1755 de 2015, CPACA - Ley 1437 de 2011'
const PAIS_DEFAULT = 'Colombia'

// ─── Obtener API keys del tenant ─────────────────────────────────────────────

interface TenantApiKeys {
  groqApiKey:   string | null
  shipuApiKey:  string | null
  nombreTenant: string
}

async function getTenantApiKeys(tenantId: string): Promise<TenantApiKeys> {
  // En desarrollo local: usar variables de entorno directamente
  if (tenantId === 'dev-tenant') {
    return {
      groqApiKey:   process.env.GROQ_API_KEY   ?? null,
      shipuApiKey:  process.env.SHIPU_API_KEY  ?? null,
      nombreTenant: 'Dev',
    }
  }

  const tenant = await prismaMeta.tenant.findUnique({
    where: { id: tenantId },
    select: { secretosEncriptados: true, nombre: true },
  })

  if (!tenant) throw new Error(`[ia] Tenant "${tenantId}" no encontrado en meta-DB`)

  const secretos = decryptSecretos(tenant.secretosEncriptados)
  return {
    groqApiKey:   secretos.groqApiKey  ?? null,
    shipuApiKey:  secretos.shipuApiKey ?? null,
    nombreTenant: tenant.nombre,
  }
}

// ─── Llamada unificada a cualquier proveedor OpenAI-compatible ────────────────

async function llamarProveedor(
  apiKey: string,
  proveedor: Proveedor,
  prompt: string,
): Promise<{ raw: string; tokensPrompt: number; tokensRespuesta: number; modelo: string }> {
  const cfg = PROVEEDORES[proveedor]
  const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:           cfg.modelo,
      temperature:     0.1,
      max_tokens:      512,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => 'sin detalle')
    throw new Error(`[${proveedor}] Error ${response.status}: ${err}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
    usage:   { prompt_tokens: number; completion_tokens: number }
    model:   string
  }

  const raw = data.choices[0]?.message?.content
  if (!raw) throw new Error(`[${proveedor}] Respuesta vacía`)

  return {
    raw,
    tokensPrompt:     data.usage?.prompt_tokens     ?? 0,
    tokensRespuesta:  data.usage?.completion_tokens ?? 0,
    modelo:           data.model ?? cfg.modelo,
  }
}

// ─── Prompt de clasificación ──────────────────────────────────────────────────

function buildPrompt(texto: string, contexto: ContextoEntidad): string {
  const dependenciasStr = contexto.dependencias.length > 0
    ? contexto.dependencias.join(', ')
    : 'No especificadas'

  const pais         = contexto.pais        ?? PAIS_DEFAULT
  const marcoLegal   = contexto.marcoLegal  ?? MARCO_LEGAL_DEFAULT
  const definiciones = contexto.definicionesTipos ?? DEFINICIONES_TIPOS_DEFAULT

  return `Eres el asistente de clasificación de solicitudes ciudadanas de la ${contexto.nombre} (${contexto.tipoEntidad}) ubicada en ${contexto.municipio}, ${pais}.

Tu tarea es analizar la siguiente solicitud ciudadana y clasificarla según el marco legal aplicable (${marcoLegal}).

DEPENDENCIAS DISPONIBLES EN LA ENTIDAD: ${dependenciasStr}

SOLICITUD DEL CIUDADANO:
"""
${texto}
"""

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta (sin markdown, sin explicaciones fuera del JSON):

{
  "tipo": "PETICION|QUEJA|RECLAMO|SUGERENCIA|DENUNCIA|FELICITACION|CONSULTA",
  "prioridad": "BAJA|NORMAL|ALTA|URGENTE",
  "dependenciaSugerida": "nombre exacto de una dependencia de la lista o la más apropiada",
  "funcionarioSugerido": null,
  "diasTerminoLegal": <número entero de días hábiles aplicables>,
  "razon": "explicación breve de la clasificación en máximo 150 palabras",
  "confianza": <número decimal entre 0.0 y 1.0>
}

${definiciones}`
}

// ─── Clasificación principal ──────────────────────────────────────────────────

/**
 * Clasifica automáticamente una solicitud PQRSD usando Groq / LLaMA 3.3 70B.
 *
 * @param tenantId  ID del tenant (para obtener su API key de Groq)
 * @param texto     Texto completo de la solicitud ciudadana
 * @param contexto  Información de la entidad (nombre, dependencias disponibles)
 */
export async function classifyPQRSD(
  tenantId: string,
  texto: string,
  contexto: ContextoEntidad
): Promise<ClasificacionPQRSD> {
  const keys = await getTenantApiKeys(tenantId)
  const prompt = buildPrompt(texto, contexto)

  // Intentar con Groq primero, luego Shipu como fallback
  let resultado: Awaited<ReturnType<typeof llamarProveedor>> | null = null
  let proveedorUsado: Proveedor = 'groq'
  const errores: string[] = []

  if (keys.groqApiKey) {
    try {
      resultado = await llamarProveedor(keys.groqApiKey, 'groq', prompt)
      proveedorUsado = 'groq'
    } catch (e) {
      errores.push(`Groq: ${e instanceof Error ? e.message : String(e)}`)
    }
  } else {
    errores.push(`Groq: API key no configurada para "${keys.nombreTenant}"`)
  }

  if (!resultado && keys.shipuApiKey) {
    try {
      resultado = await llamarProveedor(keys.shipuApiKey, 'shipu', prompt)
      proveedorUsado = 'shipu'
    } catch (e) {
      errores.push(`Shipu: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  if (!resultado) {
    throw new Error(
      `[ia] Todos los proveedores fallaron para "${keys.nombreTenant}". ` +
      errores.join(' | ')
    )
  }

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(resultado.raw)
  } catch {
    throw new Error(`[ia] JSON inválido del proveedor: ${resultado.raw.slice(0, 200)}`)
  }

  const tipo      = String(parsed.tipo      ?? 'PETICION')  as TipoPQRS
  const prioridad = String(parsed.prioridad ?? 'NORMAL')    as PrioridadPQRS
  const terminos  = { ...TERMINOS_LEGALES_DEFAULT, ...(contexto.terminosLegales ?? {}) }
  const dias      = terminos[tipo] ?? 15

  return {
    tipo,
    prioridad,
    dependenciaSugerida: String(parsed.dependenciaSugerida ?? 'Sin asignar'),
    funcionarioSugerido: parsed.funcionarioSugerido ? String(parsed.funcionarioSugerido) : null,
    diasTerminoLegal:    typeof parsed.diasTerminoLegal === 'number' ? parsed.diasTerminoLegal : dias,
    razon:               String(parsed.razon ?? ''),
    confianza:           typeof parsed.confianza === 'number' ? Math.min(1, Math.max(0, parsed.confianza)) : 0.7,
    modelo:              resultado.modelo,
    proveedor:           proveedorUsado,
    tokensPrompt:        resultado.tokensPrompt,
    tokensRespuesta:     resultado.tokensRespuesta,
  }
}

// ─── Semáforo de vencimientos ─────────────────────────────────────────────────

export type ColorSemaforo = 'VERDE' | 'AMARILLO' | 'ROJO' | 'NEGRO'

/**
 * Calcula el color del semáforo de vencimiento legal de un radicado.
 * Basado en el porcentaje de tiempo disponible restante.
 *
 * @param fechaRadicacion  Fecha en que se radicó la solicitud
 * @param diasTerminoLegal Días hábiles de término (del CPACA)
 * @param ahora            Fecha actual (inyectable para tests)
 */
export function calcularSemaforo(
  fechaRadicacion: Date,
  diasTerminoLegal: number,
  ahora: Date = new Date()
): ColorSemaforo {
  const msTotal      = diasTerminoLegal * 24 * 60 * 60 * 1000  // Aproximación en ms (días calendario)
  const msTranscurrido = ahora.getTime() - fechaRadicacion.getTime()
  const porcentajeUsado = msTranscurrido / msTotal

  if (porcentajeUsado >= 1)    return 'NEGRO'    // Vencido
  if (porcentajeUsado >= 0.8)  return 'ROJO'     // < 20% restante
  if (porcentajeUsado >= 0.6)  return 'AMARILLO' // 20–40% restante
  return 'VERDE'                                  // > 40% restante
}

/**
 * Calcula la fecha límite de respuesta en días hábiles desde la fecha de radicación.
 * Versión simplificada (sin festivos). Para cálculo exacto usar lib/dias-habiles.ts.
 */
export function calcularFechaLimite(fechaRadicacion: Date, diasHabiles: number): Date {
  const fecha = new Date(fechaRadicacion)
  let diasContados = 0

  while (diasContados < diasHabiles) {
    // Se opera en UTC para que el cálculo sea estable en cualquier zona
    // horaria (Vercel corre en UTC; equipos en Colombia, UTC-5). Con métodos
    // locales, una fecha a medianoche UTC retrocedía un día y desalineaba
    // el conteo de días hábiles.
    fecha.setUTCDate(fecha.getUTCDate() + 1)
    const diaSemana = fecha.getUTCDay()
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasContados++
    }
  }
  return fecha
}

// ─── Helper genérico para otros módulos (FRISCO, etc.) ───────────────────────

export interface IaJsonResult {
  raw: string
  modelo: string
  proveedor: Proveedor
  tokensPrompt: number
  tokensRespuesta: number
}

/**
 * Llama al modelo del tenant con un prompt arbitrario que debe responder JSON.
 * Mismo patrón Groq → Shipu que `classifyPQRSD`. Lanza si todos los proveedores fallan.
 */
export async function callIaJson(tenantId: string, prompt: string): Promise<IaJsonResult> {
  const keys = await getTenantApiKeys(tenantId)
  const errores: string[] = []

  if (keys.groqApiKey) {
    try {
      const r = await llamarProveedor(keys.groqApiKey, 'groq', prompt)
      return { ...r, proveedor: 'groq' }
    } catch (e) {
      errores.push(`Groq: ${e instanceof Error ? e.message : String(e)}`)
    }
  } else {
    errores.push(`Groq: API key no configurada para "${keys.nombreTenant}"`)
  }

  if (keys.shipuApiKey) {
    try {
      const r = await llamarProveedor(keys.shipuApiKey, 'shipu', prompt)
      return { ...r, proveedor: 'shipu' }
    } catch (e) {
      errores.push(`Shipu: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  throw new Error(`[ia] Todos los proveedores fallaron para "${keys.nombreTenant}". ${errores.join(' | ')}`)
}
