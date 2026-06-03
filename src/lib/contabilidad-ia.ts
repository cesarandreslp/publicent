/**
 * contabilidad-ia.ts — IA de sugerencia de cuentas CGC para comprobantes.
 *
 * Dado el concepto/descripción de un comprobante, sugiere pares débito/crédito
 * del Catálogo General de Cuentas (CGN) con sus códigos.
 * Casos de NO uso: validación de partida doble, cierre de periodo, cálculo de saldos.
 */

import { callIaJson } from "./groq-client"

export const PROMPT_VERSION = "cp-cuentas-v1"

export interface SugerenciaAsiento {
  descripcion: string
  cuentaDebitoCodigo: string
  cuentaDebitoNombre: string
  cuentaCreditoCodigo: string
  cuentaCreditoNombre: string
  razon: string
  confianza: number
}

export interface SugerenciaCuentas {
  asientos: SugerenciaAsiento[]
  advertencia: string | null
  modelo: string
  proveedor: string
  promptVersion: string
}

export async function sugerirCuentas(
  tenantId: string,
  descripcion: string,
  cuentasDisponibles: { codigo: string; nombre: string; naturaleza: string }[],
): Promise<SugerenciaCuentas> {
  // Limitar cuentas al contexto — enviamos solo las hojas más usadas (clase 1-5)
  const muestra = cuentasDisponibles
    .filter(c => c.codigo.length >= 6)
    .slice(0, 120)
    .map(c => `${c.codigo} ${c.nombre} (${c.naturaleza})`)
    .join("\n")

  const prompt = `Eres un contador público colombiano experto en el CGC de la Contaduría General de la Nación.

El usuario quiere registrar el siguiente comprobante:
"""
${descripcion.slice(0, 400)}
"""

Cuentas disponibles (código — nombre — naturaleza):
${muestra}

Sugiere los asientos contables más probables. Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "asientos": [
    {
      "descripcion": "<descripción corta del asiento>",
      "cuentaDebitoCodigo": "<código exacto de la cuenta a debitar>",
      "cuentaDebitoNombre": "<nombre de la cuenta>",
      "cuentaCreditoCodigo": "<código exacto de la cuenta a acreditar>",
      "cuentaCreditoNombre": "<nombre de la cuenta>",
      "razon": "<por qué este par>"
    }
  ],
  "advertencia": "<alerta si el monto parece inusual o falta información, o null>",
  "confianza": <0.0-1.0>
}`

  try {
    const result = await callIaJson(tenantId, prompt)
    const raw = JSON.parse(result.raw) as Record<string, unknown>
    const confianza = typeof raw.confianza === "number" ? raw.confianza as number : 0.7
    const asientos = Array.isArray(raw.asientos)
      ? (raw.asientos as Record<string, unknown>[]).map(a => ({
          descripcion:         String(a.descripcion ?? ""),
          cuentaDebitoCodigo:  String(a.cuentaDebitoCodigo ?? ""),
          cuentaDebitoNombre:  String(a.cuentaDebitoNombre ?? ""),
          cuentaCreditoCodigo: String(a.cuentaCreditoCodigo ?? ""),
          cuentaCreditoNombre: String(a.cuentaCreditoNombre ?? ""),
          razon:               String(a.razon ?? ""),
          confianza,
        }))
      : []

    return {
      asientos,
      advertencia: typeof raw.advertencia === "string" ? raw.advertencia : null,
      modelo:       result.modelo,
      proveedor:    result.proveedor,
      promptVersion: PROMPT_VERSION,
    }
  } catch (e) {
    return {
      asientos: [],
      advertencia: `IA no disponible: ${e instanceof Error ? e.message : String(e)}`,
      modelo: "error",
      proveedor: "error",
      promptVersion: PROMPT_VERSION,
    }
  }
}
