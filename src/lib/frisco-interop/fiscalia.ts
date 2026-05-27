/**
 * Conector Fiscalía — consulta de proceso penal / extinción de dominio.
 * Stub hasta que se habilite el servicio real (SPOA / SIIF Fiscalía).
 */

import type { InteropResult, FiscaliaInput, FiscaliaProceso } from "./types"

export async function lookup(input: FiscaliaInput): Promise<InteropResult<FiscaliaProceso>> {
  const t0 = Date.now()
  const proceso = input.numeroProceso?.trim()

  if (!proceso || proceso.length < 6) {
    return { ok: false, error: "Número de proceso inválido", latenciaMs: Date.now() - t0 }
  }

  await wait(220 + Math.random() * 260)

  const inexistente = proceso.endsWith("000000")
  if (inexistente) {
    return {
      ok: true,
      latenciaMs: Date.now() - t0,
      data: {
        numeroProceso: proceso,
        estado: "INEXISTENTE",
        delito: "—",
        despacho: "—",
        fechaInicio: "",
        fechaUltimaActuacion: null,
        enExtincionDominio: false,
        bienesAsociados: 0,
      },
    }
  }

  const delitos = [
    "Lavado de activos",
    "Enriquecimiento ilícito",
    "Tráfico de estupefacientes",
    "Concierto para delinquir",
  ]
  const estados: FiscaliaProceso["estado"][] = ["ACTIVO", "ARCHIVADO", "EXTINTO"]

  return {
    ok: true,
    latenciaMs: Date.now() - t0,
    data: {
      numeroProceso: proceso,
      estado: estados[hash(proceso) % estados.length],
      delito: delitos[hash(proceso) % delitos.length],
      despacho: `Fiscalía ${100 + (hash(proceso) % 250)} Seccional`,
      fechaInicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * (180 + hash(proceso) % 720)).toISOString(),
      fechaUltimaActuacion: new Date(Date.now() - 1000 * 60 * 60 * 24 * (10 + hash(proceso) % 60)).toISOString(),
      enExtincionDominio: true,
      bienesAsociados: 1 + (hash(proceso) % 8),
    },
  }
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
