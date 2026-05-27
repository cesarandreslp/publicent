/**
 * Conector IGAC — consulta de avalúo catastral.
 * Stub hasta que se habilite el web service oficial.
 */

import type { InteropResult, IgacInput, IgacAvaluo } from "./types"

export async function lookup(input: IgacInput): Promise<InteropResult<IgacAvaluo>> {
  const t0 = Date.now()
  const key = (input.cedulaCatastral || input.folioMatricula || "").trim()

  if (!key || key.length < 5) {
    return { ok: false, error: "Se requiere cédula catastral o folio de matrícula", latenciaMs: Date.now() - t0 }
  }

  await wait(160 + Math.random() * 240)

  const destinos = ["RESIDENCIAL", "COMERCIAL", "INDUSTRIAL", "AGRICOLA", "LOTE"]
  const municipios = [
    { mun: "Buga", dep: "Valle del Cauca" },
    { mun: "Cali", dep: "Valle del Cauca" },
    { mun: "Bogotá D.C.", dep: "Cundinamarca" },
    { mun: "Medellín", dep: "Antioquia" },
  ]
  const m = municipios[hash(key) % municipios.length]
  const area = 80 + (hash(key) % 920)
  const valorM2 = 900_000 + (hash(key) % 4_200_000)

  return {
    ok: true,
    latenciaMs: Date.now() - t0,
    data: {
      cedulaCatastral: input.cedulaCatastral || `AAA-${key.slice(-9)}`,
      folioMatricula: input.folioMatricula || null,
      destinoEconomico: destinos[hash(key) % destinos.length],
      area,
      avaluoCatastral: Math.round(area * valorM2),
      vigencia: new Date().getFullYear(),
      direccion: `Carrera ${5 + hash(key) % 70} # ${1 + hash(key) % 90}-${hash(key) % 99}`,
      municipio: m.mun,
      departamento: m.dep,
    },
  }
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
