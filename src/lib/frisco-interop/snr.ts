/**
 * Conector SNR — Superintendencia de Notariado y Registro.
 * Stub determinístico hasta que SAE provea credenciales del servicio real.
 * Para producción, sustituir `lookup` por la llamada HTTPS firmada al portal SNR.
 */

import type { InteropResult, SnrInput, SnrFolio } from "./types"

export async function lookup(input: SnrInput): Promise<InteropResult<SnrFolio>> {
  const t0 = Date.now()
  const folio = input.folioMatricula?.trim()

  if (!folio || folio.length < 5) {
    return { ok: false, error: "Folio de matrícula inválido", latenciaMs: Date.now() - t0 }
  }

  // Stub: simula latencia y devuelve datos derivados del folio.
  await wait(180 + Math.random() * 220)

  const inexistente = folio.endsWith("0000")
  if (inexistente) {
    return {
      ok: true,
      latenciaMs: Date.now() - t0,
      data: {
        folio,
        estado: "INEXISTENTE",
        direccion: null,
        area: null,
        matriculaInmobiliaria: folio,
        propietarios: [],
        ultimaAnotacion: null,
        gravamenes: [],
      },
    }
  }

  return {
    ok: true,
    latenciaMs: Date.now() - t0,
    data: {
      folio,
      estado: "ACTIVO",
      direccion: `Calle ${10 + (hash(folio) % 80)} # ${1 + (hash(folio) % 50)}-${(hash(folio) * 7) % 99}`,
      area: 60 + (hash(folio) % 540),
      matriculaInmobiliaria: folio,
      propietarios: [
        {
          nombre: `Titular extinto ${folio.slice(-3)}`,
          documento: String(80_000_000 + (hash(folio) % 19_000_000)),
          cuota: "100%",
        },
      ],
      ultimaAnotacion: {
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * (5 + hash(folio) % 90)).toISOString(),
        descripcion: "Medida cautelar — extinción de dominio",
      },
      gravamenes: ["Medida cautelar (Fiscalía)"],
    },
  }
}

function wait(ms: number) { return new Promise(r => setTimeout(r, ms)) }

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
