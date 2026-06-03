/**
 * presupuesto-ia.ts — IA de sugerencia de rubro CCPET para CDP.
 *
 * Dado el concepto/objeto del CDP, sugiere el rubro presupuestal más probable
 * del catálogo CCPET cargado en la BD del tenant.
 */

import { callIaJson } from "./groq-client"

export const PROMPT_VERSION = "psu-rubro-v1"

export interface SugerenciaRubro {
  rubroCodigo: string
  rubroNombre: string
  razon: string
  confianza: number
  modelo: string
  proveedor: string
  promptVersion: string
}

export async function sugerirRubro(
  tenantId: string,
  concepto: string,
  rubrosDisponibles: { codigo: string; nombre: string; tipo: string }[],
): Promise<SugerenciaRubro | null> {
  // Solo enviamos rubros hoja de tipo GASTO que permiten movimientos
  const candidatos = rubrosDisponibles
    .filter(r => r.tipo === "GASTO")
    .slice(0, 100)
    .map(r => `${r.codigo} — ${r.nombre}`)
    .join("\n")

  if (!candidatos) return null

  const prompt = `Eres un experto en presupuesto público colombiano (CCPET — Catálogo de Clasificación Presupuestal Territorial).

El usuario está creando un Certificado de Disponibilidad Presupuestal (CDP) con el siguiente concepto:
"""
${concepto.slice(0, 300)}
"""

Rubros presupuestales disponibles (código — nombre):
${candidatos}

Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "rubroCodigo": "<código exacto del rubro más adecuado>",
  "rubroNombre": "<nombre del rubro>",
  "razon": "<justificación en máx 20 palabras>",
  "confianza": <0.0-1.0>
}`

  try {
    const result = await callIaJson(tenantId, prompt)
    const raw = JSON.parse(result.raw) as Record<string, unknown>
    if (!raw.rubroCodigo) return null
    return {
      rubroCodigo:   String(raw.rubroCodigo),
      rubroNombre:   String(raw.rubroNombre ?? ""),
      razon:         String(raw.razon ?? ""),
      confianza:     typeof raw.confianza === "number" ? raw.confianza : 0.6,
      modelo:        result.modelo,
      proveedor:     result.proveedor,
      promptVersion: PROMPT_VERSION,
    }
  } catch {
    return null
  }
}
