/**
 * Resolución de tenant compatible con Edge Runtime (Next.js Middleware)
 * 
 * Usa el driver HTTP de Neon (@neondatabase/serverless) para consultar
 * la meta-DB sin necesidad de una conexión TCP persistente, lo que lo
 * hace compatible con el runtime de Edge de Vercel/Next.js.
 * 
 * SOLO importar desde middleware.ts — NO usar en server components ni API routes.
 */

import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

export interface TenantEdgeInfo {
  id: string
  slug: string
  nombre: string
  dominioPrincipal: string
  dominioPersonalizado: string | null
  activo: boolean
  suspendido: boolean
  modulosActivos: Record<string, boolean>
}

// Cache en memoria para el Edge Worker (se reinicia entre cold-starts)
// Reduce llamadas a la meta-DB en requests consecutivos del mismo worker
const tenantCache = new Map<string, { data: TenantEdgeInfo | null; ts: number }>()
const CACHE_TTL_MS = 60_000 // 60 segundos

function getSql(): NeonQueryFunction<false, false> {
  const metaUrl = process.env.META_DATABASE_URL
  if (!metaUrl) throw new Error('META_DATABASE_URL no definida')
  return neon(metaUrl)
}

/**
 * Busca el tenant por dominio (subdominio gestionado o dominio personalizado .gov.co)
 * Edge-compatible: usa HTTP driver de Neon, sin TCP ni Node.js APIs.
 */
export async function getTenantByDomainEdge(
  domain: string
): Promise<TenantEdgeInfo | null> {
  // Normalizar: quitar puerto si existe (ej: "localhost:3000" → "localhost")
  const cleanDomain = domain.split(':')[0].toLowerCase()

  // Permitir desarrollo local sin tenant
  if (
    cleanDomain === 'localhost' ||
    cleanDomain === '127.0.0.1' ||
    cleanDomain.startsWith('192.168.')
  ) {
    return getDevTenant()
  }

  // Revisar caché
  const cached = tenantCache.get(cleanDomain)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data
  }

  try {
    const sql = getSql()

    // Para dominios de Vercel (deployment hashes), buscar también por nombre de proyecto
    // Ej: "personeriabuga-15jg1qnal-cesar-lozanos-projects.vercel.app" → buscar "personeriabuga"
    let extraCondition = ''
    let vercelProjectName = ''
    if (cleanDomain.endsWith('.vercel.app')) {
      // Extraer nombre base del proyecto (antes del primer guión-hash o -projects)
      vercelProjectName = cleanDomain.split('-')[0].split('.')[0]
    }

    const rows = await sql`
      SELECT
        id, slug, nombre,
        dominio_principal   AS "dominioPrincipal",
        dominio_personalizado AS "dominioPersonalizado",
        activo, suspendido,
        modulos_activos     AS "modulosActivos"
      FROM tenants
      WHERE
        (
          dominio_principal = ${cleanDomain}
          OR dominio_personalizado = ${cleanDomain}
          OR (${cleanDomain} LIKE dominio_principal || '-%')
          OR (dominio_principal LIKE ${vercelProjectName + '%'} AND ${vercelProjectName} != '')
        )
        AND activo = true
        AND suspendido = false
      LIMIT 1
    `

    const tenant = (rows[0] as TenantEdgeInfo) ?? null
    tenantCache.set(cleanDomain, { data: tenant, ts: Date.now() })
    return tenant
  } catch (error) {
    console.error('[tenant-edge] Error al consultar meta-DB:', error)
    // En caso de error de meta-DB, no bloquear: devolver null para mostrar 404
    return null
  }
}

/**
 * Tenant ficticio para desarrollo local.
 * La app en localhost siempre usa DATABASE_URL del .env como si fuera su propia BD.
 */
function getDevTenant(): TenantEdgeInfo {
  return {
    id: 'dev-tenant',
    slug: 'local',
    nombre: 'Entidad Local (Dev)',
    dominioPrincipal: 'localhost',
    dominioPersonalizado: null,
    activo: true,
    suspendido: false,
    modulosActivos: {
      pqrsd: true,
      gestionDocumental: true,
      ventanillaUnica: true,
      reportes: true,
    },
  }
}
