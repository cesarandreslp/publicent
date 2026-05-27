/**
 * Esquemas de validación Zod para endpoints API.
 * Centralizados para reutilización y consistencia.
 */

import { z } from "zod"

// ─── PQRS ──────────────────────────────────────────────────────────────────────

export const pqrsPublicoSchema = z.object({
  tipo: z.string().min(1, "Tipo de PQRS es obligatorio"),
  asunto: z.string().min(3, "El asunto debe tener al menos 3 caracteres").max(500),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(5000),
  anonimo: z.boolean().optional().default(false),
  nombreSolicitante: z.string().max(200).optional(),
  tipoDocumento: z.string().max(50).optional(),
  documentoIdentidad: z.string().max(30).optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().max(20).optional(),
  direccion: z.string().max(300).optional(),
  turnstileToken: z.string().min(1, "Token CAPTCHA requerido"),
})

export const pqrsAdminSchema = z.object({
  tipo: z.string().min(1, "Tipo es obligatorio"),
  asunto: z.string().min(3).max(500),
  descripcion: z.string().min(10).max(5000),
  nombreCiudadano: z.string().max(200).optional(),
  tipoDocumento: z.string().max(50).optional(),
  numeroDocumento: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().max(20).optional(),
  direccion: z.string().max(300).optional(),
  municipio: z.string().max(100).optional(),
  anonimo: z.boolean().optional().default(false),
  prioridad: z.enum(["BAJA", "NORMAL", "ALTA", "URGENTE"]).optional().default("NORMAL"),
  asignadoId: z.string().cuid().optional().nullable(),
})

// ─── Slider ────────────────────────────────────────────────────────────────────

export const sliderCreateSchema = z.object({
  titulo: z.string().max(200).optional(),
  subtitulo: z.string().max(300).optional(),
  imagenUrl: z.string().url("URL de imagen inválida"),
  imagenMovilUrl: z.string().url().optional().nullable(),
  enlace: z.string().max(500).optional(),
  textoBoton: z.string().max(100).optional(),
  orden: z.number().int().min(0).optional(),
  activo: z.boolean().optional().default(true),
  fechaInicio: z.string().datetime().optional().nullable(),
  fechaFin: z.string().datetime().optional().nullable(),
})

export const sliderUpdateSchema = sliderCreateSchema.partial().omit({ imagenUrl: true }).extend({
  imagenUrl: z.string().url().optional(),
})

// ─── Usuarios ──────────────────────────────────────────────────────────────────

export const usuarioCreateSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
  nombre: z.string().min(2, "Nombre obligatorio").max(100),
  apellido: z.string().min(2, "Apellido obligatorio").max(100),
  cargo: z.string().max(100).optional(),
  telefono: z.string().max(20).optional(),
  rolId: z.string().cuid("ID de rol inválido"),
})

export const usuarioUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  nombre: z.string().min(2).max(100).optional(),
  apellido: z.string().min(2).max(100).optional(),
  cargo: z.string().max(100).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  rolId: z.string().cuid().optional(),
  activo: z.boolean().optional(),
})

// ─── Secciones ─────────────────────────────────────────────────────────────────

export const seccionUpdateSchema = z.object({
  visible: z.boolean().optional(),
  orden: z.number().int().min(0).optional(),
  nombre: z.string().max(200).optional(),
  contenido: z.unknown().optional(),
  configuracion: z.unknown().optional(),
})

// ─── GD Radicado ───────────────────────────────────────────────────────────────

export const gdRadicadoCreateSchema = z.object({
  tipo: z.enum(["ENTRADA", "SALIDA", "INTERNO", "PQRS", "RESOLUCION", "COMUNICADO"]),
  medioRecepcion: z.enum(["PRESENCIAL", "CORREO", "WEB", "OFICIO", "EMAIL_ELECTRONICO", "FAX", "OTRO"]).optional(),
  asunto: z.string().min(5, "Asunto debe tener al menos 5 caracteres").max(1000),
  folios: z.number().int().min(0).optional().default(1),
  prioridad: z.enum(["BAJA", "NORMAL", "ALTA", "URGENTE"]).optional().default("NORMAL"),
  observacion: z.string().max(5000).optional(),
  dependenciaId: z.string().cuid("ID de dependencia inválido"),
  subserieId: z.string().cuid().optional().nullable(),
  tipoDocumentalId: z.string().cuid().optional().nullable(),
  tramitadorId: z.string().cuid("ID de tramitador inválido"),
  radicadoOrigen: z.string().max(100).optional(),
  remitentes: z.array(z.object({
    tipoPersona: z.enum(["CIUDADANO", "EMPRESA", "FUNCIONARIO", "ENTIDAD_PUBLICA", "ANONIMO"]).optional(),
    nombre: z.string().min(1).max(200),
    documento: z.string().max(30).optional().nullable(),
    email: z.string().email().optional().nullable(),
    telefono: z.string().max(20).optional().nullable(),
    direccion: z.string().max(300).optional().nullable(),
  })).optional(),
})

// ─── GD Expediente ─────────────────────────────────────────────────────────────

export const gdExpedienteCreateSchema = z.object({
  nombre: z.string().min(3, "Nombre del expediente obligatorio").max(300),
  descripcion: z.string().max(2000).optional(),
  dependenciaId: z.string().cuid("ID de dependencia inválido"),
  serieId: z.string().cuid().optional().nullable(),
  subserieId: z.string().cuid().optional().nullable(),
})

// ─── Noticias ──────────────────────────────────────────────────────────────────

export const noticiaCreateSchema = z.object({
  titulo: z.string().min(5, "Título debe tener mínimo 5 caracteres").max(300),
  contenido: z.string().min(20, "Contenido muy corto"),
  resumen: z.string().max(500).optional(),
  imagenUrl: z.string().url().optional(),
  publicado: z.boolean().optional().default(false),
  categoriaId: z.string().cuid().optional().nullable(),
  etiquetas: z.array(z.string()).optional(),
})

export const noticiaUpdateSchema = noticiaCreateSchema.partial()

// ─── Categoría Noticias ────────────────────────────────────────────────────────

export const categoriaNotiSchema = z.object({
  nombre: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).optional(),
  color: z.string().max(50).optional(),
})

// ─── Menú ──────────────────────────────────────────────────────────────────────

export const menuCreateSchema = z.object({
  nombre: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  url: z.string().max(500).optional(),
  orden: z.number().int().min(0).optional(),
  visible: z.boolean().optional().default(true),
  padreId: z.string().cuid().optional().nullable(),
  paginaId: z.string().cuid().optional().nullable(),
})

export const menuUpdateSchema = menuCreateSchema.partial()

// ─── Transparencia ─────────────────────────────────────────────────────────────

export const transparenciaCatSchema = z.object({
  nombre: z.string().min(2).max(300),
  slug: z.string().min(2).max(200).optional(),
  numero: z.number().int().optional(),
  descripcion: z.string().max(1000).optional(),
  icono: z.string().max(50).optional(),
  orden: z.number().int().optional(),
  esObligatoria: z.boolean().optional(),
})

export const transparenciaItemSchema = z.object({
  titulo: z.string().min(3).max(500),
  descripcion: z.string().max(2000).optional(),
  archivoUrl: z.string().url().optional(),
  enlaceExterno: z.string().url().optional(),
  tipo: z.string().max(50).optional(),
  orden: z.number().int().optional(),
  activo: z.boolean().optional().default(true),
  subcategoriaId: z.string().cuid().optional().nullable(),
  categoriaId: z.string().cuid().optional().nullable(),
})

export const transparenciaItemUpdateSchema = transparenciaItemSchema.partial()

// ─── PQRS Respuesta / Update ───────────────────────────────────────────────────

export const pqrsUpdateSchema = z.object({
  estado: z.string().max(50).optional(),
  prioridad: z.enum(["BAJA", "NORMAL", "ALTA", "URGENTE"]).optional(),
  asignadoId: z.string().cuid().optional().nullable(),
  observacionesInternas: z.string().max(5000).optional(),
})

export const pqrsRespuestaSchema = z.object({
  contenido: z.string().min(10, "La respuesta debe tener al menos 10 caracteres").max(10000),
  esOficial: z.boolean().optional().default(false),
  archivoUrl: z.string().url().optional(),
})

// ─── Documentos Admin ──────────────────────────────────────────────────────────

export const documentoCreateSchema = z.object({
  titulo: z.string().min(3).max(300),
  descripcion: z.string().max(2000).optional(),
  archivoUrl: z.string().url("URL archivo inválida"),
  tipo: z.string().max(50).optional(),
  categoriaId: z.string().cuid().optional().nullable(),
  activo: z.boolean().optional().default(true),
})

export const documentoUpdateSchema = documentoCreateSchema.partial()

// ─── Configuración ─────────────────────────────────────────────────────────────

export const configuracionSchema = z.object({
  clave: z.string().min(1).max(100),
  valor: z.unknown(),
  grupo: z.string().max(50).optional(),
  descripcion: z.string().max(500).optional(),
  esPublico: z.boolean().optional(),
})

// ─── MIPG ──────────────────────────────────────────────────────────────────────

export const mipgDimensionSchema = z.object({
  nombre: z.string().min(2).max(200),
  descripcion: z.string().max(2000).optional(),
  codigo: z.string().max(20).optional(),
  orden: z.number().int().optional(),
})

export const mipgPoliticaSchema = z.object({
  nombre: z.string().min(2).max(300),
  dimensionId: z.string().cuid("ID dimensión inválido"),
  descripcion: z.string().max(2000).optional(),
  codigo: z.string().max(20).optional(),
})

export const mipgIndicadorSchema = z.object({
  nombre: z.string().min(2).max(300),
  politicaId: z.string().cuid("ID política inválido"),
  meta: z.number().optional(),
  avance: z.number().optional(),
  observacion: z.string().max(5000).optional(),
})

export const mipgEvidenciaSchema = z.object({
  indicadorId: z.string().cuid("ID indicador inválido"),
  nombre: z.string().min(2).max(300),
  archivoUrl: z.string().url().optional(),
  descripcion: z.string().max(2000).optional(),
})

// ─── GD Radicado Update ────────────────────────────────────────────────────────

export const gdRadicadoUpdateSchema = z.object({
  estado: z.string().max(50).optional(),
  observacion: z.string().max(5000).optional(),
  prioridad: z.enum(["BAJA", "NORMAL", "ALTA", "URGENTE"]).optional(),
  asunto: z.string().max(1000).optional(),
  tramitadorId: z.string().cuid().optional(),
})

// ─── GD Documentos ─────────────────────────────────────────────────────────────

export const gdDocumentoSchema = z.object({
  nombre: z.string().min(1).max(300),
  archivoUrl: z.string().url("URL archivo inválida"),
  esPrincipal: z.boolean().optional().default(false),
  folios: z.number().int().min(0).optional().default(1),
  radicadoId: z.string().cuid("ID radicado inválido"),
})

// ─── GD VoBo ───────────────────────────────────────────────────────────────────

export const gdVoboSchema = z.object({
  radicadoId: z.string().cuid("ID radicado inválido"),
  estado: z.enum(["APROBADO", "RECHAZADO"]),
  observacion: z.string().max(5000).optional(),
})

// ─── Auth: Recuperar / Restablecer contraseña ──────────────────────────────────

export const recuperarContrasenaSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const restablecerContrasenaSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
})

// ─── Genérico: body con ID ─────────────────────────────────────────────────────

export const idBodySchema = z.object({
  id: z.string().cuid("ID inválido"),
})

// ─── GD API Keys ───────────────────────────────────────────────────────────────

export const gdApiKeySchema = z.object({
  nombre: z.string().min(2).max(100),
  permisos: z.array(z.string()).optional(),
  activo: z.boolean().optional().default(true),
})

// ─── GD Archivo Topográfico ────────────────────────────────────────────────────

export const gdCarpetaArchivoSchema = z.object({
  edificio: z.string().max(100).optional(),
  piso: z.string().max(100).optional(),
  bodega: z.string().max(100).optional(),
  estante: z.string().max(100).optional(),
  entrepano: z.string().max(100).optional(),
  caja: z.string().min(1, "Caja obligatoria").max(100),
  carpeta: z.string().min(1, "Carpeta obligatoria").max(100),
  titulo: z.string().min(1, "Título obligatorio").max(300),
  expedienteId: z.string().cuid().optional().nullable(),
})

export const gdPrestamoSchema = z.object({
  carpetaId: z.string().cuid("ID carpeta inválido"),
  solicitante: z.string().min(2).max(200),
  motivo: z.string().max(1000).optional(),
  fechaDevolucion: z.string().datetime().optional(),
})

// ─── GD Firmas ─────────────────────────────────────────────────────────────────

export const gdFirmaSchema = z.object({
  radicadoId: z.string().cuid("ID radicado inválido"),
  tipo: z.string().max(50).optional(),
  observacion: z.string().max(5000).optional(),
})

// ─── GD Festivos ───────────────────────────────────────────────────────────────

export const gdFestivoSchema = z.object({
  fecha: z.string().datetime("Fecha inválida"),
  nombre: z.string().min(2).max(200),
  anio: z.number().int().min(2020).max(2050),
  ley: z.string().max(200).optional(),
})

// ─── GD Plan / TRD ─────────────────────────────────────────────────────────────

export const gdPlanSchema = z.object({
  nombre: z.string().min(2).max(300),
  descripcion: z.string().max(2000).optional(),
  anio: z.number().int().optional(),
  estado: z.string().max(50).optional(),
})

export const gdTrdSchema = z.object({
  codigo: z.string().min(1).max(50),
  nombre: z.string().min(2).max(300),
  tipo: z.string().max(50).optional(),
  padreId: z.string().cuid().optional().nullable(),
  retencionGestion: z.number().int().optional(),
  retencionCentral: z.number().int().optional(),
  disposicionFinal: z.string().max(50).optional(),
})

// ─── GD Transferencias ─────────────────────────────────────────────────────────

export const gdTransferenciaSchema = z.object({
  tipo: z.string().max(50),
  dependenciaOrigenId: z.string().cuid("ID dependencia inválido"),
  observacion: z.string().max(5000).optional(),
  expedienteIds: z.array(z.string().cuid()).optional(),
})

// ─── GD Índice Expediente ──────────────────────────────────────────────────────

export const gdIndiceSchema = z.object({
  expedienteId: z.string().cuid("ID expediente inválido"),
  formato: z.enum(["PDF", "XLSX", "JSON"]).optional().default("PDF"),
})

// ─── GD Expediente Radicados ───────────────────────────────────────────────────

export const gdExpedienteRadicadoSchema = z.object({
  radicadoId: z.string().cuid("ID radicado inválido"),
  expedienteId: z.string().cuid("ID expediente inválido"),
})

// ─── Superadmin ────────────────────────────────────────────────────────────────

export const superadminAuthSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Contraseña mínimo 8 caracteres"),
})

export const superadminTenantSchema = z.object({
  nombre: z.string().min(2).max(200),
  dominio: z.string().min(3).max(200),
  plan: z.string().max(50).optional(),
  activo: z.boolean().optional().default(true),
  configuracion: z.unknown().optional(),
})

// Acepta el objeto ModulosConfig completo o parcial: cada clave es un id de
// módulo con al menos {activo: boolean} y campos extra opcionales (apiUrl,
// apiKey, storage, dependenciaReceptoraCodigo…).
export const superadminModuloSchema = z.record(
  z.string(),
  z.object({ activo: z.boolean() }).passthrough()
).refine((obj) => Object.keys(obj).length > 0, {
  message: "Debe incluir al menos un módulo",
})

// ─── MIPG Evaluación ───────────────────────────────────────────────────────────

export const mipgEvaluacionSchema = z.object({
  indicadorId: z.string().cuid("ID indicador inválido"),
  periodo: z.string().max(50).optional(),
  avance: z.number().min(0).max(100).optional(),
  observacion: z.string().max(5000).optional(),
})

// ─── GD Storage Test ───────────────────────────────────────────────────────────

export const gdStorageTestSchema = z.object({
  provider: z.enum(["local", "s3", "cloudflare"]).optional(),
  testData: z.string().max(1000).optional(),
})

// ─── Webhook Ventanilla ────────────────────────────────────────────────────────

export const webhookVentanillaSchema = z.object({
  evento: z.string().min(1).max(100),
  datos: z.unknown(),
  timestamp: z.string().datetime().optional(),
})

// ─── V1 API Pública Radicados ──────────────────────────────────────────────────

export const v1RadicadoPublicoSchema = z.object({
  tipo: z.string().min(1).max(50),
  asunto: z.string().min(3).max(1000),
  remitente: z.string().min(2).max(200),
  documento: z.string().max(30).optional(),
  email: z.string().email().optional(),
  telefono: z.string().max(20).optional(),
})

// ─── Utilidad de validación ────────────────────────────────────────────────────

import { NextResponse } from "next/server"

/**
 * Valida un body JSON contra un esquema Zod.
 * Retorna el dato parseado o una NextResponse de error 400.
 */
// ─── FRISCO — Bienes en extinción de dominio ──────────────────────────────────

const friscoTipoBien = z.enum([
  "INMUEBLE_URBANO", "INMUEBLE_RURAL", "VEHICULO", "SEMOVIENTE",
  "ESTABLECIMIENTO_COMERCIO", "EMBARCACION", "AERONAVE", "OBRA_ARTE",
  "TITULO_VALOR", "EMPRESA", "OTRO",
])

const friscoEstadoJuridico = z.enum(["EN_PROCESO", "CAUTELAR", "EXTINTO", "DEVUELTO"])
const friscoEstadoFisico   = z.enum(["BUENO", "REGULAR", "MALO", "PERDIDO", "DESTRUIDO", "SIN_VERIFICAR"])

export const friscoBienCreateSchema = z.object({
  codigo:         z.string().min(1).max(60),
  folioMatricula: z.string().max(60).optional().nullable(),
  placa:          z.string().max(20).optional().nullable(),
  tipo:           friscoTipoBien,
  estadoJuridico: friscoEstadoJuridico.optional(),
  estadoFisico:   friscoEstadoFisico.optional().nullable(),
  descripcion:    z.string().min(3).max(5000),
  ubicacion:      z.string().max(500).optional().nullable(),
  latitud:        z.number().min(-90).max(90).optional().nullable(),
  longitud:       z.number().min(-180).max(180).optional().nullable(),
  avaluoVigente:  z.number().nonnegative().optional().nullable(),
  monedaAvaluo:   z.string().max(8).optional().nullable(),
  fechaAvaluo:    z.string().datetime().optional().nullable(),
  numeroProceso:  z.string().max(80).optional().nullable(),
  juzgado:        z.string().max(200).optional().nullable(),
  expedienteId:   z.string().cuid().optional().nullable(),
  carpetaFisicaId:z.string().cuid().optional().nullable(),
  observaciones:  z.string().max(5000).optional().nullable(),
})

export const friscoBienUpdateSchema = friscoBienCreateSchema.partial()

const friscoTipoPersona  = z.enum(["NATURAL", "JURIDICA"])

export const friscoDepositarioCreateSchema = z.object({
  bienId:          z.string().cuid(),
  tipoPersona:     friscoTipoPersona,
  nombre:          z.string().min(2).max(200),
  documento:       z.string().min(3).max(30),
  email:           z.string().email().max(120).optional().nullable(),
  telefono:        z.string().max(30).optional().nullable(),
  direccion:       z.string().max(300).optional().nullable(),
  fechaAsignacion: z.string().datetime(),
  fechaFin:        z.string().datetime().optional().nullable(),
  activo:          z.boolean().optional(),
  polizaVigenteHasta: z.string().datetime().optional().nullable(),
  observaciones:   z.string().max(2000).optional().nullable(),
})

export const friscoDepositarioUpdateSchema = friscoDepositarioCreateSchema.partial().extend({
  ultimoReporte: z.string().datetime().optional().nullable(),
})

const friscoTipoContrato   = z.enum(["ARRENDAMIENTO", "ADMINISTRACION", "COMODATO", "OTRO"])
const friscoPeriodicidad   = z.enum(["MENSUAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"])
const friscoEstadoContrato = z.enum(["VIGENTE", "VENCIDO", "TERMINADO", "SUSPENDIDO"])

export const friscoContratoCreateSchema = z.object({
  bienId:               z.string().cuid(),
  numero:               z.string().min(1).max(60),
  tipo:                 friscoTipoContrato,
  contraparteNombre:    z.string().min(2).max(200),
  contraparteDocumento: z.string().min(3).max(30),
  contraparteEmail:     z.string().email().max(120).optional().nullable(),
  contraparteTelefono:  z.string().max(30).optional().nullable(),
  fechaInicio:          z.string().datetime(),
  fechaFin:             z.string().datetime().optional().nullable(),
  canon:                z.number().nonnegative().optional().nullable(),
  periodicidad:         friscoPeriodicidad.optional().nullable(),
  polizaNumero:         z.string().max(60).optional().nullable(),
  polizaVigenteHasta:   z.string().datetime().optional().nullable(),
  estado:               friscoEstadoContrato.optional(),
  observaciones:        z.string().max(2000).optional().nullable(),
})

export const friscoContratoUpdateSchema = friscoContratoCreateSchema.partial()

const friscoTipoDestinacion = z.enum([
  "VICTIMAS", "TRANSFERENCIA", "SUBASTA", "DONACION", "DESTRUCCION", "DEVOLUCION",
])

export const friscoDestinacionSchema = z.object({
  bienId:             z.string().cuid(),
  tipo:               friscoTipoDestinacion,
  fecha:              z.string().datetime(),
  beneficiario:       z.string().max(200).optional().nullable(),
  valorRealizacion:   z.number().nonnegative().optional().nullable(),
  actoAdministrativo: z.string().max(200).optional().nullable(),
  observaciones:      z.string().max(2000).optional().nullable(),
})

// ─── Contabilidad pública (CGN) ───────────────────────────────────────────────

const cpNaturaleza = z.enum(["DEBITO", "CREDITO"])
const cpTipoCuenta = z.enum(["BALANCE", "RESULTADO", "ORDEN"])
const cpTipoComprobante = z.enum(["CONTABLE", "EGRESO", "INGRESO", "AJUSTE", "APERTURA", "CIERRE"])
const cpTipoDocumento = z.enum(["NIT", "CC", "CE", "PA", "OTRO"])
const cpEstadoPeriodo = z.enum(["ABIERTO", "CERRADO", "AJUSTE"])

export const cpCuentaCreateSchema = z.object({
  codigo: z.string().min(1).max(20),
  nombre: z.string().min(2).max(200),
  nivel: z.number().int().min(1).max(6),
  naturaleza: cpNaturaleza,
  tipo: cpTipoCuenta,
  parentId: z.string().cuid().optional().nullable(),
  permiteMovimientos: z.boolean().optional(),
  activa: z.boolean().optional(),
})

export const cpCuentaUpdateSchema = cpCuentaCreateSchema.partial()

export const cpPeriodoCreateSchema = z.object({
  codigo: z.string().min(1).max(20),
  anio: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12).optional().nullable(),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
})

export const cpPeriodoUpdateSchema = z.object({
  estado: cpEstadoPeriodo,
})

export const cpTerceroCreateSchema = z.object({
  documento: z.string().min(3).max(30),
  tipoDocumento: cpTipoDocumento,
  razonSocial: z.string().min(2).max(200),
  email: z.string().email().max(120).optional().nullable(),
  telefono: z.string().max(30).optional().nullable(),
  direccion: z.string().max(300).optional().nullable(),
  ciudad: z.string().max(120).optional().nullable(),
  activo: z.boolean().optional(),
})

export const cpTerceroUpdateSchema = cpTerceroCreateSchema.partial()

export const cpAsientoSchema = z.object({
  cuentaId: z.string().cuid(),
  terceroId: z.string().cuid().optional().nullable(),
  debito: z.number().nonnegative().default(0),
  credito: z.number().nonnegative().default(0),
  descripcion: z.string().max(500).optional().nullable(),
}).refine(a => (a.debito > 0) !== (a.credito > 0), {
  message: "Cada asiento debe tener débito O crédito (no ambos ni ninguno)",
})

export const cpComprobanteCreateSchema = z.object({
  numero: z.string().min(1).max(40),
  tipo: cpTipoComprobante,
  fecha: z.string().datetime(),
  descripcion: z.string().min(3).max(2000),
  periodoId: z.string().cuid(),
  fuenteModulo: z.string().max(60).optional().nullable(),
  fuenteRef: z.string().max(120).optional().nullable(),
  asientos: z.array(cpAsientoSchema).min(2, "Un comprobante requiere al menos 2 asientos"),
}).refine(c => {
  const td = c.asientos.reduce((s, a) => s + a.debito, 0)
  const tc = c.asientos.reduce((s, a) => s + a.credito, 0)
  return Math.abs(td - tc) < 0.005
}, { message: "El total de débitos debe igualar el total de créditos (partida doble)" })

// ─── Presupuesto público — ejecución (CDP/RP/Obligación/Pago) ────────────────

const psuTipoRubro = z.enum(["GASTO", "INGRESO"])
const psuMedioPago = z.enum(["TRANSFERENCIA", "CHEQUE", "EFECTIVO", "OTRO"])

export const psuRubroCreateSchema = z.object({
  codigo: z.string().min(1).max(60),
  nombre: z.string().min(2).max(300),
  tipo: psuTipoRubro,
  nivel: z.number().int().min(1).max(10),
  fuente: z.string().max(80).optional().nullable(),
  programa: z.string().max(120).optional().nullable(),
  proyecto: z.string().max(120).optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  permiteMovimientos: z.boolean().optional(),
  activa: z.boolean().optional(),
})

export const psuApropiacionCreateSchema = z.object({
  rubroId: z.string().cuid(),
  vigencia: z.number().int().min(2000).max(2100),
  apropiacionInicial: z.number().nonnegative(),
  adiciones: z.number().nonnegative().optional(),
  reducciones: z.number().nonnegative().optional(),
})

export const psuApropiacionUpdateSchema = psuApropiacionCreateSchema.partial().omit({ rubroId: true, vigencia: true })

export const psuCdpCreateSchema = z.object({
  numero: z.string().min(1).max(40),
  fecha: z.string().datetime(),
  vigencia: z.number().int().min(2000).max(2100),
  rubroId: z.string().cuid(),
  valor: z.number().positive(),
  objeto: z.string().min(3).max(2000),
})

export const psuRpCreateSchema = z.object({
  numero: z.string().min(1).max(40),
  fecha: z.string().datetime(),
  cdpId: z.string().cuid(),
  terceroId: z.string().cuid().optional().nullable(),
  valor: z.number().positive(),
  objeto: z.string().min(3).max(2000),
})

export const psuObligacionCreateSchema = z.object({
  numero: z.string().min(1).max(40),
  fecha: z.string().datetime(),
  rpId: z.string().cuid(),
  valor: z.number().positive(),
  concepto: z.string().min(3).max(2000),
})

export const psuPagoCreateSchema = z.object({
  numero: z.string().min(1).max(40),
  fecha: z.string().datetime(),
  obligacionId: z.string().cuid(),
  valor: z.number().positive(),
  medioPago: psuMedioPago,
  referencia: z.string().max(120).optional().nullable(),
  cuentaBancoId: z.string().cuid().optional().nullable(),       // cuenta del PUC (banco/caja)
  cuentaGastoId: z.string().cuid().optional().nullable(),       // cuenta del PUC (gasto) — opcional, infiere si no se pasa
  generarComprobante: z.boolean().optional(),                   // default true
})

// ─── Nómina pública ───────────────────────────────────────────────────────────

const nomTipoVinculacion = z.enum(["PLANTA", "TRABAJADOR_OFICIAL", "CONTRATISTA", "SUPERNUMERARIO", "APRENDIZ"])

export const nomEmpleadoCreateSchema = z.object({
  documento: z.string().min(3).max(30),
  tipoDocumento: z.enum(["CC", "CE", "PA", "NIT", "TI"]),
  primerNombre: z.string().min(1).max(60),
  segundoNombre: z.string().max(60).optional().nullable(),
  primerApellido: z.string().min(1).max(60),
  segundoApellido: z.string().max(60).optional().nullable(),
  email: z.string().email().optional().nullable(),
  telefono: z.string().max(30).optional().nullable(),
  cargo: z.string().min(1).max(120),
  dependencia: z.string().max(120).optional().nullable(),
  tipoVinculacion: nomTipoVinculacion,
  fechaIngreso: z.string().datetime(),
  salarioBasico: z.number().positive(),
  cuentaBanco: z.string().max(30).optional().nullable(),
  bancoNombre: z.string().max(80).optional().nullable(),
  tipoCuenta: z.enum(["AHORROS", "CORRIENTE"]).optional().nullable(),
  eps: z.string().max(80).optional().nullable(),
  afp: z.string().max(80).optional().nullable(),
  arl: z.string().max(80).optional().nullable(),
  cajaCompensacion: z.string().max(80).optional().nullable(),
  retencionFuenteAplica: z.boolean().optional(),
})

export const nomEmpleadoUpdateSchema = nomEmpleadoCreateSchema.partial().extend({
  activo: z.boolean().optional(),
  fechaRetiro: z.string().datetime().optional().nullable(),
})

export const nomPeriodoCreateSchema = z.object({
  anio: z.number().int().min(2000).max(2100),
  mes: z.number().int().min(1).max(12),
})

export const nomNovedadCreateSchema = z.object({
  empleadoId: z.string().cuid(),
  tipo: z.enum(["VACACIONES", "LICENCIA_REMUNERADA", "LICENCIA_NO_REMUNERADA", "INCAPACIDAD_EPS", "INCAPACIDAD_ARL", "AUSENCIA", "COMISION_SERVICIOS", "PERMISO"]),
  fechaInicio: z.string().datetime(),
  fechaFin: z.string().datetime(),
  dias: z.number().int().positive(),
  observacion: z.string().max(500).optional().nullable(),
  valor: z.number().nonnegative().optional().nullable(),
})

export const nomLiquidarPeriodoSchema = z.object({
  periodoId: z.string().cuid(),
  diasLiquidados: z.number().int().min(1).max(31).optional(),
})

export const rcGenerarSchema = z.object({
  tipo: z.enum(["CHIP_BALANCE", "CHIP_ACTIVIDAD", "FUT_INGRESOS", "FUT_GASTOS", "LEY_617"]),
  periodoContableId: z.string().cuid().optional(),
  vigencia: z.number().int().min(2000).max(2100).optional(),
  icldManual: z.number().nonnegative().optional(),
  topeCategoria: z.number().min(0.001).max(0.5).optional(),
  observacion: z.string().max(500).optional(),
})

export const nomPagarPeriodoSchema = z.object({
  periodoId: z.string().cuid(),
  fecha: z.string().datetime(),
  numero: z.string().min(1).max(60),
  cuentaBancoId: z.string().cuid(),
  cuentaSueldosPorPagarCodigo: z.string().max(20).optional(),    // default: 2505
})

// ──────────────────────────────────────────────────────────────────────────────

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors = result.error.issues.map((e: z.ZodIssue) => ({
    campo: e.path.join("."),
    mensaje: e.message,
  }))
  return {
    success: false,
    response: NextResponse.json(
      { error: "Datos de entrada inválidos", errores: errors },
      { status: 400 }
    ),
  }
}
