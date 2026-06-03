/**
 * frisco-interop-ia.ts — Análisis IA de discrepancias entre fuentes externas.
 *
 * Cruza los resultados de SNR (registro), IGAC (catastro) y Fiscalía (proceso
 * penal) contra los datos internos del bien registrado en FRISCO y detecta
 * inconsistencias semánticas que requieren atención del funcionario.
 *
 * Casos típicos de discrepancia:
 *  - Área SNR ≠ área IGAC (tolerancia ±10 m²)
 *  - Dirección SNR difiere de dirección IGAC (barrio / número diferente)
 *  - Propietario registrado SNR ≠ titular interno del bien
 *  - Estado SNR "CANCELADO" con bien aún en proceso activo
 *  - Bien con más bienes asociados en Fiscalía que los registrados
 *  - Municipio IGAC distinto al registrado internamente
 *
 * Patrón: Groq → Shipu → fallback determinístico (reglas numéricas).
 * IA SUGIERE, funcionario DECIDE.
 */

import { callIaJson } from "./groq-client"

export const PROMPT_VERSION = "frisco-interop-v1"

export type SeveridadDiscrepancia = "INFO" | "ALERTA" | "CRITICA"

export interface Discrepancia {
  campo: string
  fuenteA: string
  valorA: string
  fuenteB: string
  valorB: string
  descripcion: string
  severidad: SeveridadDiscrepancia
}

export interface AnalisisInterop {
  discrepancias: Discrepancia[]
  resumenFiscal: string | null       // 2 líneas sobre el proceso penal
  resumenGeneral: string             // síntesis ejecutiva de 2-3 líneas
  nivelRiesgo: "BAJO" | "MEDIO" | "ALTO"
  modelo: string
  proveedor: string
  promptVersion: string
}

// ─── Fallback determinístico ──────────────────────────────────────────────────

function fallbackDeterministico(input: AnalisisInput): AnalisisInterop {
  const discrepancias: Discrepancia[] = []

  if (input.snr && input.igac) {
    // Área
    const areaSnr  = input.snr.area  ?? null
    const areaIgac = input.igac.area ?? null
    if (areaSnr != null && areaIgac != null && Math.abs(areaSnr - areaIgac) > 10) {
      discrepancias.push({
        campo: "Área del inmueble",
        fuenteA: "SNR", valorA: `${areaSnr} m²`,
        fuenteB: "IGAC", valorB: `${areaIgac} m²`,
        descripcion: `Diferencia de ${Math.abs(areaSnr - areaIgac).toFixed(0)} m² entre registro y catastro.`,
        severidad: Math.abs(areaSnr - areaIgac) > 50 ? "ALERTA" : "INFO",
      })
    }

    // Dirección (comparación simple de primeras 15 chars)
    const dirSnr  = (input.snr.direccion  ?? "").toLowerCase().slice(0, 20)
    const dirIgac = (input.igac.direccion ?? "").toLowerCase().slice(0, 20)
    if (dirSnr && dirIgac && dirSnr !== dirIgac) {
      discrepancias.push({
        campo: "Dirección",
        fuenteA: "SNR",  valorA: input.snr.direccion  ?? "—",
        fuenteB: "IGAC", valorB: input.igac.direccion ?? "—",
        descripcion: "Las direcciones reportadas difieren entre Registro y Catastro.",
        severidad: "ALERTA",
      })
    }
  }

  if (input.snr && input.bienInterno) {
    // Estado SNR vs estado jurídico interno
    if (input.snr.estado === "CANCELADO" && input.bienInterno.estadoJuridico === "EN_PROCESO") {
      discrepancias.push({
        campo: "Estado jurídico",
        fuenteA: "SNR",    valorA: "CANCELADO",
        fuenteB: "Interno", valorB: "EN_PROCESO",
        descripcion: "El folio aparece cancelado en SNR pero el bien sigue en proceso activo.",
        severidad: "CRITICA",
      })
    }
  }

  const nivel: AnalisisInterop["nivelRiesgo"] =
    discrepancias.some(d => d.severidad === "CRITICA") ? "ALTO"
    : discrepancias.some(d => d.severidad === "ALERTA") ? "MEDIO"
    : "BAJO"

  const resumenFiscal = input.fiscalia
    ? `Proceso ${input.fiscalia.numeroProceso} — ${input.fiscalia.estado}. ` +
      `Delito: ${input.fiscalia.delito}. ` +
      (input.fiscalia.enExtincionDominio ? "En extinción de dominio." : "Sin extinción confirmada.")
    : null

  return {
    discrepancias,
    resumenFiscal,
    resumenGeneral: discrepancias.length === 0
      ? "Sin discrepancias detectadas entre las fuentes consultadas."
      : `Se detectaron ${discrepancias.length} discrepancia(s). Revisar campos marcados.`,
    nivelRiesgo: nivel,
    modelo:        "fallback-reglas",
    proveedor:     "fallback",
    promptVersion: PROMPT_VERSION,
  }
}

// ─── Tipos de entrada ─────────────────────────────────────────────────────────

interface SnrResumen {
  folio: string
  estado: string
  direccion: string | null
  area: number | null
  propietarios: Array<{ nombre: string; documento: string; cuota: string }>
  gravamenes: string[]
}

interface IgacResumen {
  area: number
  avaluoCatastral: number
  vigencia: number
  direccion: string | null
  municipio: string
  departamento: string
  destinoEconomico: string
}

interface FiscaliaResumen {
  numeroProceso: string
  estado: string
  delito: string
  despacho: string
  fechaInicio: string
  fechaUltimaActuacion: string | null
  enExtincionDominio: boolean
  bienesAsociados: number
}

interface BienInterno {
  codigo: string
  tipo: string
  estadoJuridico: string
  estadoFisico: string | null
  ubicacion: string | null
  avaluoVigente: number | null
}

export interface AnalisisInput {
  tenantId: string
  bienInterno: BienInterno
  snr?: SnrResumen | null
  igac?: IgacResumen | null
  fiscalia?: FiscaliaResumen | null
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function analizarDiscrepanciasInterop(
  input: AnalisisInput,
): Promise<AnalisisInterop> {

  const secciones: string[] = []

  if (input.bienInterno) {
    secciones.push(`BIEN REGISTRADO INTERNAMENTE:
- Código: ${input.bienInterno.codigo}
- Tipo: ${input.bienInterno.tipo}
- Estado jurídico: ${input.bienInterno.estadoJuridico}
- Estado físico: ${input.bienInterno.estadoFisico ?? "no registrado"}
- Ubicación interna: ${input.bienInterno.ubicacion ?? "no registrada"}
- Avalúo interno: ${input.bienInterno.avaluoVigente != null ? `$${input.bienInterno.avaluoVigente.toLocaleString("es-CO")} COP` : "no registrado"}`)
  }

  if (input.snr) {
    secciones.push(`DATOS SNR (Registro Notarial):
- Folio: ${input.snr.folio}
- Estado: ${input.snr.estado}
- Dirección registral: ${input.snr.direccion ?? "no disponible"}
- Área registral: ${input.snr.area != null ? `${input.snr.area} m²` : "no disponible"}
- Propietarios: ${input.snr.propietarios.map(p => `${p.nombre} (${p.documento}, ${p.cuota})`).join("; ") || "ninguno"}
- Gravámenes: ${input.snr.gravamenes.join(", ") || "ninguno"}`)
  }

  if (input.igac) {
    secciones.push(`DATOS IGAC (Catastro):
- Área catastral: ${input.igac.area} m²
- Avalúo catastral: $${input.igac.avaluoCatastral.toLocaleString("es-CO")} COP (vigencia ${input.igac.vigencia})
- Dirección catastral: ${input.igac.direccion ?? "no disponible"}
- Municipio / Dpto: ${input.igac.municipio}, ${input.igac.departamento}
- Destino económico: ${input.igac.destinoEconomico}`)
  }

  if (input.fiscalia) {
    secciones.push(`DATOS FISCALÍA (Proceso penal):
- N° proceso: ${input.fiscalia.numeroProceso}
- Estado: ${input.fiscalia.estado}
- Delito principal: ${input.fiscalia.delito}
- Despacho: ${input.fiscalia.despacho}
- Inicio: ${input.fiscalia.fechaInicio}
- Última actuación: ${input.fiscalia.fechaUltimaActuacion ?? "no registrada"}
- En extinción de dominio: ${input.fiscalia.enExtincionDominio ? "SÍ" : "NO"}
- Bienes asociados al proceso: ${input.fiscalia.bienesAsociados}`)
  }

  const prompt = `Eres un experto en gestión jurídica de bienes bajo extinción de dominio en Colombia (FRISCO / Ley 1708/2014).
Analiza los siguientes datos cruzados de múltiples fuentes oficiales y detecta discrepancias que el funcionario de SAE debe revisar.

${secciones.join("\n\n")}

Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "discrepancias": [
    {
      "campo": "<nombre del campo en conflicto>",
      "fuenteA": "<nombre fuente 1: SNR | IGAC | Fiscalía | Interno>",
      "valorA": "<valor de la fuente 1>",
      "fuenteB": "<nombre fuente 2>",
      "valorB": "<valor de la fuente 2>",
      "descripcion": "<explicación en máx 25 palabras de por qué es relevante>",
      "severidad": "<INFO | ALERTA | CRITICA>"
    }
  ],
  "resumenFiscal": "<2 oraciones sobre el proceso penal y su relevancia para la gestión del bien, o null si no hay datos de Fiscalía>",
  "resumenGeneral": "<2-3 oraciones de síntesis ejecutiva para el funcionario>",
  "nivelRiesgo": "<BAJO | MEDIO | ALTO>"
}

Criterios de severidad:
- CRITICA: datos que indican riesgo legal inmediato (folio cancelado, propietario diferente, proceso archivado sin extinción confirmada)
- ALERTA: diferencias significativas que requieren verificación (áreas con >10% diferencia, direcciones distintas, avalúos muy dispares)
- INFO: diferencias menores o de formato (diferencias de área <10%, municipio abreviado diferente)`

  try {
    const result = await callIaJson(input.tenantId, prompt)
    const raw = JSON.parse(result.raw) as Record<string, unknown>

    const SEVERIDADES: SeveridadDiscrepancia[] = ["INFO", "ALERTA", "CRITICA"]
    const NIVELES = ["BAJO", "MEDIO", "ALTO"] as const

    const discrepancias: Discrepancia[] = Array.isArray(raw.discrepancias)
      ? (raw.discrepancias as Record<string, unknown>[]).map(d => ({
          campo:       String(d.campo       ?? ""),
          fuenteA:     String(d.fuenteA     ?? ""),
          valorA:      String(d.valorA      ?? ""),
          fuenteB:     String(d.fuenteB     ?? ""),
          valorB:      String(d.valorB      ?? ""),
          descripcion: String(d.descripcion ?? ""),
          severidad:   SEVERIDADES.includes(d.severidad as SeveridadDiscrepancia)
                         ? d.severidad as SeveridadDiscrepancia
                         : "INFO",
        }))
      : []

    return {
      discrepancias,
      resumenFiscal:  typeof raw.resumenFiscal  === "string" ? raw.resumenFiscal  : null,
      resumenGeneral: typeof raw.resumenGeneral === "string" ? raw.resumenGeneral : "Análisis completado.",
      nivelRiesgo:    NIVELES.includes(raw.nivelRiesgo as typeof NIVELES[number])
                        ? raw.nivelRiesgo as typeof NIVELES[number]
                        : "BAJO",
      modelo:        result.modelo,
      proveedor:     result.proveedor,
      promptVersion: PROMPT_VERSION,
    }
  } catch {
    return fallbackDeterministico(input)
  }
}
