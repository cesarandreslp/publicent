/**
 * Gestión de tenants en el lado del servidor (Node.js Runtime)
 *
 * Responsabilidades:
 * - Leer el tenant actual desde los request headers (inyectado por middleware.ts)
 * - Mantener un pool de PrismaClient por tenant (un cliente por DATABASE_URL)
 * - Proveer getTenantPrisma() para usar en server components, API routes y lib
 *
 * NO importar desde middleware.ts ni desde código Edge.
 */

import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { headers } from 'next/headers'
import { cache } from 'react'
import { prismaMeta } from './prisma-meta'
import {
  type ModulosConfig,
  type ModuloId,
  resolveModulosConfig,
  MODULOS_DEFAULT,
  MODULO_IDS,
  isModuleActive,
} from './modules'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface TenantInfo {
  id: string
  slug: string
  nombre: string
  nombreCorto: string
  tipoEntidad: string
  municipio: string
  departamento: string
  dominioPrincipal: string
  dominioPersonalizado: string | null
  databaseUrl: string
  plan: string
  activo: boolean
  suspendido: boolean
  modulosActivos: ModulosConfig
  logoUrl: string | null
  colorPrimario: string | null
  colorSecundario: string | null
}

// ---------------------------------------------------------------------------
// Pool de clientes Prisma (uno por tenant, reutilizados entre requests)
// ---------------------------------------------------------------------------

const clientPool = new Map<string, PrismaClient>()

function getOrCreateTenantClient(tenantId: string, databaseUrl: string): PrismaClient {
  if (clientPool.has(tenantId)) {
    return clientPool.get(tenantId)!
  }

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 5, // conexiones máximas por tenant (evitar sobrecarga en Neon free-tier)
  })
  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({ adapter })

  clientPool.set(tenantId, client)
  return client
}

// ---------------------------------------------------------------------------
// Consulta a meta-DB con caché en proceso (para API routes y server components)
// ---------------------------------------------------------------------------

// Caché de TenantInfo completa (incluye databaseUrl) — solo en proceso Node.js
const tenantInfoCache = new Map<string, { data: TenantInfo; ts: number }>()
const CACHE_TTL_MS = 5 * 60_000 // 5 minutos

async function fetchTenantInfo(tenantId: string): Promise<TenantInfo | null> {
  // Devolver tenant de dev automáticamente
  if (tenantId === 'dev-tenant') {
    return getDevTenantInfo()
  }

  const cached = tenantInfoCache.get(tenantId)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data
  }

  const row = await prismaMeta.tenant.findUnique({
    where: { id: tenantId },
  })

  if (!row || !row.activo || row.suspendido) return null

  const info: TenantInfo = {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    nombreCorto: row.nombreCorto,
    tipoEntidad: row.tipoEntidad,
    municipio: row.municipio,
    departamento: row.departamento,
    dominioPrincipal: row.dominioPrincipal,
    dominioPersonalizado: row.dominioPersonalizado,
    databaseUrl: row.databaseUrl,
    plan: row.plan,
    activo: row.activo,
    suspendido: row.suspendido,
    modulosActivos: resolveModulosConfig(row.modulosActivos),
    logoUrl: row.logoUrl,
    colorPrimario: row.colorPrimario,
    colorSecundario: row.colorSecundario,
  }

  tenantInfoCache.set(tenantId, { data: info, ts: Date.now() })
  return info
}

/**
 * Retorna el PrismaClient para un tenantId dado.
 * Usado directamente desde auth.ts donde no hay headers de Next.js disponibles.
 * Hace lookup a la meta-DB si el cliente aún no está en el pool.
 */
export async function getOrCreateTenantClientById(tenantId: string): Promise<PrismaClient> {
  // Caché hit
  if (clientPool.has(tenantId)) {
    return clientPool.get(tenantId)!
  }

  // Dev tenant usa la variable de entorno local
  if (tenantId === 'dev-tenant') {
    const devUrl = process.env.DATABASE_URL
    if (!devUrl) throw new Error('[tenant] DATABASE_URL no definida para dev-tenant')
    return getOrCreateTenantClient('dev-tenant', devUrl)
  }

  // Buscar en meta-DB
  const info = await fetchTenantInfo(tenantId)
  if (!info) throw new Error(`[tenant] Tenant "${tenantId}" no encontrado en meta-DB`)
  return getOrCreateTenantClient(info.id, info.databaseUrl)
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Retorna el ID del tenant actual desde los headers de la request.
 * Inyectado por middleware.ts como `x-tenant-id`.
 * Lanza si no hay contexto de tenant (p. ej. ejecución fuera de una request).
 */
export async function getTenantId(): Promise<string> {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) {
    throw new Error(
      '[tenant] x-tenant-id no encontrado en headers. ' +
        '¿Estás llamando getTenantId() desde un contexto sin request (build time)?'
    )
  }
  return tenantId
}

/**
 * Retorna la información completa del tenant actual.
 * Memoizada por request gracias a React cache().
 */
export const getTenantInfo = cache(async (): Promise<TenantInfo> => {
  const tenantId = await getTenantId()
  const info = await fetchTenantInfo(tenantId)
  if (!info) {
    throw new Error(`[tenant] Tenant "${tenantId}" no encontrado o inactivo.`)
  }
  return info
})

/**
 * Retorna el PrismaClient del tenant actual.
 * Conectado a la base de datos EXCLUSIVA del tenant.
 *
 * Uso en server components:
 *   const prisma = await getTenantPrisma()
 *   const noticias = await prisma.noticia.findMany(...)
 *
 * Uso en API routes:
 *   const prisma = await getTenantPrisma()
 */
export const getTenantPrisma = cache(async (): Promise<PrismaClient> => {
  const info = await getTenantInfo()
  return getOrCreateTenantClient(info.id, info.databaseUrl)
})

/**
 * Verifica si el módulo especificado está activo para el tenant actual.
 * Úsalo para feature-flags basados en plan.
 *
 * @example
 *   const tieneVentanilla = await isTenantModuleActive(MODULO_IDS.VENTANILLA_UNICA)
 */
export async function isTenantModuleActive(modulo: ModuloId): Promise<boolean> {
  const info = await getTenantInfo()
  return isModuleActive(info.modulosActivos, modulo)
}

/**
 * Retorna la configuración completa de módulos del tenant actual.
 */
export async function getTenantModulos(): Promise<ModulosConfig> {
  const info = await getTenantInfo()
  return info.modulosActivos
}

// Re-export para conveniencia en API routes
export { MODULO_IDS, type ModuloId, type ModulosConfig } from './modules'

// ---------------------------------------------------------------------------
// Tenant de desarrollo local
// ---------------------------------------------------------------------------

function getDevTenantInfo(): TenantInfo {
  return {
    id: 'dev-tenant',
    slug: 'local',
    nombre: 'Entidad Local (Desarrollo)',
    nombreCorto: 'Dev',
    tipoEntidad: 'PERSONERIA',
    municipio: 'Local',
    departamento: 'Valle del Cauca',
    dominioPrincipal: 'localhost',
    dominioPersonalizado: null,
    databaseUrl: process.env.DATABASE_URL!,
    plan: 'ENTERPRISE',
    activo: true,
    suspendido: false,
    modulosActivos: {
      ...MODULOS_DEFAULT,
      sitio_web:         { activo: true },
      ventanilla_unica:  { activo: true, usarFallback: true },
      gestion_documental:{ activo: true },
    },
    logoUrl: null,
    colorPrimario: null,
    colorSecundario: null,
  }
}
