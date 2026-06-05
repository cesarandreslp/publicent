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

export const psuAnularSchema = z.object({
  motivoAnulacion: z.string().min(10, "El motivo debe tener al menos 10 caracteres").max(500),
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
  // Códigos PILA (UGPP)
  codigoEPS: z.string().max(20).optional().nullable(),
  codigoAFP: z.string().max(20).optional().nullable(),
  codigoARL: z.string().max(20).optional().nullable(),
  codigoCajaComp: z.string().max(20).optional().nullable(),
  claseRiesgoARL: z.number().int().min(1).max(5).optional().nullable(),
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

export const nomPagarPasivoSchema = z.object({
  periodoId: z.string().cuid(),
  cuentaCodigo: z.string().min(1).max(20),
  tercero: z.string().min(1).max(200),
  terceroNit: z.string().max(30).optional().nullable(),
  valor: z.number().positive(),
  fecha: z.string().datetime(),
  cuentaBancoId: z.string().cuid(),
  numero: z.string().min(1).max(60),
  observacion: z.string().max(500).optional().nullable(),
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

// ─── Activos Bienes ────────────────────────────────────────────────────────────

const ACTIVO_CATEGORIA = ['MUEBLE_ENSERE','EQUIPO_COMPUTO','EQUIPO_COMUNICACION','EQUIPO_AUDIOVISUAL','MAQUINARIA_EQUIPO','VEHICULO','INMUEBLE','SEMOVIENTE','INTANGIBLE','OTRO'] as const
const ACTIVO_ESTADO    = ['EN_SERVICIO','EN_MANTENIMIENTO','EN_BODEGA','DADO_DE_BAJA','EXTRAVIADO'] as const
const ACTIVO_TIPO_MNT  = ['PREVENTIVO','CORRECTIVO','GARANTIA'] as const
const ACTIVO_TIPO_MOV  = ['INGRESO','ASIGNACION','TRASLADO','DEVOLUCION','BAJA','REINTEGRO'] as const

export const activoBienCreateSchema = z.object({
  codigo:            z.string().min(1).max(80),
  nombre:            z.string().min(2).max(300),
  descripcion:       z.string().max(1000).optional(),
  categoria:         z.enum(ACTIVO_CATEGORIA),
  tipo:              z.string().max(100).optional(),
  marca:             z.string().max(100).optional(),
  modelo:            z.string().max(100).optional(),
  serial:            z.string().max(100).optional(),
  color:             z.string().max(50).optional(),
  valorAdquisicion:  z.number().nonnegative().optional(),
  fechaAdquisicion:  z.string().datetime().optional(),
  vidaUtilAnios:     z.number().int().positive().optional(),
  dependenciaId:     z.string().cuid().optional(),
  dependenciaNombre: z.string().max(300).optional(),
  responsableId:     z.string().cuid().optional(),
  responsableNombre: z.string().max(300).optional(),
  ubicacion:         z.string().max(500).optional(),
  estado:            z.enum(ACTIVO_ESTADO).optional(),
  imagenUrl:         z.string().url().optional(),
  observaciones:     z.string().max(2000).optional(),
})

export const activoBienUpdateSchema = activoBienCreateSchema.partial()

export const activoAsignacionSchema = z.object({
  activoId:          z.string().cuid(),
  funcionarioId:     z.string().cuid().optional(),
  funcionarioNombre: z.string().min(2).max(300),
  dependenciaNombre: z.string().max(300).optional(),
  fechaInicio:       z.string().datetime(),
  fechaFin:          z.string().datetime().optional(),
  actaNumero:        z.string().max(80).optional(),
  observacion:       z.string().max(1000).optional(),
})

export const activoMantenimientoSchema = z.object({
  activoId:             z.string().cuid(),
  tipo:                 z.enum(ACTIVO_TIPO_MNT),
  fecha:                z.string().datetime(),
  descripcion:          z.string().min(5).max(2000),
  proveedor:            z.string().max(300).optional(),
  costo:                z.number().nonnegative().optional(),
  proximoMantenimiento: z.string().datetime().optional(),
})

export const activoMovimientoSchema = z.object({
  activoId:           z.string().cuid(),
  tipo:               z.enum(ACTIVO_TIPO_MOV),
  fecha:              z.string().datetime(),
  descripcion:        z.string().min(3).max(2000),
  origenDependencia:  z.string().max(300).optional(),
  destinoDependencia: z.string().max(300).optional(),
  actaNumero:         z.string().max(80).optional(),
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


// ─── TESORERÍA ─────────────────────────────────────────────────────────────────

export const tesoCuentaCreateSchema = z.object({
  nombre:              z.string().min(2).max(200),
  banco:               z.string().min(2).max(200),
  nitBanco:            z.string().max(20).optional().nullable(),
  numeroCuenta:        z.string().min(3).max(60),
  tipo:                z.enum(['CORRIENTE','AHORROS','INVERSION_TEMPORAL','FONDOS_ESPECIALES']).optional(),
  moneda:              z.string().max(5).optional(),
  descripcion:         z.string().max(500).optional().nullable(),
  cuentaContableCodigo: z.string().max(20).optional().nullable(),
  activa:              z.boolean().optional(),
})

export const tesoCuentaUpdateSchema = tesoCuentaCreateSchema.partial()

export const tesoMovimientoCreateSchema = z.object({
  cuentaId:     z.string().cuid(),
  tipo:         z.enum(['INGRESO','EGRESO']),
  fecha:        z.string().datetime(),
  valor:        z.number().positive(),
  descripcion:  z.string().min(2).max(500),
  numero:       z.string().max(60).optional().nullable(),
  tercero:      z.string().max(300).optional().nullable(),
  terceroNit:   z.string().max(20).optional().nullable(),
  comprobanteId: z.string().optional().nullable(),
  pagoPresupId:  z.string().optional().nullable(),
  creadoPor:     z.string().max(200).optional().nullable(),
})

export const tesoExtractoCreateSchema = z.object({
  cuentaId:     z.string().cuid(),
  periodo:      z.string().regex(/^\d{4}-\d{2}$/, 'Formato YYYY-MM'),
  saldoInicial: z.number(),
  saldoFinal:   z.number(),
  observacion:  z.string().max(500).optional().nullable(),
  lineas: z.array(z.object({
    fecha:        z.string().datetime(),
    descripcion:  z.string().min(1).max(500),
    referencia:   z.string().max(100).optional().nullable(),
    debito:       z.number().nonnegative().optional().nullable(),
    credito:      z.number().nonnegative().optional().nullable(),
    saldo:        z.number().optional().nullable(),
  })).min(1, 'El extracto debe tener al menos una línea'),
})

export const tesoConciliarSchema = z.object({
  movimientoId:    z.string().cuid(),
  extractoLineaId: z.string().cuid(),
})

export const tesoConciliarMultipleSchema = z.object({
  movimientoId:     z.string().cuid(),
  extractoLineaIds: z.array(z.string().cuid()).min(2, 'Seleccione al menos 2 líneas de extracto'),
})


// ─── CONTRATACIÓN ──────────────────────────────────────────────────────────────

export const conProcesoCreateSchema = z.object({
  numero:           z.string().min(1).max(60),
  modalidad:        z.enum(['LICITACION_PUBLICA','SELECCION_ABREVIADA','CONCURSO_MERITOS','CONTRATACION_DIRECTA','MINIMA_CUANTIA','ASOCIACION_PUBLICO_PRIVADA']),
  objeto:           z.string().min(5).max(2000),
  vigencia:         z.number().int().min(2000).max(2100),
  valorEstimado:    z.number().positive(),
  cdpId:            z.string().optional().nullable(),
  cdpNumero:        z.string().max(60).optional().nullable(),
  rubroNombre:      z.string().max(300).optional().nullable(),
  fechaAviso:       z.string().datetime().optional().nullable(),
  fechaCierre:      z.string().datetime().optional().nullable(),
  fechaAdjudicacion: z.string().datetime().optional().nullable(),
  supervisorNombre: z.string().max(200).optional().nullable(),
  supervisorCargo:  z.string().max(200).optional().nullable(),
  dependencia:      z.string().max(200).optional().nullable(),
})

export const conProcesoUpdateSchema = conProcesoCreateSchema.partial().extend({
  estado: z.enum(['PLANEACION','CONVOCATORIA','EVALUACION','ADJUDICADO','CONTRATADO','LIQUIDADO','DESIERTO','REVOCADO']).optional(),
})

export const conContratoCreateSchema = z.object({
  procesoId:           z.string().cuid(),
  numero:              z.string().min(1).max(60),
  tipo:                z.enum(['PRESTACION_SERVICIOS','COMPRAVENTA','SUMINISTRO','OBRA_PUBLICA','CONSULTORIA','INTERADMINISTRATIVO','CONCESION','ARRENDAMIENTO','COMODATO','CONVENIO','OTRO']),
  contratistaNombre:   z.string().min(2).max(300),
  contratistaDoc:      z.string().min(3).max(30),
  contratistaEmail:    z.string().email().optional().nullable(),
  contratistaTelefono: z.string().max(20).optional().nullable(),
  valorContrato:       z.number().positive(),
  plazoMeses:          z.number().int().positive().optional().nullable(),
  fechaSuscripcion:    z.string().datetime(),
  fechaInicio:         z.string().datetime().optional().nullable(),
  fechaTerminacion:    z.string().datetime().optional().nullable(),
  rpId:                z.string().optional().nullable(),
  rpNumero:            z.string().max(60).optional().nullable(),
  supervisorNombre:    z.string().max(200).optional().nullable(),
  observacion:         z.string().max(2000).optional().nullable(),
})

export const conContratoUpdateSchema = conContratoCreateSchema.partial().omit({ procesoId: true }).extend({
  estado: z.enum(['SUSCRITO','EN_EJECUCION','SUSPENDIDO','TERMINADO','LIQUIDADO','INCUMPLIDO']).optional(),
  fechaLiquidacion: z.string().datetime().optional().nullable(),
  valorAdiciones: z.number().nonnegative().optional(),
})

export const conAdicionCreateSchema = z.object({
  contratoId:    z.string().cuid(),
  tipo:          z.enum(['ADICION_VALOR','PROROGA','ADICION_VALOR_Y_PROROGA','SUSPENSION','REINICIO']),
  numero:        z.string().min(1).max(20),
  valor:         z.number().positive().optional().nullable(),
  plazoMeses:    z.number().int().positive().optional().nullable(),
  fecha:         z.string().datetime(),
  justificacion: z.string().min(5).max(2000),
})

export const conDocumentoCreateSchema = z.object({
  procesoId:   z.string().cuid().optional().nullable(),
  contratoId:  z.string().cuid().optional().nullable(),
  tipo:        z.enum(['ESTUDIO_PREVIO','AVISO_CONVOCATORIA','PLIEGO_CONDICIONES','ADENDA','PROPUESTA_OFERENTE','INFORME_EVALUACION','ACTO_ADJUDICACION','CONTRATO','POLIZA','ACTA_INICIO','INFORME_SUPERVISION','ACTA_SUSPENSION','ACTA_REINICIO','ACTA_TERMINACION','ACTA_LIQUIDACION','OTRO']),
  nombre:      z.string().min(2).max(300),
  url:         z.string().url().optional().nullable(),
  fechaDoc:    z.string().datetime().optional().nullable(),
  observacion: z.string().max(500).optional().nullable(),
}).refine(d => d.procesoId || d.contratoId, { message: 'Debe indicar procesoId o contratoId' })
// ─── Almacén ───────────────────────────────────────────────────────────────────

const ALM_CATEGORIA    = ['PAPELERIA_UTILES','ASEO_CAFETERIA','TONER_INSUMOS_TIC','HERRAMIENTAS','MEDICAMENTOS','COMBUSTIBLE','MATERIALES_OBRA','OTRO'] as const
const ALM_TIPO_ENTRADA = ['COMPRA','DONACION','REINTEGRO','AJUSTE_POSITIVO'] as const

export const almArticuloCreateSchema = z.object({
  codigo:          z.string().min(1).max(80),
  nombre:          z.string().min(2).max(300),
  descripcion:     z.string().max(1000).optional(),
  unidad:          z.string().min(1).max(50),
  categoria:       z.enum(ALM_CATEGORIA),
  marca:           z.string().max(100).optional(),
  stockMinimo:     z.number().int().nonnegative().optional(),
  ubicacionBodega: z.string().max(200).optional(),
  imagenUrl:       z.string().url().optional(),
})

export const almArticuloUpdateSchema = almArticuloCreateSchema.partial().extend({
  activo: z.boolean().optional(),
})

export const almEntradaSchema = z.object({
  articuloId:        z.string().cuid(),
  tipo:              z.enum(ALM_TIPO_ENTRADA),
  cantidad:          z.number().int().positive(),
  valorUnitario:     z.number().nonnegative().optional(),
  fechaEntrada:      z.string().datetime(),
  ordenCompraNumero: z.string().max(80).optional(),
  facturaNumero:     z.string().max(80).optional(),
  proveedor:         z.string().max(300).optional(),
  observacion:       z.string().max(1000).optional(),
})

export const almSalidaSchema = z.object({
  articuloId:        z.string().cuid(),
  cantidad:          z.number().int().positive(),
  fechaSalida:       z.string().datetime(),
  dependenciaNombre: z.string().max(300).optional(),
  funcionarioNombre: z.string().max(300).optional(),
  actaNumero:        z.string().max(80).optional(),
  observacion:       z.string().max(1000).optional(),
})
// ─── Observatorio ──────────────────────────────────────────────────────────────

const OBS_CATEGORIA    = ['GESTION_INTERNA','ATENCION_CIUDADANA','FINANCIERO','CONTRATACION','GESTION_DOCUMENTAL','TALENTO_HUMANO','MIPG','OTRO'] as const
const OBS_PERIODICIDAD = ['DIARIA','SEMANAL','MENSUAL','TRIMESTRAL','SEMESTRAL','ANUAL'] as const
const OBS_META_TIPO    = ['MAYOR_ES_MEJOR','MENOR_ES_MEJOR','EXACTO'] as const

export const obsIndicadorCreateSchema = z.object({
  codigo:            z.string().min(1).max(40),
  nombre:            z.string().min(3).max(300),
  descripcion:       z.string().max(2000).optional(),
  unidad:            z.string().min(1).max(30),
  categoria:         z.enum(OBS_CATEGORIA),
  periodicidad:      z.enum(OBS_PERIODICIDAD),
  meta:              z.number(),
  metaTipo:          z.enum(OBS_META_TIPO).optional(),
  dependenciaNombre: z.string().max(300).optional(),
  responsableNombre: z.string().max(300).optional(),
  publicado:         z.boolean().optional(),
  orden:             z.number().int().optional(),
})

export const obsIndicadorUpdateSchema = obsIndicadorCreateSchema.partial()

export const obsMedicionSchema = z.object({
  indicadorId: z.string().cuid(),
  valor:       z.number(),
  fecha:       z.string().datetime(),
  periodo:     z.string().min(1).max(20),
  fuente:      z.string().max(300).optional(),
  observacion: z.string().max(1000).optional(),
})
// ─── Rentas locales ────────────────────────────────────────────────────────────

const REN_TIPO_CONCEPTO   = ['PREDIAL_UNIFICADO','INDUSTRIA_COMERCIO','SOBRETASA_GASOLINA','ESTAMPILLA','DELINEACION_URBANA','AVISOS_TABLEROS','PLUSVALIA','ALUMBRADO_PUBLICO','OTRO'] as const
const REN_PERIODICIDAD    = ['ANUAL','SEMESTRAL','TRIMESTRAL','MENSUAL','UNICA'] as const
const REN_ESTADO_LIQ      = ['PENDIENTE','PARCIAL','PAGADA','VENCIDA','EN_ACUERDO_PAGO','ANULADA'] as const
const REN_MEDIO_PAGO      = ['EFECTIVO','TRANSFERENCIA','PSE','CHEQUE','DATAFONO','OTRO'] as const

export const renConceptoCreateSchema = z.object({
  codigo:       z.string().min(1).max(40),
  nombre:       z.string().min(2).max(300),
  descripcion:  z.string().max(1000).optional(),
  tipo:         z.enum(REN_TIPO_CONCEPTO),
  periodicidad: z.enum(REN_PERIODICIDAD),
  tasaBase:     z.number().nonnegative().optional(),
  activo:       z.boolean().optional(),
})

export const renConceptoUpdateSchema = renConceptoCreateSchema.partial()

export const renContribuyenteCreateSchema = z.object({
  documento:   z.string().min(3).max(30),
  tipoDoc:     z.enum(['CC','NIT','CE','PASAPORTE']).optional(),
  nombre:      z.string().min(2).max(300),
  razonSocial: z.string().max(300).optional(),
  direccion:   z.string().max(500).optional(),
  telefono:    z.string().max(20).optional(),
  email:       z.string().email().optional(),
})

export const renContribuyenteUpdateSchema = renContribuyenteCreateSchema.partial().extend({
  activo: z.boolean().optional(),
})

export const renLiquidacionCreateSchema = z.object({
  numero:          z.string().min(1).max(60),
  conceptoId:      z.string().cuid(),
  contribuyenteId: z.string().cuid(),
  vigencia:        z.number().int().min(2000).max(2100),
  periodo:         z.string().max(20).optional(),
  baseGravable:    z.number().nonnegative(),
  tarifa:          z.number().nonnegative(),
  intereses:       z.number().nonnegative().optional(),
  descuentos:      z.number().nonnegative().optional(),
  fechaVencimiento: z.string().datetime().optional(),
  observacion:     z.string().max(1000).optional(),
})

export const renLiquidacionUpdateSchema = renLiquidacionCreateSchema.partial().extend({
  estado: z.enum(REN_ESTADO_LIQ).optional(),
})

export const renPagoSchema = z.object({
  liquidacionId: z.string().cuid(),
  valor:         z.number().positive(),
  fecha:         z.string().datetime(),
  medioPago:     z.enum(REN_MEDIO_PAGO),
  referencia:    z.string().max(100).optional(),
  observacion:   z.string().max(500).optional(),
})
// --- Chat IA Ciudadano --------------------------------------------------------

export const chatMensajeSchema = z.object({
  rol:   z.enum(['user', 'assistant']),
  texto: z.string().max(2000),
})

export const chatPreguntaSchema = z.object({
  pregunta:  z.string().min(1).max(500),
  historial: z.array(chatMensajeSchema).max(10).default([]),
  sessionId: z.string().uuid(),
})

// ─── FUNCIÓN DISCIPLINARIA ──────────────────────────────────────────────────────

const DISC_TIPO_PROCESO = ["DISCIPLINARIO_ORDINARIO", "DISCIPLINARIO_VERBAL", "QUEJA_CIUDADANA", "DERECHO_PETICION_INTERNO"] as const
const DISC_CALIFICACION = ["GRAVISIMA", "GRAVE", "LEVE"] as const
const DISC_SANCION = ["DESTITUCION_INHABILIDAD", "SUSPENSION_INHABILIDAD", "SUSPENSION", "MULTA", "AMONESTACION_ESCRITA", "ARCHIVO"] as const
const DISC_ESTADO_PROCESO = ["INDAGACION_PRELIMINAR", "INVESTIGACION_DISCIPLINARIA", "PLIEGO_DE_CARGOS", "DESCARGOS", "PERIODO_PRUEBAS", "ALEGATOS", "FALLO_PRIMERA_INSTANCIA", "RECURSO_APELACION", "FALLO_SEGUNDA_INSTANCIA", "EJECUTORIADO", "ARCHIVADO"] as const
const DISC_ESTADO_TUTELA = ["RECIBIDA", "EN_TRAMITE", "FALLADA", "IMPUGNADA", "EJECUTORIADA", "EN_CUMPLIMIENTO", "CUMPLIDA", "CERRADA"] as const

export const discProcesoCreateSchema = z.object({
  tipo:                z.enum(DISC_TIPO_PROCESO),
  quejoso:             z.string().max(300).optional().nullable(),
  anonima:             z.boolean().optional().default(false),
  disciplinadoNombre:  z.string().min(2).max(300),
  disciplinadoCargo:   z.string().min(2).max(300),
  disciplinadoEntidad: z.string().min(2).max(300),
  hechos:              z.string().min(10).max(8000),
  normaInfringida:     z.string().max(500).optional().nullable(),
  calificacionFalta:   z.enum(DISC_CALIFICACION).optional().nullable(),
  fechaQueja:          z.string().datetime(),
  instructorId:        z.string().cuid().optional().nullable(),
  expedienteGdId:      z.string().cuid().optional().nullable(),
})

export const discProcesoUpdateSchema = z.object({
  quejoso:             z.string().max(300).optional().nullable(),
  disciplinadoNombre:  z.string().min(2).max(300).optional(),
  disciplinadoCargo:   z.string().min(2).max(300).optional(),
  disciplinadoEntidad: z.string().min(2).max(300).optional(),
  hechos:              z.string().min(10).max(8000).optional(),
  normaInfringida:     z.string().max(500).optional().nullable(),
  calificacionFalta:   z.enum(DISC_CALIFICACION).optional().nullable(),
  sancion:             z.enum(DISC_SANCION).optional().nullable(),
  sancionDetalle:      z.string().max(2000).optional().nullable(),
  instructorId:        z.string().cuid().optional().nullable(),
  expedienteGdId:      z.string().cuid().optional().nullable(),
})

export const discAvanzarSchema = z.object({
  nuevoEstado:  z.enum(DISC_ESTADO_PROCESO),
  motivoAvance: z.string().max(2000).optional(),
})

export const discActuacionSchema = z.object({
  tipo:        z.string().min(2).max(100),
  descripcion: z.string().min(2).max(4000),
  fecha:       z.string().datetime().optional(),
})

export const discDocumentoSchema = z.object({
  nombre:  z.string().min(2).max(300),
  tipo:    z.string().min(2).max(50),
  url:     z.string().url().optional().nullable(),
  gdDocId: z.string().cuid().optional().nullable(),
})

export const discTutelaCreateSchema = z.object({
  accionante:       z.string().min(2).max(300),
  accionado:        z.string().min(2).max(300),
  derechoVulnerado: z.string().min(2).max(500),
  juzgado:          z.string().max(300).optional().nullable(),
  fechaRecepcion:   z.string().datetime(),
  fechaVencimiento: z.string().datetime().optional().nullable(),
  procesoId:        z.string().cuid().optional().nullable(),
  funcionarioId:    z.string().cuid().optional().nullable(),
  observaciones:    z.string().max(2000).optional().nullable(),
})

export const discTutelaUpdateSchema = z.object({
  estado:             z.enum(DISC_ESTADO_TUTELA).optional(),
  juzgado:            z.string().max(300).optional().nullable(),
  fechaVencimiento:   z.string().datetime().optional().nullable(),
  fechaFallo:         z.string().datetime().optional().nullable(),
  falloSentido:       z.string().max(50).optional().nullable(),
  impugnada:          z.boolean().optional(),
  fechaImpugnacion:   z.string().datetime().optional().nullable(),
  estadoCumplimiento: z.string().max(50).optional().nullable(),
  observaciones:      z.string().max(2000).optional().nullable(),
  funcionarioId:      z.string().cuid().optional().nullable(),
})

export const discVisitaCreateSchema = z.object({
  entidadVisitada:   z.string().min(2).max(300),
  dependencia:       z.string().max(300).optional().nullable(),
  fecha:             z.string().datetime(),
  objetivo:          z.string().min(2).max(2000),
  hallazgos:         z.string().min(2).max(8000),
  recomendaciones:   z.string().max(8000).optional().nullable(),
  compromisos:       z.string().max(8000).optional().nullable(),
  fechaSeguimiento:  z.string().datetime().optional().nullable(),
  funcionarioId:     z.string().cuid().optional().nullable(),
})

export const discVisitaUpdateSchema = discVisitaCreateSchema.partial().extend({
  estadoSeguimiento: z.string().max(50).optional().nullable(),
})
