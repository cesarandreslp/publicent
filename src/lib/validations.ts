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

export const superadminModuloSchema = z.object({
  modulos: z.array(z.object({
    nombre: z.string(),
    activo: z.boolean(),
  })),
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
