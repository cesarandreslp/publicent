/**
 * provision.ts — Aprovisionamiento automático de un tenant (cliente) de extremo a extremo.
 *
 * Orquesta: crear proyecto Neon → aplicar esquema → sembrar datos base (seedTenant)
 * → sembrar catálogos de los módulos contratados → registrar el tenant en la meta-BD
 * con sus módulos activos. Reutilizable por un CLI o por un endpoint del superadmin.
 *
 * La activación de módulos es por CONTRATO (no por plan): se activa exactamente lo
 * que recibe en `modulos`.
 */

import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { randomBytes } from 'crypto'
import { prismaMeta } from '@/lib/prisma-meta'
import {
  resolveModulosConfig,
  MODULOS_CATALOGO,
  MODULO_IDS,
  type ModulosConfig,
} from '@/lib/modules'
import { seedTenant, type SeedTenantParams } from '@/lib/seeders/tenant-seed'
import { createNeonProject, deleteNeonProject } from './neon'
import { applyProvisionSchema } from './schema-apply'

const PLANES_VALIDOS = ['BASICO', 'ESTANDAR', 'PROFESIONAL', 'ENTERPRISE']

export interface ProvisionParams {
  entidad: {
    slug: string
    codigo: string
    nombre: string
    nombreCorto?: string
    tipoEntidad?: string          // TipoEntidad enum; default PERSONERIA
    nit?: string
    municipio?: string
    departamento?: string
    codigoDivipola?: string
    slogan?: string
  }
  dominioPrincipal: string
  /** Plan es cosmético (no gatea); referencia de contrato. Default ENTERPRISE. */
  plan?: string
  contacto: {
    direccion: string
    ciudad: string
    codigoPostal?: string
    telefono: string
    email: string
    horario?: string
  }
  admin: {
    email: string
    password?: string             // si falta, se genera una temporal
    nombre: string
    apellido: string
    cargo?: string
  }
  redes?: {
    facebook?: string; twitter?: string; instagram?: string; youtube?: string; linkedin?: string
  }
  /** Ids de módulos contratados a activar (además de los obligatorios). */
  modulos: string[]
  neon?: { region?: string; projectName?: string }
}

export interface ProvisionResult {
  tenantId: string
  dominioPrincipal: string
  adminEmail: string
  adminPassword: string
  databaseName: string
  projectId: string
  modulosActivos: string[]
}

function generarPassword(): string {
  return randomBytes(9).toString('base64url') + 'A1*'
}

/** Construye el objeto modulosActivos con los módulos contratados (+ obligatorios) en true. */
function construirModulosActivos(modulos: string[]): ModulosConfig {
  const cfg = resolveModulosConfig({})
  for (const cat of MODULOS_CATALOGO) {
    const activo = cat.obligatorio || modulos.includes(cat.id)
    cfg[cat.id] = { ...cfg[cat.id], activo } as ModulosConfig[typeof cat.id]
  }
  return cfg
}

/** Siembra los catálogos de base de los módulos fiscales/documentales contratados. */
async function seedModulosContratados(prisma: any, modulos: string[]): Promise<{ modulo: string; total?: number }[]> {
  const out: { modulo: string; total?: number }[] = []
  if (modulos.includes(MODULO_IDS.CONTABILIDAD_PUBLICA)) {
    const { seedCgc } = await import('@/lib/seeders/cgc-cuentas')
    const r = await seedCgc(prisma); out.push({ modulo: MODULO_IDS.CONTABILIDAD_PUBLICA, total: r.total })
  }
  if (modulos.includes(MODULO_IDS.PRESUPUESTO_EJECUCION)) {
    const { seedCcp } = await import('@/lib/seeders/ccp-rubros')
    const r = await seedCcp(prisma); out.push({ modulo: MODULO_IDS.PRESUPUESTO_EJECUCION, total: r.total })
  }
  if (modulos.includes(MODULO_IDS.NOMINA_PUBLICA)) {
    const { seedNominaConceptos } = await import('@/lib/seeders/nomina-conceptos')
    const r = await seedNominaConceptos(prisma); out.push({ modulo: MODULO_IDS.NOMINA_PUBLICA, total: r.total })
  }
  if (modulos.includes(MODULO_IDS.GESTION_DOCUMENTAL)) {
    const { seedDependencias, seedTrd } = await import('@/lib/seeders/onboarding')
    const d = await seedDependencias(prisma); const t = await seedTrd(prisma)
    out.push({ modulo: 'gestion_documental:dependencias', total: d.total })
    out.push({ modulo: 'gestion_documental:trd', total: t.series + t.subseries })
  }
  if (modulos.includes(MODULO_IDS.CONTABILIDAD_PUBLICA) || modulos.includes(MODULO_IDS.PRESUPUESTO_EJECUCION)) {
    const { seedTercerosEstado } = await import('@/lib/seeders/onboarding')
    const r = await seedTercerosEstado(prisma); out.push({ modulo: 'terceros_estado', total: r.total })
  }
  return out
}

export async function provisionTenant(p: ProvisionParams): Promise<ProvisionResult> {
  const adminPassword = p.admin.password?.trim() || generarPassword()
  const plan = (p.plan && PLANES_VALIDOS.includes(p.plan)) ? p.plan : 'ENTERPRISE'

  // 1. Crear proyecto/BD en Neon
  const neon = await createNeonProject(p.neon?.projectName ?? p.entidad.slug, p.neon?.region)

  try {
    // 2. Aplicar esquema completo a la BD nueva (vía conexión directa)
    await applyProvisionSchema(neon.directUrl)

    // 3. Sembrar datos del tenant en la BD nueva
    const pool = new pg.Pool({ connectionString: neon.directUrl })
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) }) as any
    try {
      const seedParams: SeedTenantParams = {
        entidad: {
          nombre: p.entidad.nombre,
          nombreCorto: p.entidad.nombreCorto ?? p.entidad.nombre,
          nit: p.entidad.nit ?? 'NIT-PENDIENTE',
          slogan: p.entidad.slogan,
        },
        contacto: p.contacto,
        admin: { ...p.admin, password: adminPassword },
        redes: p.redes,
      }
      await seedTenant(prisma, seedParams)
      await seedModulosContratados(prisma, p.modulos)
    } finally {
      await prisma.$disconnect().catch(() => null)
      await pool.end().catch(() => null)
    }

    // 4. Registrar el tenant en la meta-BD (connection string POOLED para runtime)
    const modulosActivos = construirModulosActivos(p.modulos)
    const tenant = await prismaMeta.tenant.create({
      data: {
        slug: p.entidad.slug,
        codigo: p.entidad.codigo,
        nombre: p.entidad.nombre,
        nombreCorto: p.entidad.nombreCorto ?? p.entidad.nombre,
        tipoEntidad: (p.entidad.tipoEntidad ?? 'PERSONERIA') as any,
        nit: p.entidad.nit ?? null,
        municipio: p.entidad.municipio ?? p.contacto.ciudad,
        departamento: p.entidad.departamento ?? '',
        codigoDivipola: p.entidad.codigoDivipola ?? null,
        dominioPrincipal: p.dominioPrincipal,
        databaseUrl: neon.pooledUrl,
        databaseName: neon.databaseName,
        plan: plan as any,
        emailContacto: p.contacto.email,
        modulosActivos: modulosActivos as any,
      },
      select: { id: true },
    })

    // Evento de auditoría
    await prismaMeta.eventoTenant.create({
      data: {
        tenantId: tenant.id,
        tipo: 'TENANT_APROVISIONADO',
        descripcion: `Tenant aprovisionado automáticamente (Neon ${neon.projectId})`,
        datos: { projectId: neon.projectId, modulos: p.modulos } as any,
      },
    }).catch(() => null)

    return {
      tenantId: tenant.id,
      dominioPrincipal: p.dominioPrincipal,
      adminEmail: p.admin.email,
      adminPassword,
      databaseName: neon.databaseName,
      projectId: neon.projectId,
      modulosActivos: p.modulos,
    }
  } catch (e) {
    // Rollback: si algo falló tras crear el proyecto Neon, lo eliminamos para no dejar basura.
    await deleteNeonProject(neon.projectId)
    throw e
  }
}
