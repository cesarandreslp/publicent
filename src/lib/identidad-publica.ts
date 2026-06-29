import { getTenantPrisma, getTenantInfo } from './tenant'

/**
 * Datos de la identidad institucional para uso en páginas públicas
 * (legales, footer, headers, mails). Devuelve null si no hay registro.
 */
export type IdentidadPublica = {
  nombreCompleto: string
  nombreCorto: string
  direccionPrincipal: string | null
  ciudadDepto: string | null
  telefonoConmutador: string | null
  emailContacto: string | null
  emailPqrsd: string | null
  emailNotificaciones: string | null
  emailAccesibilidad: string | null
  emailFromName: string | null
  emailFromAddress: string | null
  nit: string | null
}

const FALLBACK: IdentidadPublica = {
  nombreCompleto: 'Entidad Pública',
  nombreCorto: 'Entidad',
  direccionPrincipal: null,
  ciudadDepto: null,
  telefonoConmutador: null,
  emailContacto: null,
  emailPqrsd: null,
  emailNotificaciones: null,
  emailAccesibilidad: null,
  emailFromName: null,
  emailFromAddress: null,
  nit: null,
}

/**
 * Nombre del tenant activo tomado del meta-tenant. Sirve como fallback del nombre
 * legal cuando el registro de identidadInstitucional aún no existe, para que header,
 * PQRSD y páginas legales muestren SIEMPRE el mismo nombre de la entidad activa
 * (nunca un genérico ni un valor horneado de otro tenant).
 */
async function nombreMetaTenant(): Promise<{ completo: string; corto: string }> {
  try {
    const info = await getTenantInfo()
    return { completo: info.nombre, corto: info.nombreCorto }
  } catch {
    return { completo: FALLBACK.nombreCompleto, corto: FALLBACK.nombreCorto }
  }
}

export async function getIdentidadPublica(): Promise<IdentidadPublica> {
  try {
    const prisma = await getTenantPrisma()
    const i = await prisma.identidadInstitucional.findFirst({
      where: { singletonKey: 'default' },
    })
    const meta = await nombreMetaTenant()
    if (!i) return { ...FALLBACK, nombreCompleto: meta.completo, nombreCorto: meta.corto }
    const ciudadDepto =
      [i.ciudad, i.departamento].filter(Boolean).join(', ') || null
    return {
      nombreCompleto: i.nombreCompleto?.trim() || meta.completo,
      nombreCorto: i.nombreCorto?.trim() || meta.corto,
      direccionPrincipal: i.direccionPrincipal,
      ciudadDepto,
      telefonoConmutador: i.telefonoConmutador,
      emailContacto: i.emailContacto,
      emailPqrsd: i.emailPqrsd,
      emailNotificaciones: i.emailNotificaciones,
      emailAccesibilidad: i.emailAccesibilidad,
      emailFromName: i.emailFromName,
      emailFromAddress: i.emailFromAddress,
      nit: null, // NIT vive en el meta-tenant, no aquí
    }
  } catch {
    return FALLBACK
  }
}
