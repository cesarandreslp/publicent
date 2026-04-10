/**
 * Gestor Documental — Modelos y tipos base
 *
 * Alineado con la lógica de Orfeo NG pero construido con la tecnología
 * del proyecto (TypeScript, Prisma, Next.js).
 *
 * Módulos:
 * - Radicación (interna, externa, salida)
 * - TRD (Tabla de Retención Documental)
 * - Flujos de aprobación/trámite
 * - Expedientes
 * - Trazabilidad y auditoría
 */

// ─── Estados de radicado ──────────────────────────────────────────────────────

export type EstadoRadicado =
  | 'PENDIENTE'      // Recién creado, pendiente de asignación
  | 'ASIGNADO'       // Asignado a un responsable
  | 'EN_TRAMITE'     // En proceso de respuesta
  | 'RESPONDIDO'     // Respuesta enviada al ciudadano
  | 'CERRADO'        // Proceso completado
  | 'VENCIDO'        // Superó el plazo legal sin respuesta
  | 'ARCHIVADO'      // En archivo físico/digital

// ─── Tipo de radicado ─────────────────────────────────────────────────────────

export type TipoRadicado =
  | 'ENTRADA'        // Correspondencia recibida (ciudadanos, entidades)
  | 'SALIDA'         // Correspondencia generada por la entidad
  | 'INTERNO'        // Comunicaciones internas entre dependencias

// ─── Tipo de documento TRD ────────────────────────────────────────────────────

export type TipoDocumentoTRD =
  | 'RESOLUCION'
  | 'CIRCULAR'
  | 'MEMORANDO'
  | 'OFICIO'
  | 'CONTRATO'
  | 'INFORME'
  | 'ACTA'
  | 'CERTIFICADO'
  | 'FORMATO'
  | 'OTRO'

// ─── Disposición final según TRD ──────────────────────────────────────────────

export type DisposicionFinal = 'CT' | 'E' | 'MT' | 'S' | 'D'
// CT = Conservación Total | E = Eliminación | MT = Microfilmación | S = Selección | D = Digitalización

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Radicado {
  id: string
  numero: string             // Ej: PGB-E-2026-00001
  tipo: TipoRadicado
  estado: EstadoRadicado
  asunto: string
  nombreRemitente: string
  documentoRemitente?: string
  entidadRemitente?: string
  correoRemitente?: string
  telefonoRemitente?: string
  dependenciaDestino: string
  responsableId?: string
  fechaRadicacion: Date
  fechaVencimiento?: Date    // Calculada según tipo de solicitud
  contenido?: string         // Descripción del documento
  folioPrincipal?: string    // URL del archivo principal
  anexos?: string[]          // URLs de anexos
  // PQRS asociada (si viene de módulo PQRS nativo)
  pqrsId?: string
  // TRD asociada
  serieDocumentalId?: string
  // Metadatos
  createdAt: Date
  updatedAt: Date
}

export interface SerieDocumental {
  id: string
  codigo: string             // Ej: 100.01
  dependencia: string        // Nombre de la dependencia
  serie: string              // Serie documental
  subserie: string           // Subserie documental
  retencionArchivoCentral: number  // Años en archivo central
  retencionArchivoGestion: number  // Años en archivo de gestión
  disposicionFinal: DisposicionFinal
  procedimiento?: string     // Descripción del procedimiento
  activo: boolean
}

export interface Expediente {
  id: string
  numero: string             // Ej: EXP-2026-00001
  nombre: string
  descripcion?: string
  serieDocumentalId?: string
  dependencia: string
  responsableId?: string
  estado: 'ABIERTO' | 'CERRADO' | 'TRANSFERIDO'
  radicados: string[]        // IDs de radicados que conforman el expediente
  foliacion: number          // Número de folios
  ubicacionFisica?: string   // Topografía en archivo físico
  fechaApertura: Date
  fechaCierre?: Date
  createdAt: Date
  updatedAt: Date
}

export interface FlujoBandeja {
  id: string
  radicadoId: string
  dependenciaOrigen: string
  dependenciaDestino: string
  responsableOrigenId?: string
  responsableDestinoId?: string
  instrucciones?: string
  adjuntos?: string[]
  fechaEnvio: Date
  fechaRecepcion?: Date
  // El radicado cambia de estado cuando entra a la bandeja
}

export interface TrazabilidadRadicado {
  id: string
  radicadoId: string
  accion: string             // "CREADO", "ASIGNADO", "REENVIADO", "RESPONDIDO", etc.
  descripcion?: string
  usuarioId: string
  usuarioNombre: string
  dependencia?: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Genera el número de radicado según el tipo y año actual.
 * Formato: {PREFIJO_ENTIDAD}-{TIPO}-{AÑO}-{CONSECUTIVO:05d}
 */
export function generarNumeroRadicado(
  tipo: TipoRadicado,
  consecutivo: number,
  prefijoEntidad = 'PGB'
): string {
  const year = new Date().getFullYear()
  const tipoAbbr = tipo === 'ENTRADA' ? 'E' : tipo === 'SALIDA' ? 'S' : 'I'
  return `${prefijoEntidad}-${tipoAbbr}-${year}-${String(consecutivo).padStart(5, '0')}`
}

/**
 * Calcula la fecha de vencimiento según el tipo de solicitud.
 * Basado en la Ley 1755 de 2015 (CPACA).
 */
export function calcularFechaVencimiento(tipo: string, fechaRadicacion: Date): Date {
  const fecha = new Date(fechaRadicacion)
  const diasHabiles: Record<string, number> = {
    PETICION: 15,
    QUEJA: 15,
    RECLAMO: 15,
    CONSULTA: 30,
    DENUNCIA: 10,
    DEFAULT: 15,
  }
  const dias = diasHabiles[tipo.toUpperCase()] ?? diasHabiles.DEFAULT
  // Suma días hábiles (simplificado: suma días calendario × 1.4 para aproximar hábiles)
  fecha.setDate(fecha.getDate() + Math.ceil(dias * 1.4))
  return fecha
}
