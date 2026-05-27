/**
 * module-bundles.ts — Bundles comerciales de módulos
 *
 * Cada bundle es un conjunto preseleccionado de módulos pensado para un perfil
 * de cliente público. Sirve como atajo en la UI del superadmin: al aplicar un
 * bundle se encienden todos los módulos listados (respetando dependencias).
 *
 * Mismo código, misma BD por tenant, distinto bundle encendido.
 */

import { MODULO_IDS, type ModuloId } from './modules'

export type BundleId = 'CONTROL' | 'EJECUTORA' | 'RECTORIA_SECTORIAL'

export interface Bundle {
  id:          BundleId
  nombre:      string
  descripcion: string
  /** Tipos de entidad para los que este bundle aplica naturalmente. */
  perfiles:    string[]
  modulos:     ModuloId[]
}

// ─── Definiciones ─────────────────────────────────────────────────────────────

const NUCLEO_BASE: ModuloId[] = [
  MODULO_IDS.SITIO_WEB,
  MODULO_IDS.TRANSPARENCIA,
  MODULO_IDS.PQRSD,
]

const CONTROL_EXTRAS: ModuloId[] = [
  MODULO_IDS.VENTANILLA_UNICA,
  MODULO_IDS.GESTION_DOCUMENTAL,
  MODULO_IDS.ARCHIVO_FISICO,
  MODULO_IDS.MIPG,
  MODULO_IDS.AUDITORIA_AVANZADA,
]

const EJECUTORA_EXTRAS: ModuloId[] = [
  MODULO_IDS.CONTABILIDAD_PUBLICA,
  MODULO_IDS.PRESUPUESTO_FORMULACION,
  MODULO_IDS.PRESUPUESTO_EJECUCION,
  MODULO_IDS.PRESUPUESTO_MODIFICACIONES,
  MODULO_IDS.PRESUPUESTO_CIERRE,
  MODULO_IDS.TESORERIA,
  MODULO_IDS.CONTRATACION,
  MODULO_IDS.NOMINA_PUBLICA,
  MODULO_IDS.ACTIVOS_BIENES,
  MODULO_IDS.ALMACEN,
  MODULO_IDS.REPORTES_CONTROL,
  MODULO_IDS.INTEGRACIONES_ESTADO,
]

const RECTORIA_EXTRAS: ModuloId[] = [
  MODULO_IDS.SGBE_BENEFICIARIOS,
  MODULO_IDS.ESB_SECTORIAL,
  MODULO_IDS.DWH_ANALITICA,
  MODULO_IDS.OBSERVATORIO,
  MODULO_IDS.ALERTAS_ML,
  MODULO_IDS.PORTAL_EXTERNO,
]

export const BUNDLES: Bundle[] = [
  {
    id: 'CONTROL',
    nombre: 'Edición Control',
    descripcion: 'Para entidades cuyo core es atención ciudadana, control disciplinario o control fiscal sin ejecución presupuestal pesada.',
    perfiles: ['Personería', 'Defensoría', 'Contraloría', 'Procuraduría'],
    modulos: [...NUCLEO_BASE, ...CONTROL_EXTRAS],
  },
  {
    id: 'EJECUTORA',
    nombre: 'Edición Ejecutora',
    descripcion: 'Para entidades que ejecutan presupuesto público y operan contratación, tesorería, nómina y activos.',
    perfiles: ['SAE', 'Alcaldía', 'Establecimiento público', 'Agencia'],
    modulos: [...NUCLEO_BASE, ...CONTROL_EXTRAS, ...EJECUTORA_EXTRAS],
  },
  {
    id: 'RECTORIA_SECTORIAL',
    nombre: 'Edición Rectoría Sectorial',
    descripcion: 'Para ministerios y rectores de sector administrativo que necesitan orquestar entidades adscritas, beneficiarios y analítica de política pública.',
    perfiles: ['Ministerio', 'Sector administrativo'],
    modulos: [
      ...NUCLEO_BASE,
      ...CONTROL_EXTRAS,
      ...EJECUTORA_EXTRAS,
      ...RECTORIA_EXTRAS,
    ],
  },
]

export function getBundle(id: BundleId): Bundle | undefined {
  return BUNDLES.find((b) => b.id === id)
}
