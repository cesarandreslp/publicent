/**
 * Clasificador IA de reportes mensuales del depositario FRISCO.
 *
 * Patrón (igual a Ventanilla Única):
 *  - Groq → Shipu como fallback (vía `callIaJson` de groq-client).
 *  - Si ambos proveedores fallan o no hay API key → fallback determinístico por reglas.
 *  - IA SUGIERE, humano DECIDE: la urgencia se persiste en modelo separado
 *    `FriscoReporteAnalisisIA` y un funcionario puede sobreescribirla
 *    (`revisadoPor` / `revisadoEn`) sin alterar el reporte original.
 */

import { callIaJson } from "./groq-client"
import type { FriscoEstadoFisico, FriscoReporteUrgencia } from "@prisma/client"

export const PROMPT_VERSION = "frisco-reporte-v1"

const ETIQUETAS_CONOCIDAS = [
  "ocupacion_indebida",
  "intento_venta",
  "deterioro_grave",
  "danos_estructurales",
  "amenazas_seguridad",
  "robo_o_hurto",
  "incendio_o_riesgo",
  "poliza_vencida",
  "documento_pendiente",
  "operacion_normal",
] as const

export type EtiquetaReporte = typeof ETIQUETAS_CONOCIDAS[number]

export interface AnalisisReporte {
  urgencia:        FriscoReporteUrgencia
  etiquetas:       EtiquetaReporte[]
  resumen:         string
  confianza:       number               // 0..1
  modelo:          string               // ej. "llama-3.3-70b-versatile" o "reglas-fallback"
  proveedor:       string               // groq | shipu | fallback
  promptVersion:   string
  raw:             unknown              // payload original del modelo o {} si fallback
  tokensPrompt:    number | null
  tokensRespuesta: number | null
  errorMsg:        string | null
}

interface Input {
  tenantId:   string
  novedades:  string
  estadoBien: FriscoEstadoFisico
  contexto?: {
    polizaVencida?: boolean
    bienCodigo?:    string
    bienTipo?:      string
  }
}

export async function analizarReporte(input: Input): Promise<AnalisisReporte> {
  const prompt = buildPrompt(input)

  try {
    const r = await callIaJson(input.tenantId, prompt)
    const parsed = parseRespuestaIA(r.raw)
    return {
      urgencia:        parsed.urgencia,
      etiquetas:       parsed.etiquetas,
      resumen:         parsed.resumen,
      confianza:       parsed.confianza,
      modelo:          r.modelo,
      proveedor:       r.proveedor,
      promptVersion:   PROMPT_VERSION,
      raw:             safeJson(r.raw),
      tokensPrompt:    r.tokensPrompt,
      tokensRespuesta: r.tokensRespuesta,
      errorMsg:        null,
    }
  } catch (err) {
    const fallback = analizarConReglas(input)
    return {
      ...fallback,
      modelo:          "reglas-fallback",
      proveedor:       "fallback",
      promptVersion:   PROMPT_VERSION,
      raw:             null,
      tokensPrompt:    null,
      tokensRespuesta: null,
      errorMsg:        err instanceof Error ? err.message : String(err),
    }
  }
}

// ─── Prompt ──────────────────────────────────────────────────────────────────

function buildPrompt(input: Input): string {
  const ctx = input.contexto ?? {}
  const ctxStr = [
    ctx.bienCodigo ? `Bien: ${ctx.bienCodigo}` : null,
    ctx.bienTipo   ? `Tipo: ${ctx.bienTipo}`   : null,
    ctx.polizaVencida ? "ALERTA: la póliza del depositario está vencida" : null,
  ].filter(Boolean).join(" | ") || "Sin contexto adicional"

  return `Eres un analista de la SAE (Sociedad de Activos Especiales) revisando un reporte mensual de un depositario que custodia un bien intervenido en proceso de extinción de dominio.

CONTEXTO: ${ctxStr}
ESTADO FÍSICO QUE EL DEPOSITARIO REPORTA: ${input.estadoBien}

NOVEDADES REPORTADAS POR EL DEPOSITARIO:
"""
${input.novedades.slice(0, 3000)}
"""

Tu tarea: clasificar la URGENCIA del reporte y detectar SEÑALES DE RIESGO.

CRITERIOS DE URGENCIA:
- NORMAL    → operación habitual, sin novedades de riesgo. Estado BUENO o REGULAR sin alertas.
- ATENCION  → requiere seguimiento en próximos días: deterioro moderado, documento pendiente, póliza por vencer.
- CRITICA   → requiere acción inmediata: ocupación indebida, intento de venta, daños estructurales, amenazas, robo, incendio, póliza vencida con riesgo activo, estado PERDIDO o DESTRUIDO.

ETIQUETAS DISPONIBLES (devuelve sólo las que apliquen, de esta lista exacta):
${ETIQUETAS_CONOCIDAS.join(", ")}

Responde ÚNICAMENTE con un JSON válido con esta forma:
{
  "urgencia": "NORMAL|ATENCION|CRITICA",
  "etiquetas": ["..."],
  "resumen": "máximo 280 caracteres en español",
  "confianza": <decimal 0..1>
}`
}

// ─── Parseo y validación de la respuesta del modelo ──────────────────────────

function parseRespuestaIA(raw: string): {
  urgencia: FriscoReporteUrgencia
  etiquetas: EtiquetaReporte[]
  resumen: string
  confianza: number
} {
  const parsed = JSON.parse(raw) as Record<string, unknown>

  const urgRaw = String(parsed.urgencia ?? "NORMAL").toUpperCase()
  const urgencia: FriscoReporteUrgencia =
    urgRaw === "CRITICA" || urgRaw === "CRÍTICA" ? "CRITICA" :
    urgRaw === "ATENCION" || urgRaw === "ATENCIÓN" ? "ATENCION" :
    "NORMAL"

  const etiquetasRaw = Array.isArray(parsed.etiquetas) ? parsed.etiquetas : []
  const etiquetas = etiquetasRaw
    .map(e => String(e).toLowerCase().trim() as EtiquetaReporte)
    .filter((e): e is EtiquetaReporte => (ETIQUETAS_CONOCIDAS as readonly string[]).includes(e))

  const resumen = String(parsed.resumen ?? "").slice(0, 280)
  const confianza = typeof parsed.confianza === "number"
    ? Math.min(1, Math.max(0, parsed.confianza))
    : 0.6

  return { urgencia, etiquetas, resumen, confianza }
}

function safeJson(raw: string): unknown {
  try { return JSON.parse(raw) } catch { return { raw } }
}

// ─── Fallback determinístico (sin IA) ────────────────────────────────────────

/** Reglas mínimas para que el módulo opere si la IA no está disponible. */
function analizarConReglas(input: Input): Pick<AnalisisReporte, "urgencia" | "etiquetas" | "resumen" | "confianza"> {
  const texto = input.novedades.toLowerCase()
  const etiquetas: EtiquetaReporte[] = []

  const patrones: Array<[RegExp, EtiquetaReporte]> = [
    [/\bocupa(d|c)|invasi|ocupar/i,                "ocupacion_indebida"],
    [/\bvend|venta|comprador|ofert/i,              "intento_venta"],
    [/\b(deterior|deterioro|daño grave|colaps)/i,  "deterioro_grave"],
    [/\bgrieta|estructura|muro caí|colaps/i,       "danos_estructurales"],
    [/\bamenaz|extorsion|extorsión|intimid/i,      "amenazas_seguridad"],
    [/\brobo|hurto|sustra/i,                       "robo_o_hurto"],
    [/\bincendio|fuego|quem/i,                     "incendio_o_riesgo"],
    [/\bp(ó|o)liza\b.*venc|p(ó|o)liza vencida/i,   "poliza_vencida"],
    [/\bdocument.*pendient|falta document/i,       "documento_pendiente"],
  ]
  for (const [re, tag] of patrones) if (re.test(texto)) etiquetas.push(tag)
  if (input.contexto?.polizaVencida) etiquetas.push("poliza_vencida")
  if (etiquetas.length === 0) etiquetas.push("operacion_normal")

  const criticas: EtiquetaReporte[] = [
    "ocupacion_indebida", "intento_venta", "danos_estructurales",
    "amenazas_seguridad", "robo_o_hurto", "incendio_o_riesgo",
  ]
  const estadoCritico = input.estadoBien === "PERDIDO" || input.estadoBien === "DESTRUIDO"
  const algunaCritica = etiquetas.some(e => criticas.includes(e))

  let urgencia: FriscoReporteUrgencia = "NORMAL"
  if (estadoCritico || algunaCritica) {
    urgencia = "CRITICA"
  } else if (
    input.estadoBien === "MALO" ||
    etiquetas.some(e => ["deterioro_grave", "poliza_vencida", "documento_pendiente"].includes(e))
  ) {
    urgencia = "ATENCION"
  }

  return {
    urgencia,
    etiquetas: Array.from(new Set(etiquetas)),
    resumen: `Análisis por reglas (sin IA). Estado: ${input.estadoBien}. Etiquetas: ${etiquetas.join(", ")}.`,
    confianza: 0.4,
  }
}
