/**
 * disc-labels.ts — Etiquetas y colores legibles del módulo Función Disciplinaria.
 * Puro / cliente-safe (sin dependencias de servidor).
 */

export const TIPO_PROCESO_LABEL: Record<string, string> = {
  DISCIPLINARIO_ORDINARIO: "Disciplinario ordinario",
  DISCIPLINARIO_VERBAL: "Disciplinario verbal",
  QUEJA_CIUDADANA: "Queja ciudadana",
  DERECHO_PETICION_INTERNO: "Derecho de petición interno",
}

export const ESTADO_PROCESO_LABEL: Record<string, string> = {
  INDAGACION_PRELIMINAR: "Indagación preliminar",
  INVESTIGACION_DISCIPLINARIA: "Investigación disciplinaria",
  PLIEGO_DE_CARGOS: "Pliego de cargos",
  DESCARGOS: "Descargos",
  PERIODO_PRUEBAS: "Periodo de pruebas",
  ALEGATOS: "Alegatos",
  FALLO_PRIMERA_INSTANCIA: "Fallo primera instancia",
  RECURSO_APELACION: "Recurso de apelación",
  FALLO_SEGUNDA_INSTANCIA: "Fallo segunda instancia",
  EJECUTORIADO: "Ejecutoriado",
  ARCHIVADO: "Archivado",
}

export const CALIFICACION_LABEL: Record<string, string> = {
  GRAVISIMA: "Gravísima",
  GRAVE: "Grave",
  LEVE: "Leve",
}

export const SANCION_LABEL: Record<string, string> = {
  DESTITUCION_INHABILIDAD: "Destitución e inhabilidad",
  SUSPENSION_INHABILIDAD: "Suspensión e inhabilidad",
  SUSPENSION: "Suspensión",
  MULTA: "Multa",
  AMONESTACION_ESCRITA: "Amonestación escrita",
  ARCHIVO: "Archivo (sin sanción)",
}

export const ESTADO_TUTELA_LABEL: Record<string, string> = {
  RECIBIDA: "Recibida",
  EN_TRAMITE: "En trámite",
  FALLADA: "Fallada",
  IMPUGNADA: "Impugnada",
  EJECUTORIADA: "Ejecutoriada",
  EN_CUMPLIMIENTO: "En cumplimiento",
  CUMPLIDA: "Cumplida",
  CERRADA: "Cerrada",
}

/** Color del semáforo a partir de fecha de vencimiento ISO (o null). Cliente-safe. */
export function semaforoDesdeVencimiento(
  fechaVencimientoIso: string | null,
  estadoTerminal = false
): "VERDE" | "AMARILLO" | "ROJO" | "NEGRO" | "NINGUNO" {
  if (estadoTerminal) return "NINGUNO"
  if (!fechaVencimientoIso) return "VERDE"
  const vence = new Date(fechaVencimientoIso).getTime()
  const ms = vence - Date.now()
  if (ms < 0) return "NEGRO"
  const dias = ms / (24 * 60 * 60 * 1000)
  if (dias <= 5) return "ROJO"
  if (dias <= 15) return "AMARILLO"
  return "VERDE"
}

export const SEMAFORO_CLASE: Record<string, string> = {
  VERDE: "bg-emerald-100 text-emerald-700",
  AMARILLO: "bg-amber-100 text-amber-700",
  ROJO: "bg-red-100 text-red-700",
  NEGRO: "bg-slate-800 text-white",
  NINGUNO: "bg-slate-100 text-slate-500",
}

export const SEMAFORO_LABEL: Record<string, string> = {
  VERDE: "En término",
  AMARILLO: "Por vencer",
  ROJO: "Crítico",
  NEGRO: "Vencido",
  NINGUNO: "—",
}
