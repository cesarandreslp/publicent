/**
 * frisco-bien-ia.ts — IA de sugerencia para registro/edición de bienes FRISCO.
 *
 * Dado el texto descriptivo de un bien, sugiere:
 *  - tipo (enum FriscoBienTipo)
 *  - estadoFisico (enum FriscoEstadoFisico)
 *  - campos extraídos: placa, folioMatricula, numeroProceso, ubicacion
 *
 * Patrón: Groq → Shipu → fallback regex. IA SUGIERE, funcionario CONFIRMA.
 */

import { callIaJson } from "./groq-client"

export const PROMPT_VERSION = "frisco-bien-v1"

const TIPOS_BIEN = [
  "INMUEBLE_URBANO", "INMUEBLE_RURAL", "VEHICULO_TERRESTRE",
  "VEHICULO_FLUVIAL", "VEHICULO_AEREO", "MAQUINARIA_EQUIPO",
  "SEMOVIENTE", "JOYA_METALES", "OBRA_ARTE", "DINERO_DIVISAS",
  "ACCIONES_CUOTAS", "OTRO",
] as const

const ESTADOS_FISICOS = [
  "BUENO", "REGULAR", "MALO", "EN_RIESGO", "DESTRUIDO",
] as const

export type SugerenciaBien = {
  tipo: string | null
  estadoFisico: string | null
  placa: string | null
  folioMatricula: string | null
  numeroProceso: string | null
  ubicacion: string | null
  confianza: number
  modelo: string
  proveedor: string
  promptVersion: string
}

function fallbackRegex(descripcion: string): SugerenciaBien {
  const d = descripcion.toLowerCase()

  let tipo: string | null = null
  if (/\b(apto|apartamento|casa|lote|predio|finca|local|bodega|oficina|inmueble)\b/.test(d)) {
    tipo = d.includes("rural") || d.includes("finca") ? "INMUEBLE_RURAL" : "INMUEBLE_URBANO"
  } else if (/\b(carro|veh[íi]culo|moto|camion|bus|camioneta|tracto)\b/.test(d)) {
    tipo = "VEHICULO_TERRESTRE"
  } else if (/\b(lancha|lanch[ao]|bote|embarcaci[oó]n)\b/.test(d)) {
    tipo = "VEHICULO_FLUVIAL"
  } else if (/\b(aeronave|avi[oó]n|helic[oó]ptero|avioneta)\b/.test(d)) {
    tipo = "VEHICULO_AEREO"
  } else if (/\b(ganado|bovino|equino|porcino|ovino|semoviente)\b/.test(d)) {
    tipo = "SEMOVIENTE"
  } else if (/\b(joya|oro|plata|metal|esmerald)\b/.test(d)) {
    tipo = "JOYA_METALES"
  } else if (/\b(obra|pintura|cuadro|escultura)\b/.test(d)) {
    tipo = "OBRA_ARTE"
  } else if (/\b(dinero|efectivo|billete|divisa|d[oó]lar|euro)\b/.test(d)) {
    tipo = "DINERO_DIVISAS"
  }

  const matchPlaca = descripcion.match(/\b([A-Z]{3}[-\s]?\d{3}|[A-Z]{3}\d{2}[A-Z])\b/i)
  const matchFolio = descripcion.match(/folio[^\d]*(\d{3}[-–]\d{6,})/i) ?? descripcion.match(/matr[íi]cula[^\d]*(\d{3}[-–]\d{6,})/i)
  const matchProceso = descripcion.match(/proceso[^\d]*([\d-]{6,})/i) ?? descripcion.match(/radicad[oa][^\d]*([\d-]{6,})/i)
  const matchUbicacion = descripcion.match(/(?:ubicad[ao]|en)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i)

  const estadoFisico = d.includes("buen") || d.includes("excelente") ? "BUENO"
    : d.includes("regular") || d.includes("deterioro leve") ? "REGULAR"
    : d.includes("mal estado") || d.includes("deteriorado") ? "MALO"
    : d.includes("riesgo") || d.includes("urgente") ? "EN_RIESGO"
    : null

  return {
    tipo,
    estadoFisico,
    placa: matchPlaca ? matchPlaca[1].toUpperCase().replace(/\s/, "") : null,
    folioMatricula: matchFolio ? matchFolio[1] : null,
    numeroProceso: matchProceso ? matchProceso[1] : null,
    ubicacion: matchUbicacion ? matchUbicacion[1] : null,
    confianza: 0.4,
    modelo: "fallback-regex",
    proveedor: "fallback",
    promptVersion: PROMPT_VERSION,
  }
}

export async function analizarBien(
  tenantId: string,
  descripcion: string,
): Promise<SugerenciaBien> {
  const prompt = `Analiza la siguiente descripción de un bien bajo extinción de dominio (FRISCO, Colombia) y extrae información estructurada en JSON.

Descripción:
"""
${descripcion.slice(0, 800)}
"""

Tipos de bien válidos: ${TIPOS_BIEN.join(", ")}
Estados físicos válidos: ${ESTADOS_FISICOS.join(", ")}

Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "tipo": "<tipo_bien o null>",
  "estadoFisico": "<estado o null>",
  "placa": "<placa del vehículo si aplica, ej: ABC123, o null>",
  "folioMatricula": "<folio de matrícula inmobiliaria si aplica, ej: 123-456789, o null>",
  "numeroProceso": "<número de proceso judicial si aparece, o null>",
  "ubicacion": "<ciudad o municipio si se menciona, o null>",
  "confianza": <0.0-1.0>
}`

  try {
    const result = await callIaJson(tenantId, prompt)
    const raw = JSON.parse(result.raw) as Record<string, unknown>
    return {
      tipo:           (typeof raw.tipo === "string" && TIPOS_BIEN.includes(raw.tipo as typeof TIPOS_BIEN[number])) ? raw.tipo : null,
      estadoFisico:   (typeof raw.estadoFisico === "string" && ESTADOS_FISICOS.includes(raw.estadoFisico as typeof ESTADOS_FISICOS[number])) ? raw.estadoFisico : null,
      placa:          typeof raw.placa === "string" ? raw.placa : null,
      folioMatricula: typeof raw.folioMatricula === "string" ? raw.folioMatricula : null,
      numeroProceso:  typeof raw.numeroProceso === "string" ? raw.numeroProceso : null,
      ubicacion:      typeof raw.ubicacion === "string" ? raw.ubicacion : null,
      confianza:      typeof raw.confianza === "number" ? raw.confianza as number : 0.5,
      modelo:         result.modelo,
      proveedor:      result.proveedor,
      promptVersion:  PROMPT_VERSION,
    }
  } catch {
    return fallbackRegex(descripcion)
  }
}
