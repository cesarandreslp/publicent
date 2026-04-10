/**
 * modules.ts — Sistema de módulos + configuración de Storage
 *
 * Cada tenant puede configurar independientemente:
 *  - Qué módulos están activos (Sitio Web, Ventanilla Única, Gestión Documental)
 *  - Qué proveedor de almacenamiento de archivos usará el Gestor Documental
 */

// ─── IDs de módulos ───────────────────────────────────────────────────────────

export const MODULO_IDS = {
  SITIO_WEB:           'sitio_web',
  VENTANILLA_UNICA:    'ventanilla_unica',
  GESTION_DOCUMENTAL:  'gestion_documental',
} as const

export type ModuloId = (typeof MODULO_IDS)[keyof typeof MODULO_IDS]

// ─── Proveedores de Storage ───────────────────────────────────────────────────

export type StorageProvider = 's3' | 'minio' | 'r2' | 'gcs' | 'azure' | 'sftp' | 'local'

export interface StorageConfig {
  /** Proveedor seleccionado */
  provider: StorageProvider
  /** Bucket / contenedor / directorio raíz donde se guardan los archivos */
  bucket?: string
  /** Endpoint del servidor (para MinIO, R2, S3 custom, GCS, Azure) */
  endpoint?: string
  /** Access Key ID (S3/MinIO/R2) o Account Name (Azure) o Client Email (GCS) */
  accessKeyId?: string
  /** Secret Access Key (S3/MinIO/R2) o Account Key (Azure) o Private Key (GCS) */
  secretAccessKey?: string
  /** Región (S3/R2) */
  region?: string
  /** Prefijo de carpeta dentro del bucket (ej: "personeria-buga/docs/") */
  prefix?: string
  /** Host SFTP */
  sftpHost?: string
  /** Puerto SFTP (default 22) */
  sftpPort?: string
  /** Usuario SFTP */
  sftpUser?: string
  /** Contraseña SFTP */
  sftpPassword?: string
  /** Ruta base en el servidor SFTP */
  sftpBasePath?: string
  /** URL pública base para construir las URLs de descarga */
  publicBaseUrl?: string
}

// ─── Configuración por módulo ──────────────────────────────────────────────────

export interface ConfigSitioWeb {
  activo: boolean
}

export interface ConfigVentanillaUnica {
  activo: boolean
  apiUrl?: string
  apiKey?: string
  usarFallback?: boolean
}

export interface ConfigGestionDocumental {
  activo: boolean
  /** URL base del sistema externo de Gestión Documental (opcional) */
  apiUrl?: string
  /** API key para autenticación con sistema externo (opcional) */
  apiKey?: string
  /** Configuración del servidor de almacenamiento de documentos */
  storage?: StorageConfig
}

/** Estructura tipada de modulosActivos en la meta-DB */
export interface ModulosConfig {
  sitio_web:          ConfigSitioWeb
  ventanilla_unica:   ConfigVentanillaUnica
  gestion_documental: ConfigGestionDocumental
}

// ─── Estado por defecto ────────────────────────────────────────────────────────

export const MODULOS_DEFAULT: ModulosConfig = {
  sitio_web:          { activo: true },
  ventanilla_unica:   { activo: false },
  gestion_documental: {
    activo: false,
    storage: { provider: 'local', prefix: 'documentos/', publicBaseUrl: '' },
  },
}

// ─── Catálogo de módulos (para UI) ────────────────────────────────────────────

export interface ModuloCatalogo {
  id: ModuloId
  nombre: string
  descripcion: string
  planesDisponibles: string[]
  obligatorio?: boolean
  tieneIntegracion?: boolean
  tieneStorage?: boolean
  camposIntegracion?: Array<{
    key: string
    label: string
    placeholder: string
    tipo: 'text' | 'password' | 'url'
    descripcion?: string
  }>
}

export const MODULOS_CATALOGO: ModuloCatalogo[] = [
  {
    id: MODULO_IDS.SITIO_WEB,
    nombre: 'Sitio Web Institucional',
    descripcion: 'Portal público de la entidad: noticias, transparencia, servicios, atención ciudadana y PQRS básico. Activo por defecto en todos los planes.',
    planesDisponibles: ['BASICO', 'ESTANDAR', 'PROFESIONAL', 'ENTERPRISE'],
    obligatorio: true,
  },
  {
    id: MODULO_IDS.VENTANILLA_UNICA,
    nombre: 'Ventanilla Única PQRS',
    descripcion: 'Sistema avanzado de radicación y seguimiento de PQRS. Cuando está activo, el formulario público delega automáticamente a este sistema.',
    planesDisponibles: ['ESTANDAR', 'PROFESIONAL', 'ENTERPRISE'],
    tieneIntegracion: true,
    camposIntegracion: [
      {
        key: 'apiUrl',
        label: 'URL del sistema de Ventanilla Única',
        placeholder: 'https://ventanilla.tudominio.gov.co/api',
        tipo: 'url',
        descripcion: 'Endpoint base del sistema externo',
      },
      {
        key: 'apiKey',
        label: 'API Key de integración',
        placeholder: 'vu_live_xxxxxxxxxxxxx',
        tipo: 'password',
        descripcion: 'Clave de autenticación entre sistemas',
      },
    ],
  },
  {
    id: MODULO_IDS.GESTION_DOCUMENTAL,
    nombre: 'Gestión Documental',
    descripcion: 'Sistema de radicación oficial AGN-compatible con TRD, expedientes electrónicos y almacenamiento seguro de documentos digitales.',
    planesDisponibles: ['PROFESIONAL', 'ENTERPRISE'],
    tieneIntegracion: false,
    tieneStorage: true,
    camposIntegracion: [],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function resolveModulosConfig(raw: unknown): ModulosConfig {
  if (!raw || typeof raw !== 'object') return { ...MODULOS_DEFAULT }
  const partial = raw as Partial<ModulosConfig>
  return {
    sitio_web: { ...MODULOS_DEFAULT.sitio_web, ...(partial.sitio_web ?? {}) },
    ventanilla_unica: { ...MODULOS_DEFAULT.ventanilla_unica, ...(partial.ventanilla_unica ?? {}) },
    gestion_documental: {
      ...MODULOS_DEFAULT.gestion_documental,
      ...(partial.gestion_documental ?? {}),
      storage: {
        ...MODULOS_DEFAULT.gestion_documental.storage,
        ...(partial.gestion_documental?.storage ?? {}),
      } as StorageConfig,
    },
  }
}

export function isModuleActive(config: ModulosConfig, moduloId: ModuloId): boolean {
  return config[moduloId]?.activo === true
}

export function getVentanillaConfig(config: ModulosConfig): ConfigVentanillaUnica {
  return config.ventanilla_unica
}

export function getGestionDocumentalConfig(config: ModulosConfig): ConfigGestionDocumental {
  return config.gestion_documental
}

export function getStorageConfig(config: ModulosConfig): StorageConfig {
  return config.gestion_documental.storage ?? MODULOS_DEFAULT.gestion_documental.storage!
}
