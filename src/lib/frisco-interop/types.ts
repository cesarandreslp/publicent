/**
 * Contratos compartidos por los servicios de interoperabilidad FRISCO.
 * Cada servicio (SNR / Fiscalía / IGAC) expone `lookup(input)` con resultado
 * normalizado para que el caller no acople la UI a esquemas remotos.
 */

export type InteropResult<T> =
  | { ok: true; data: T; latenciaMs: number }
  | { ok: false; error: string; latenciaMs: number }

// ── SNR (Superintendencia de Notariado y Registro) ──────────────────────────

export interface SnrInput {
  folioMatricula: string
}

export interface SnrFolio {
  folio: string
  estado: 'ACTIVO' | 'CANCELADO' | 'INEXISTENTE'
  direccion: string | null
  area: number | null            // m²
  matriculaInmobiliaria: string
  propietarios: Array<{ nombre: string; documento: string; cuota: string }>
  ultimaAnotacion: { fecha: string; descripcion: string } | null
  gravamenes: string[]
}

// ── Fiscalía ────────────────────────────────────────────────────────────────

export interface FiscaliaInput {
  numeroProceso: string
}

export interface FiscaliaProceso {
  numeroProceso: string
  estado: 'ACTIVO' | 'ARCHIVADO' | 'EXTINTO' | 'INEXISTENTE'
  delito: string
  despacho: string
  fechaInicio: string
  fechaUltimaActuacion: string | null
  enExtincionDominio: boolean
  bienesAsociados: number
}

// ── IGAC (Instituto Geográfico Agustín Codazzi) ─────────────────────────────

export interface IgacInput {
  folioMatricula?: string
  cedulaCatastral?: string
}

export interface IgacAvaluo {
  cedulaCatastral: string
  folioMatricula: string | null
  destinoEconomico: string
  area: number
  avaluoCatastral: number
  vigencia: number
  direccion: string | null
  municipio: string
  departamento: string
}
