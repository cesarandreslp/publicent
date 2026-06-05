/**
 * secop.ts — Conector de lectura SECOP II vía Socrata (datos.gov.co)
 *
 * SECOP II (Colombia Compra Eficiente) publica sus datos en el portal de datos
 * abiertos del Estado (datos.gov.co), servido por Socrata. La integración es de
 * LECTURA: se consultan los procesos y contratos que la entidad ya tiene
 * publicados, filtrando por su NIT. NO existe una API pública de publicación
 * (escritura): eso es transaccional dentro de la plataforma SECOP.
 *
 * Autenticación: HTTP Basic Auth con API Key de Socrata (keyId:keySecret).
 * Las credenciales se generan en datos.gov.co → perfil → API Keys.
 *
 * Datasets (overrideables por env para sandbox/cambios de CCE):
 *   SECOP_PROCESOS_DATASET   — default p6dx-8zbt (SECOP II - Procesos de Contratación)
 *   SECOP_CONTRATOS_DATASET  — default jbjy-vk9h (SECOP II - Contratos Electrónicos)
 *   SECOP_RESOURCE_BASE      — default https://www.datos.gov.co/resource
 */

import { prismaMeta } from '@/lib/prisma-meta'
import { decryptSecretos } from '@/lib/encryption'

const RESOURCE_BASE     = process.env.SECOP_RESOURCE_BASE     ?? 'https://www.datos.gov.co/resource'
const DATASET_PROCESOS  = process.env.SECOP_PROCESOS_DATASET  ?? 'p6dx-8zbt'
const DATASET_CONTRATOS = process.env.SECOP_CONTRATOS_DATASET ?? 'jbjy-vk9h'

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface SecopConfig {
  /** API Key ID de Socrata (campo `clientId` en TenantSecretos). */
  clientId:     string
  /** API Key Secret de Socrata (campo `clientSecret`). */
  clientSecret: string
  /** NIT de la entidad para filtrar sus registros. */
  nit:          string
}

export interface SecopProcesoRow {
  idProceso:   string
  referencia:  string
  objeto:      string
  fase:        string
  modalidad:   string
  valor:       number
  url:         string | null
}

export interface SecopContratoRow {
  idContrato:  string
  referencia:  string
  objeto:      string
  estado:      string
  proveedor:   string
  valor:       number
  url:         string | null
}

interface ConsultaOpts { limit?: number; offset?: number }

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normaliza el NIT al formato que usa SECOP en datos.gov.co: solo dígitos,
 * sin puntos ni dígito de verificación. Ej: "815.000.290-6" → "815000290".
 */
export function normalizarNitSecop(nit: string): string {
  return (nit.split('-')[0] ?? '').replace(/\D/g, '')
}

function authHeader(config: SecopConfig): string {
  return 'Basic ' + Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
}

/** Ejecuta una consulta SoQL contra un dataset de datos.gov.co. */
async function fetchSocrata(
  config: SecopConfig,
  dataset: string,
  query: string
): Promise<Record<string, string>[]> {
  const res = await fetch(`${RESOURCE_BASE}/${dataset}.json?${query}`, {
    headers: { Authorization: authHeader(config) },
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Socrata ${res.status}: ${txt.slice(0, 200)}`)
  }
  return res.json() as Promise<Record<string, string>[]>
}

const num = (v: string | undefined): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// ─── Lectura de config desde meta-DB ──────────────────────────────────────────

/**
 * Lee y descifra la configuración SECOP del tenant desde la meta-DB.
 * Retorna null si las credenciales no están configuradas.
 */
export async function getSecopConfig(tenantId: string): Promise<SecopConfig | null> {
  try {
    const tenant = await prismaMeta.tenant.findUnique({
      where:  { id: tenantId },
      select: { secretosEncriptados: true },
    })
    const secretos = decryptSecretos(tenant?.secretosEncriptados)
    const s = secretos.secop
    if (!s?.clientId || !s?.clientSecret) return null
    return { clientId: s.clientId, clientSecret: s.clientSecret, nit: s.nit ?? '' }
  } catch {
    return null
  }
}

// ─── Funciones de consulta ────────────────────────────────────────────────────

/** Trae los procesos de contratación publicados por la entidad en SECOP II. */
export async function consultarProcesosSecop(
  config: SecopConfig,
  opts: ConsultaOpts = {}
): Promise<SecopProcesoRow[]> {
  const nit = normalizarNitSecop(config.nit)
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0
  const query = `nit_entidad=${encodeURIComponent(nit)}&$limit=${limit}&$offset=${offset}&$order=fecha_de_publicacion_del DESC`
  const rows = await fetchSocrata(config, DATASET_PROCESOS, query)
  return rows.map(r => ({
    idProceso:  r.id_del_proceso ?? '',
    referencia: r.referencia_del_proceso ?? '',
    objeto:     r['descripci_n_del_procedimiento'] ?? r.nombre_del_procedimiento ?? '',
    fase:       r.fase ?? '',
    modalidad:  r.modalidad_de_contratacion ?? '',
    valor:      num(r.precio_base),
    url:        r.urlproceso ?? null,
  }))
}

/** Trae los contratos electrónicos suscritos por la entidad en SECOP II. */
export async function consultarContratosSecop(
  config: SecopConfig,
  opts: ConsultaOpts = {}
): Promise<SecopContratoRow[]> {
  const nit = normalizarNitSecop(config.nit)
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0
  const query = `nit_entidad=${encodeURIComponent(nit)}&$limit=${limit}&$offset=${offset}`
  const rows = await fetchSocrata(config, DATASET_CONTRATOS, query)
  return rows.map(r => ({
    idContrato: r.id_contrato ?? r.referencia_del_contrato ?? '',
    referencia: r.referencia_del_contrato ?? r.proceso_de_compra ?? '',
    objeto:     r.objeto_del_contrato ?? r.descripcion_del_proceso ?? '',
    estado:     r.estado_contrato ?? r.estado_bpin ?? '',
    proveedor:  r.proveedor_adjudicado ?? r.nombre_del_proveedor ?? '',
    valor:      num(r.valor_del_contrato),
    url:        r.urlproceso ?? r.url_contrato ?? null,
  }))
}

/** Cuenta el total de procesos publicados por la entidad. */
export async function contarProcesosSecop(config: SecopConfig): Promise<number> {
  const nit = normalizarNitSecop(config.nit)
  const rows = await fetchSocrata(config, DATASET_PROCESOS, `nit_entidad=${encodeURIComponent(nit)}&$select=count(*) as total`)
  return num(rows[0]?.total)
}

/**
 * Verifica que las credenciales sean válidas haciendo una consulta mínima.
 * Devuelve { ok, total? } o { ok: false, error }.
 */
export async function verificarCredencialesSecop(
  config: SecopConfig
): Promise<{ ok: true; total: number } | { ok: false; error: string }> {
  try {
    const total = await contarProcesosSecop(config)
    return { ok: true, total }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
