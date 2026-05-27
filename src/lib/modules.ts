/**
 * modules.ts — Catálogo de módulos de la plataforma + configuración de Storage
 *
 * Cada tenant tiene un subconjunto de módulos activos en `Tenant.modulosActivos`
 * (meta-DB). Este archivo es la fuente única de verdad sobre qué módulos existen,
 * a qué categoría pertenecen, qué nivel comercial los habilita y de cuáles
 * dependen para funcionar.
 *
 * Si agregas un módulo:
 *  1. Añade su id a MODULO_IDS
 *  2. Define su config en ConfigXxx (o reutiliza ConfigBase si solo necesita {activo})
 *  3. Añade su key a ModulosConfig
 *  4. Añade su entrada a MODULOS_DEFAULT (con activo: false salvo BASE)
 *  5. Añade su entrada a MODULOS_CATALOGO con categoria, tier, dependeDe
 *  6. Si necesita storage o secretos, extiende StorageConfig o el bloque cifrado
 *
 * Los ids son ESTABLES — una vez persistidos en BD no se renombran.
 */

// ─── IDs de módulos ───────────────────────────────────────────────────────────

export const MODULO_IDS = {
  // BASE (portal público)
  SITIO_WEB:                 'sitio_web',
  TRANSPARENCIA:             'transparencia',
  PQRSD:                     'pqrsd',

  // Atención ciudadana
  VENTANILLA_UNICA:          'ventanilla_unica',

  // Gestión documental
  GESTION_DOCUMENTAL:        'gestion_documental',
  ARCHIVO_FISICO:            'archivo_fisico',

  // Cumplimiento y control
  MIPG:                      'mipg',
  AUDITORIA_AVANZADA:        'auditoria_avanzada',

  // Financiero y presupuestal
  CONTABILIDAD_PUBLICA:      'contabilidad_publica',
  PRESUPUESTO_FORMULACION:   'presupuesto_formulacion',
  PRESUPUESTO_EJECUCION:     'presupuesto_ejecucion',
  PRESUPUESTO_MODIFICACIONES:'presupuesto_modificaciones',
  PRESUPUESTO_CIERRE:        'presupuesto_cierre',
  TESORERIA:                 'tesoreria',
  CONTRATACION:              'contratacion',
  NOMINA_PUBLICA:            'nomina_publica',

  // Operativo
  ACTIVOS_BIENES:            'activos_bienes',
  ALMACEN:                   'almacen',

  // Verticales sectoriales
  RENTAS_LOCALES:            'rentas_locales',
  FRISCO_BIENES:             'frisco_bienes',
  FRISCO_INTEROP:            'frisco_interop',
  SGBE_BENEFICIARIOS:        'sgbe_beneficiarios',
  ESB_SECTORIAL:             'esb_sectorial',

  // Analítica e inteligencia
  DWH_ANALITICA:             'dwh_analitica',
  OBSERVATORIO:              'observatorio',
  ALERTAS_ML:                'alertas_ml',

  // Portales externos e integraciones
  PORTAL_EXTERNO:            'portal_externo',
  REPORTES_CONTROL:          'reportes_control',
  INTEGRACIONES_ESTADO:      'integraciones_estado',
} as const

export type ModuloId = (typeof MODULO_IDS)[keyof typeof MODULO_IDS]

// ─── Categorías y niveles (sólo UI / lógica comercial) ────────────────────────

export type ModuloCategoria =
  | 'portal'
  | 'atencion'
  | 'documental'
  | 'cumplimiento'
  | 'financiero'
  | 'operativo'
  | 'analitica'
  | 'vertical'
  | 'integracion'

export const CATEGORIA_LABEL: Record<ModuloCategoria, string> = {
  portal:       'Portal público',
  atencion:     'Atención ciudadana',
  documental:   'Gestión documental',
  cumplimiento: 'Cumplimiento y control',
  financiero:   'Financiero y presupuestal',
  operativo:    'Operativo',
  analitica:    'Analítica e inteligencia',
  vertical:     'Verticales sectoriales',
  integracion:  'Integraciones externas',
}

export type ModuloTier =
  | 'BASE'        // siempre o casi siempre activo
  | 'ESTANDAR'    // incluido desde el plan medio
  | 'AVANZADO'    // planes superiores
  | 'VERTICAL'    // específico de tipo de entidad
  | 'INTEGRACION' // conector externo

// ─── Proveedores de Storage ───────────────────────────────────────────────────

export type StorageProvider = 's3' | 'minio' | 'r2' | 'gcs' | 'azure' | 'sftp' | 'local'

export interface StorageConfig {
  provider: StorageProvider
  bucket?: string
  endpoint?: string
  accessKeyId?: string
  secretAccessKey?: string
  region?: string
  prefix?: string
  sftpHost?: string
  sftpPort?: string
  sftpUser?: string
  sftpPassword?: string
  sftpBasePath?: string
  publicBaseUrl?: string
}

// ─── Configuración por módulo ─────────────────────────────────────────────────

/** Configuración mínima compartida por cualquier módulo. */
export interface ConfigBase {
  activo: boolean
}

export interface ConfigSitioWeb extends ConfigBase {}

export interface ConfigPqrsd extends ConfigBase {
  /**
   * Código (GdTrdDependencia.codigo) de la dependencia receptora de PQRSD.
   * Si está vacío, se usa la primera dependencia raíz activa.
   * Permite a entidades sin árbol jerárquico estricto (alcaldías con N secretarías)
   * decidir quién recibe la radicación ciudadana.
   */
  dependenciaReceptoraCodigo?: string
}

export interface ConfigVentanillaUnica extends ConfigBase {
  apiUrl?: string
  apiKey?: string
  usarFallback?: boolean
}

export interface ConfigGestionDocumental extends ConfigBase {
  apiUrl?: string
  apiKey?: string
  storage?: StorageConfig
}

/** Estructura completa de modulosActivos en meta-DB. */
export interface ModulosConfig {
  // BASE
  sitio_web:                  ConfigSitioWeb
  transparencia:              ConfigBase
  pqrsd:                      ConfigPqrsd

  // Atención ciudadana
  ventanilla_unica:           ConfigVentanillaUnica

  // Documental
  gestion_documental:         ConfigGestionDocumental
  archivo_fisico:             ConfigBase

  // Cumplimiento
  mipg:                       ConfigBase
  auditoria_avanzada:         ConfigBase

  // Financiero
  contabilidad_publica:       ConfigBase
  presupuesto_formulacion:    ConfigBase
  presupuesto_ejecucion:      ConfigBase
  presupuesto_modificaciones: ConfigBase
  presupuesto_cierre:         ConfigBase
  tesoreria:                  ConfigBase
  contratacion:               ConfigBase
  nomina_publica:             ConfigBase

  // Operativo
  activos_bienes:             ConfigBase
  almacen:                    ConfigBase

  // Verticales
  rentas_locales:             ConfigBase
  frisco_bienes:              ConfigBase
  frisco_interop:             ConfigBase
  sgbe_beneficiarios:         ConfigBase
  esb_sectorial:              ConfigBase

  // Analítica
  dwh_analitica:              ConfigBase
  observatorio:               ConfigBase
  alertas_ml:                 ConfigBase

  // Portales / integración
  portal_externo:             ConfigBase
  reportes_control:           ConfigBase
  integraciones_estado:       ConfigBase
}

// ─── Estado por defecto ───────────────────────────────────────────────────────

const DEFAULT_STORAGE: StorageConfig = {
  provider:        'r2',
  bucket:          process.env.R2_BUCKET_NAME        ?? '',
  endpoint:        process.env.R2_ENDPOINT           ?? '',
  accessKeyId:     process.env.R2_ACCESS_KEY_ID      ?? '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY  ?? '',
  region:          'auto',
  prefix:          'documentos/',
  publicBaseUrl:   process.env.R2_PUBLIC_URL          ?? '',
}

/** Inactivo por defecto. */
const off: ConfigBase = { activo: false }

export const MODULOS_DEFAULT: ModulosConfig = {
  // BASE — encendidos por defecto (toda entidad pública los necesita por ley)
  sitio_web:                  { activo: true },
  transparencia:              { activo: true },
  pqrsd:                      { activo: true },

  // El resto inactivo hasta que el superadmin lo habilite
  ventanilla_unica:           { activo: false },
  gestion_documental:         { activo: false, storage: DEFAULT_STORAGE },
  archivo_fisico:             off,

  mipg:                       off,
  auditoria_avanzada:         off,

  contabilidad_publica:       off,
  presupuesto_formulacion:    off,
  presupuesto_ejecucion:      off,
  presupuesto_modificaciones: off,
  presupuesto_cierre:         off,
  tesoreria:                  off,
  contratacion:               off,
  nomina_publica:             off,

  activos_bienes:             off,
  almacen:                    off,

  rentas_locales:             off,
  frisco_bienes:              off,
  frisco_interop:             off,
  sgbe_beneficiarios:         off,
  esb_sectorial:              off,

  dwh_analitica:              off,
  observatorio:               off,
  alertas_ml:                 off,

  portal_externo:             off,
  reportes_control:           off,
  integraciones_estado:       off,
}

// ─── Catálogo de módulos (UI superadmin + reglas de dependencia) ──────────────

export interface ModuloCatalogo {
  id:                ModuloId
  nombre:            string
  descripcion:       string
  categoria:         ModuloCategoria
  tier:              ModuloTier
  planesDisponibles: string[]
  /** Si true, el toggle está bloqueado en ON. */
  obligatorio?:      boolean
  /** IDs de módulos que deben estar activos para que este funcione. */
  dependeDe?:        ModuloId[]
  /** Tipos de entidad para los que este módulo tiene sentido. Si vacío, aplica a todos. */
  entidadesObjetivo?: Array<'PERSONERIA' | 'CONTRALORIA' | 'ALCALDIA' | 'CONCEJO' | 'GOBERNACION' | 'ASAMBLEA' | 'MINISTERIO' | 'AGENCIA' | 'OTRO'>
  tieneIntegracion?: boolean
  tieneStorage?:     boolean
  camposIntegracion?: Array<{
    key:         string
    label:       string
    placeholder: string
    tipo:        'text' | 'password' | 'url'
    descripcion?: string
  }>
}

const PLANES_BASE       = ['BASICO', 'ESTANDAR', 'PROFESIONAL', 'ENTERPRISE']
const PLANES_ESTANDAR   = ['ESTANDAR', 'PROFESIONAL', 'ENTERPRISE']
const PLANES_AVANZADO   = ['PROFESIONAL', 'ENTERPRISE']

export const MODULOS_CATALOGO: ModuloCatalogo[] = [
  // ── BASE — Portal público ──────────────────────────────────────────────────
  {
    id: MODULO_IDS.SITIO_WEB,
    nombre: 'Portal Institucional Gov.co',
    descripcion: 'Portal público con cumplimiento de los lineamientos del MinTIC (Gov.co), accesibilidad WCAG 2.1 AA y estructura base de la entidad.',
    categoria: 'portal',
    tier: 'BASE',
    planesDisponibles: PLANES_BASE,
    obligatorio: true,
  },
  {
    id: MODULO_IDS.TRANSPARENCIA,
    nombre: 'Transparencia Activa',
    descripcion: 'Publicación automática de información obligatoria por la Ley 1712 de 2014 y Resolución MinTIC 1519 de 2020.',
    categoria: 'portal',
    tier: 'BASE',
    planesDisponibles: PLANES_BASE,
    dependeDe: [MODULO_IDS.SITIO_WEB],
  },
  {
    id: MODULO_IDS.PQRSD,
    nombre: 'PQRSD ciudadano básico',
    descripcion: 'Formulario público de radicación de peticiones, quejas, reclamos, sugerencias y denuncias con número de radicado, semáforo de vencimiento y consulta ciudadana.',
    categoria: 'portal',
    tier: 'BASE',
    planesDisponibles: PLANES_BASE,
    dependeDe: [MODULO_IDS.SITIO_WEB],
  },

  // ── Atención ciudadana ─────────────────────────────────────────────────────
  {
    id: MODULO_IDS.VENTANILLA_UNICA,
    nombre: 'Ventanilla Única con IA',
    descripcion: 'Clasificación automática de PQRSD con LLM (tipo, prioridad, dependencia sugerida, término legal), asignación a funcionarios, demografía FURAG y delegación opcional a sistema externo.',
    categoria: 'atencion',
    tier: 'ESTANDAR',
    planesDisponibles: PLANES_ESTANDAR,
    dependeDe: [MODULO_IDS.PQRSD],
    tieneIntegracion: true,
    camposIntegracion: [
      {
        key: 'apiUrl',
        label: 'URL del sistema externo (opcional)',
        placeholder: 'https://ventanilla.tudominio.gov.co/api',
        tipo: 'url',
        descripcion: 'Sólo si se delega a un sistema VU externo. Si se deja vacío, se usa el motor IA nativo.',
      },
      {
        key: 'apiKey',
        label: 'API Key del sistema externo',
        placeholder: 'vu_live_xxxxxxxxxxxxx',
        tipo: 'password',
      },
    ],
  },

  // ── Gestión documental ─────────────────────────────────────────────────────
  {
    id: MODULO_IDS.GESTION_DOCUMENTAL,
    nombre: 'Gestión Documental',
    descripcion: 'Radicación oficial AGN-compatible, TRD, expedientes electrónicos, firma con QR y verificación pública, índice electrónico al cierre del expediente.',
    categoria: 'documental',
    tier: 'ESTANDAR',
    planesDisponibles: PLANES_ESTANDAR,
    tieneStorage: true,
  },
  {
    id: MODULO_IDS.ARCHIVO_FISICO,
    nombre: 'Archivo Físico',
    descripcion: 'Inventario jerárquico de archivo físico (edificio → piso → bodega → estante → entrepaño → caja → carpeta) con gestión de préstamos y transferencias documentales.',
    categoria: 'documental',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.GESTION_DOCUMENTAL],
  },

  // ── Cumplimiento y control ─────────────────────────────────────────────────
  {
    id: MODULO_IDS.MIPG,
    nombre: 'MIPG y Plan Anticorrupción',
    descripcion: 'Modelo Integrado de Planeación y Gestión, Plan Anticorrupción y de Atención al Ciudadano (PAAC), indicadores y FURAG.',
    categoria: 'cumplimiento',
    tier: 'ESTANDAR',
    planesDisponibles: PLANES_ESTANDAR,
    dependeDe: [MODULO_IDS.SITIO_WEB],
  },
  {
    id: MODULO_IDS.AUDITORIA_AVANZADA,
    nombre: 'Auditoría avanzada',
    descripcion: 'Log inmutable de eventos sensibles, reportes para entes de control y trazabilidad de cambios sobre datos críticos.',
    categoria: 'cumplimiento',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
  },

  // ── Financiero y presupuestal ──────────────────────────────────────────────
  {
    id: MODULO_IDS.CONTABILIDAD_PUBLICA,
    nombre: 'Contabilidad pública (NICSP / CGN)',
    descripcion: 'Motor contable de doble partida con Catálogo General de Cuentas de la Contaduría General de la Nación, dualidad económico-patrimonial y presupuestal, cierre anual NICSP.',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
  },
  {
    id: MODULO_IDS.PRESUPUESTO_FORMULACION,
    nombre: 'Formulación presupuestal',
    descripcion: 'Anteproyecto de presupuesto, aprobación por órgano colegiado, presupuestos de ingresos y gastos clasificados por fuente, programa y proyecto del Plan de Desarrollo.',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.CONTABILIDAD_PUBLICA],
  },
  {
    id: MODULO_IDS.PRESUPUESTO_EJECUCION,
    nombre: 'Ejecución presupuestal (CDP/RP/Obligación/Pago)',
    descripcion: 'Las cuatro etapas del gasto público encadenadas: Certificado de Disponibilidad, Registro Presupuestal, Obligación/Causación y Pago. Control de saldos en tiempo real.',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.PRESUPUESTO_FORMULACION],
  },
  {
    id: MODULO_IDS.PRESUPUESTO_MODIFICACIONES,
    nombre: 'Modificaciones presupuestales',
    descripcion: 'Adiciones, traslados, créditos y contracréditos con flujo de aprobación según cuantía (acto administrativo o aprobación de órgano colegiado).',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.PRESUPUESTO_FORMULACION],
  },
  {
    id: MODULO_IDS.PRESUPUESTO_CIERRE,
    nombre: 'Cierre presupuestal y reservas',
    descripcion: 'Cierre al 31 de diciembre: constitución de reservas presupuestales y cuentas por pagar, gestión de vigencias futuras y liquidación del rezago en la vigencia siguiente.',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.PRESUPUESTO_EJECUCION],
  },
  {
    id: MODULO_IDS.TESORERIA,
    nombre: 'Tesorería y PAC',
    descripcion: 'Programa Anual de Caja por fuente, gestión de cuentas bancarias públicas, flujo de caja, boletín diario de tesorería y órdenes de pago.',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.PRESUPUESTO_EJECUCION],
  },
  {
    id: MODULO_IDS.CONTRATACION,
    nombre: 'Contratación pública',
    descripcion: 'Procesos contractuales bajo Ley 80 y Ley 1150 (licitación, selección abreviada, mínima cuantía, contratación directa) vinculados al ciclo presupuestal y SECOP.',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.PRESUPUESTO_EJECUCION],
  },
  {
    id: MODULO_IDS.NOMINA_PUBLICA,
    nombre: 'Nómina pública',
    descripcion: 'Liquidación de nómina con escala salarial del sector público, prestaciones, parafiscales, retención en la fuente y vínculo con el rubro presupuestal de servicios personales.',
    categoria: 'financiero',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.CONTABILIDAD_PUBLICA],
  },

  // ── Operativo ──────────────────────────────────────────────────────────────
  {
    id: MODULO_IDS.ACTIVOS_BIENES,
    nombre: 'Activos y bienes públicos',
    descripcion: 'Inventario de activos fijos y bienes públicos (muebles, inmuebles, equipo, bienes de uso público), depreciación NICSP, baja con acto administrativo.',
    categoria: 'operativo',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.CONTABILIDAD_PUBLICA],
  },
  {
    id: MODULO_IDS.ALMACEN,
    nombre: 'Almacén',
    descripcion: 'Entrada vinculada al RP, kardex con valuación promedio ponderado, distinción devolutivos/consumibles, despachos internos y conciliación con activos.',
    categoria: 'operativo',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.ACTIVOS_BIENES],
  },

  // ── Verticales sectoriales ─────────────────────────────────────────────────
  {
    id: MODULO_IDS.RENTAS_LOCALES,
    nombre: 'Rentas municipales',
    descripcion: 'Impuesto Predial Unificado, ICA, delineación urbana, vehículos, estampillas, tasas, multas y cartera de morosos con cobro coactivo.',
    categoria: 'vertical',
    tier: 'VERTICAL',
    planesDisponibles: PLANES_AVANZADO,
    entidadesObjetivo: ['ALCALDIA', 'GOBERNACION'],
    dependeDe: [MODULO_IDS.CONTABILIDAD_PUBLICA],
  },
  {
    id: MODULO_IDS.FRISCO_BIENES,
    nombre: 'FRISCO — Bienes en extinción de dominio',
    descripcion: 'Ficha única del bien incautado (folio, estado jurídico, georreferencia, avalúo), gestión de depositarios y arrendatarios, y proceso de destinación final (víctimas, subasta, transferencia).',
    categoria: 'vertical',
    tier: 'VERTICAL',
    planesDisponibles: PLANES_AVANZADO,
    entidadesObjetivo: ['AGENCIA', 'OTRO'],
    dependeDe: [MODULO_IDS.GESTION_DOCUMENTAL, MODULO_IDS.ACTIVOS_BIENES],
  },
  {
    id: MODULO_IDS.FRISCO_INTEROP,
    nombre: 'FRISCO — Interoperabilidad SNR / Fiscalía / IGAC',
    descripcion: 'Cruces automatizados con Superintendencia de Notariado y Registro, Fiscalía e IGAC para mantener el inventario consistente.',
    categoria: 'vertical',
    tier: 'VERTICAL',
    planesDisponibles: PLANES_AVANZADO,
    entidadesObjetivo: ['AGENCIA', 'OTRO'],
    dependeDe: [MODULO_IDS.FRISCO_BIENES],
  },
  {
    id: MODULO_IDS.SGBE_BENEFICIARIOS,
    nombre: 'Registro soberano de beneficiarios',
    descripcion: 'Registro único de beneficiarios de programas sociales con historial de intervenciones, verificación de condicionalidades y portabilidad ante cambio de operador.',
    categoria: 'vertical',
    tier: 'VERTICAL',
    planesDisponibles: PLANES_AVANZADO,
    entidadesObjetivo: ['MINISTERIO', 'ALCALDIA', 'GOBERNACION'],
    dependeDe: [MODULO_IDS.GESTION_DOCUMENTAL],
  },
  {
    id: MODULO_IDS.ESB_SECTORIAL,
    nombre: 'Bus de integración sectorial',
    descripcion: 'Capa de orquestación que conecta sistemas de entidades adscritas (ICBF/INCI/INSOR u otras) y expone una vista unificada al ministerio rector con identificador único de beneficiario.',
    categoria: 'vertical',
    tier: 'VERTICAL',
    planesDisponibles: PLANES_AVANZADO,
    entidadesObjetivo: ['MINISTERIO'],
    dependeDe: [MODULO_IDS.SGBE_BENEFICIARIOS],
  },

  // ── Analítica e inteligencia ───────────────────────────────────────────────
  {
    id: MODULO_IDS.DWH_ANALITICA,
    nombre: 'Data warehouse y dashboards',
    descripcion: 'Repositorio analítico con snapshots periódicos de los sistemas fuente, dashboards de rectoría y reportería ejecutiva.',
    categoria: 'analitica',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
  },
  {
    id: MODULO_IDS.OBSERVATORIO,
    nombre: 'Observatorio digital open data',
    descripcion: 'Publicación abierta de cifras y series con actualización automática, conforme al estándar de datos abiertos del Estado colombiano.',
    categoria: 'analitica',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.DWH_ANALITICA],
  },
  {
    id: MODULO_IDS.ALERTAS_ML,
    nombre: 'Alertas predictivas (ML)',
    descripcion: 'Motor de alertas tempranas basado en modelos de aprendizaje automático: riesgo contractual, riesgo de feminicidio, deserción de beneficiarios u otros definidos por el cliente.',
    categoria: 'analitica',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.DWH_ANALITICA],
  },

  // ── Portales externos e integraciones ──────────────────────────────────────
  {
    id: MODULO_IDS.PORTAL_EXTERNO,
    nombre: 'Portales para actores externos',
    descripcion: 'Portales especializados para depositarios, operadores de programas, beneficiarios u otros actores externos con autenticación independiente y trazabilidad.',
    categoria: 'portal',
    tier: 'AVANZADO',
    planesDisponibles: PLANES_AVANZADO,
  },
  {
    id: MODULO_IDS.REPORTES_CONTROL,
    nombre: 'Reportes a entes de control',
    descripcion: 'Generación automatizada de informes a CHIP (Contaduría), FUT (DNP), SIRECI (Contraloría), Ley 617 y Marco Fiscal de Mediano Plazo.',
    categoria: 'integracion',
    tier: 'INTEGRACION',
    planesDisponibles: PLANES_AVANZADO,
    dependeDe: [MODULO_IDS.CONTABILIDAD_PUBLICA],
  },
  {
    id: MODULO_IDS.INTEGRACIONES_ESTADO,
    nombre: 'Conectores SIIF / SECOP / SISBEN / SIGEP',
    descripcion: 'Capa de conectores a los sistemas transversales del Estado colombiano. Activable por conector según necesidad.',
    categoria: 'integracion',
    tier: 'INTEGRACION',
    planesDisponibles: PLANES_AVANZADO,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function resolveModulosConfig(raw: unknown): ModulosConfig {
  const partial = (raw && typeof raw === 'object') ? raw as Partial<ModulosConfig> : {}
  const out = { ...MODULOS_DEFAULT } as ModulosConfig

  for (const key of Object.keys(MODULOS_DEFAULT) as Array<keyof ModulosConfig>) {
    const def = MODULOS_DEFAULT[key]
    const provided = partial[key]
    if (provided && typeof provided === 'object') {
      // Merge superficial — los configs son planos salvo gestion_documental.storage
      out[key] = { ...def, ...provided } as ModulosConfig[typeof key]
    }
  }

  // Merge profundo para storage del módulo documental
  const docStorage = (partial.gestion_documental as ConfigGestionDocumental | undefined)?.storage
  if (docStorage && typeof docStorage === 'object') {
    out.gestion_documental = {
      ...out.gestion_documental,
      storage: { ...DEFAULT_STORAGE, ...docStorage },
    }
  } else if (!out.gestion_documental.storage) {
    out.gestion_documental.storage = DEFAULT_STORAGE
  }

  return out
}

export function isModuleActive(config: ModulosConfig, moduloId: ModuloId): boolean {
  const cfg = config[moduloId] as ConfigBase | undefined
  return cfg?.activo === true
}

/** Devuelve true si todas las dependencias declaradas en el catálogo están activas. */
export function areDepsActive(config: ModulosConfig, moduloId: ModuloId): boolean {
  const cat = MODULOS_CATALOGO.find((m) => m.id === moduloId)
  if (!cat?.dependeDe?.length) return true
  return cat.dependeDe.every((dep) => isModuleActive(config, dep))
}

export function getPqrsdConfig(config: ModulosConfig): ConfigPqrsd {
  return config.pqrsd
}

export function getVentanillaConfig(config: ModulosConfig): ConfigVentanillaUnica {
  return config.ventanilla_unica
}

export function getGestionDocumentalConfig(config: ModulosConfig): ConfigGestionDocumental {
  return config.gestion_documental
}

export function getStorageConfig(config: ModulosConfig): StorageConfig {
  return config.gestion_documental.storage ?? DEFAULT_STORAGE
}
