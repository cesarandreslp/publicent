/**
 * contratacion-ia.ts — IA de sugerencia de modalidad de contratación y supervisor.
 *
 * Dado el objeto y el valor estimado del proceso, sugiere la modalidad de
 * selección según las reglas de la Ley 80/1150 (y cuantías), y opcionalmente
 * un supervisor de la lista de funcionarios disponibles.
 *
 * IA SUGIERE — el funcionario DECIDE. Fallback determinístico por cuantía.
 */

import { callIaJson } from "./groq-client"

export const PROMPT_VERSION = "con-modalidad-v1"

export const MODALIDADES = [
  "LICITACION_PUBLICA",
  "SELECCION_ABREVIADA",
  "CONCURSO_MERITOS",
  "CONTRATACION_DIRECTA",
  "MINIMA_CUANTIA",
  "ASOCIACION_PUBLICO_PRIVADA",
] as const

export type Modalidad = (typeof MODALIDADES)[number]

export interface Funcionario {
  id: string
  nombre: string
  cargo: string
}

export interface SugerenciaContratacion {
  modalidad: Modalidad
  supervisorId: string | null
  supervisorNombre: string | null
  razon: string
  confianza: number
  modelo: string
  proveedor: string
  promptVersion: string
}

/**
 * Fallback determinístico por cuantía cuando la IA no está disponible.
 * Nota: los umbrales reales dependen del presupuesto anual de la entidad en SMLMV;
 * aquí se usa una heurística conservadora basada en el valor estimado.
 */
function fallbackPorCuantia(valorEstimado: number): { modalidad: Modalidad; razon: string } {
  // Heurística simple (la mínima cuantía suele ser ≤ 10% de la menor cuantía).
  if (valorEstimado <= 50_000_000) {
    return { modalidad: "MINIMA_CUANTIA", razon: "Valor bajo: típicamente mínima cuantía." }
  }
  if (valorEstimado <= 500_000_000) {
    return { modalidad: "SELECCION_ABREVIADA", razon: "Valor intermedio: selección abreviada por menor cuantía." }
  }
  return { modalidad: "LICITACION_PUBLICA", razon: "Valor alto: licitación pública." }
}

export async function sugerirModalidadYSupervisor(
  tenantId: string,
  descripcion: string,
  valorEstimado: number,
  funcionarios: Funcionario[],
): Promise<SugerenciaContratacion> {
  const fb = fallbackPorCuantia(valorEstimado)

  const listaFuncionarios = funcionarios
    .slice(0, 60)
    .map(f => `${f.id} | ${f.nombre} — ${f.cargo}`)
    .join("\n") || "(ninguno disponible)"

  const prompt = `Eres un experto en contratación estatal colombiana (Ley 80 de 1993, Ley 1150 de 2007 y Decreto 1082 de 2015).

Proceso a contratar:
"""
${descripcion.slice(0, 400)}
"""
Valor estimado: $${valorEstimado.toLocaleString("es-CO")} COP

Modalidades posibles:
- LICITACION_PUBLICA: regla general para mayores cuantías.
- SELECCION_ABREVIADA: menor cuantía, bienes/servicios de características técnicas uniformes.
- CONCURSO_MERITOS: consultoría, interventoría, proyectos (selección por capacidad intelectual).
- CONTRATACION_DIRECTA: casos taxativos (urgencia, único proveedor, prestación de servicios profesionales).
- MINIMA_CUANTIA: contratos de menor valor (≤ 10% de la menor cuantía).
- ASOCIACION_PUBLICO_PRIVADA: APP, infraestructura de largo plazo.

Funcionarios disponibles para supervisión (id | nombre — cargo):
${listaFuncionarios}

Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "modalidad": "<una de las modalidades exactas>",
  "supervisorId": "<id del funcionario más idóneo o null>",
  "razon": "<justificación en máx 25 palabras citando el criterio legal>",
  "confianza": <0.0-1.0>
}`

  try {
    const result = await callIaJson(tenantId, prompt)
    const raw = JSON.parse(result.raw) as Record<string, unknown>

    const modalidad = MODALIDADES.includes(raw.modalidad as Modalidad)
      ? (raw.modalidad as Modalidad)
      : fb.modalidad

    const supId = raw.supervisorId ? String(raw.supervisorId) : null
    const sup = supId ? funcionarios.find(f => f.id === supId) ?? null : null

    return {
      modalidad,
      supervisorId:   sup?.id ?? null,
      supervisorNombre: sup?.nombre ?? null,
      razon:          String(raw.razon ?? fb.razon),
      confianza:      typeof raw.confianza === "number" ? raw.confianza : 0.6,
      modelo:         result.modelo,
      proveedor:      result.proveedor,
      promptVersion:  PROMPT_VERSION,
    }
  } catch {
    return {
      modalidad:      fb.modalidad,
      supervisorId:   null,
      supervisorNombre: null,
      razon:          fb.razon,
      confianza:      0.4,
      modelo:         "fallback-cuantia",
      proveedor:      "fallback",
      promptVersion:  PROMPT_VERSION,
    }
  }
}
