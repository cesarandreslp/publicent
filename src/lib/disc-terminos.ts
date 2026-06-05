/**
 * disc-terminos.ts — Términos legales, máquina de estados y semáforo del
 * módulo Función Disciplinaria (Ley 1952/2019 — Código General Disciplinario).
 *
 * Los términos son en DÍAS HÁBILES. Para fechas de vencimiento reales usar
 * calcularFechaVencimientoEtapa (que delega en dias-habiles.ts con festivos).
 */

import type { DiscEstadoProceso, DiscTipoProceso } from "@prisma/client"
import { calcularFechaVencimientoHabil } from "@/lib/dias-habiles"

// ─── Términos por etapa (días hábiles) ────────────────────────────────────────

/**
 * Días hábiles del término legal de cada etapa según la Ley 1952/2019.
 * Para procedimiento verbal el término total es reducido (30 días).
 *
 * Notas:
 *  - INDAGACION_PRELIMINAR: hasta 6 meses prorrogables; se calculan 90 días
 *    hábiles como primer corte (el funcionario puede prorrogar manualmente).
 *  - PLIEGO_DE_CARGOS / DESCARGOS: el disciplinado tiene 30 días para responder.
 *  - Etapas sin término fijo retornan 0 (no se calcula vencimiento automático).
 */
export function calcularTerminoEtapa(
  estado: DiscEstadoProceso,
  tipo: DiscTipoProceso
): number {
  // Procedimiento verbal: trámite concentrado, 30 días hábiles totales.
  if (tipo === "DISCIPLINARIO_VERBAL") {
    switch (estado) {
      case "INDAGACION_PRELIMINAR":
      case "INVESTIGACION_DISCIPLINARIA":
        return 30
      case "PLIEGO_DE_CARGOS":
      case "DESCARGOS":
        return 10
      default:
        return 0
    }
  }

  // Procedimiento ordinario.
  switch (estado) {
    case "INDAGACION_PRELIMINAR":
      return 90 // primer corte de los 6 meses prorrogables
    case "INVESTIGACION_DISCIPLINARIA":
      return 180
    case "PLIEGO_DE_CARGOS":
      return 30 // término para que el disciplinado responda
    case "DESCARGOS":
      return 30
    case "PERIODO_PRUEBAS":
      return 90
    case "ALEGATOS":
      return 10
    case "FALLO_PRIMERA_INSTANCIA":
      return 0
    case "RECURSO_APELACION":
      return 30
    case "FALLO_SEGUNDA_INSTANCIA":
      return 0
    case "EJECUTORIADO":
    case "ARCHIVADO":
      return 0
    default:
      return 0
  }
}

/**
 * Calcula la fecha de vencimiento de una etapa a partir de su fecha de inicio.
 * Retorna null si la etapa no tiene término fijo.
 */
export async function calcularFechaVencimientoEtapa(
  fechaInicio: Date,
  estado: DiscEstadoProceso,
  tipo: DiscTipoProceso
): Promise<Date | null> {
  const dias = calcularTerminoEtapa(estado, tipo)
  if (dias <= 0) return null
  return calcularFechaVencimientoHabil(dias, fechaInicio)
}

// ─── Máquina de estados ───────────────────────────────────────────────────────

/**
 * Transiciones permitidas entre estados del proceso disciplinario.
 * Cada estado puede avanzar a ARCHIVADO (archivo por cualquier causa legal).
 */
export const TRANSICIONES_PROCESO: Record<DiscEstadoProceso, DiscEstadoProceso[]> = {
  INDAGACION_PRELIMINAR:       ["INVESTIGACION_DISCIPLINARIA", "ARCHIVADO"],
  INVESTIGACION_DISCIPLINARIA: ["PLIEGO_DE_CARGOS", "ARCHIVADO"],
  PLIEGO_DE_CARGOS:            ["DESCARGOS", "ARCHIVADO"],
  DESCARGOS:                   ["PERIODO_PRUEBAS", "ARCHIVADO"],
  PERIODO_PRUEBAS:             ["ALEGATOS", "ARCHIVADO"],
  ALEGATOS:                    ["FALLO_PRIMERA_INSTANCIA", "ARCHIVADO"],
  FALLO_PRIMERA_INSTANCIA:     ["RECURSO_APELACION", "EJECUTORIADO", "ARCHIVADO"],
  RECURSO_APELACION:           ["FALLO_SEGUNDA_INSTANCIA", "ARCHIVADO"],
  FALLO_SEGUNDA_INSTANCIA:     ["EJECUTORIADO", "ARCHIVADO"],
  EJECUTORIADO:                [],
  ARCHIVADO:                   [],
}

/** Verifica si una transición de estado es válida. */
export function esTransicionValida(
  desde: DiscEstadoProceso,
  hacia: DiscEstadoProceso
): boolean {
  return TRANSICIONES_PROCESO[desde]?.includes(hacia) ?? false
}

/** Estado(s) al que puede avanzar el proceso desde el estado actual. */
export function siguientesEstados(actual: DiscEstadoProceso): DiscEstadoProceso[] {
  return TRANSICIONES_PROCESO[actual] ?? []
}

/** Descripción legible de la actuación automática al entrar en un estado. */
export const ACTUACION_POR_ESTADO: Record<DiscEstadoProceso, string> = {
  INDAGACION_PRELIMINAR:       "Inicio de indagación preliminar",
  INVESTIGACION_DISCIPLINARIA: "Apertura de investigación disciplinaria formal",
  PLIEGO_DE_CARGOS:            "Formulación de pliego de cargos",
  DESCARGOS:                   "Inicio del periodo de descargos",
  PERIODO_PRUEBAS:             "Apertura del periodo probatorio",
  ALEGATOS:                    "Traslado para alegatos de conclusión",
  FALLO_PRIMERA_INSTANCIA:     "Fallo de primera instancia",
  RECURSO_APELACION:           "Concesión del recurso de apelación",
  FALLO_SEGUNDA_INSTANCIA:     "Fallo de segunda instancia",
  EJECUTORIADO:                "Ejecutoria del fallo",
  ARCHIVADO:                   "Archivo del proceso",
}

// ─── Semáforo de términos ─────────────────────────────────────────────────────

export type ColorSemaforoDisc = "VERDE" | "AMARILLO" | "ROJO" | "NEGRO"

/**
 * Calcula el color del semáforo disciplinario a partir de la fecha de
 * vencimiento de la etapa actual. Espeja calcularSemaforo de groq-client
 * pero parte de la fecha de vencimiento directamente.
 *
 * @param fechaVencimiento  null → sin término (VERDE)
 * @param fechaInicio       inicio de la etapa (para % transcurrido); default 30 días antes
 */
export function calcularSemaforoDiscipinario(
  fechaVencimiento: Date | null,
  ahora: Date = new Date()
): ColorSemaforoDisc {
  if (!fechaVencimiento) return "VERDE"

  const msRestante = fechaVencimiento.getTime() - ahora.getTime()
  if (msRestante < 0) return "NEGRO" // vencido

  const diasRestantes = msRestante / (24 * 60 * 60 * 1000)
  if (diasRestantes <= 5) return "ROJO"
  if (diasRestantes <= 15) return "AMARILLO"
  return "VERDE"
}
