import { getTenantPrisma } from './tenant'

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

export async function getIdentidadPublica(): Promise<IdentidadPublica> {
  try {
    const prisma = await getTenantPrisma()
    const i = await prisma.identidadInstitucional.findFirst({
      where: { singletonKey: 'default' },
    })
    if (!i) return FALLBACK
    const ciudadDepto =
      [i.ciudad, i.departamento].filter(Boolean).join(', ') || null
    return {
      nombreCompleto: i.nombreCompleto,
      nombreCorto: i.nombreCorto,
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
