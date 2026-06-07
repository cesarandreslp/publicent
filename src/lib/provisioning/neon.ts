/**
 * neon.ts — Creación automática de bases de datos de tenant en Neon (API v2).
 *
 * Estrategia: UN PROYECTO Neon por tenant (aislamiento total — es el patrón
 * "Neon for Platforms"). Cada proyecto trae su propia base, rol y connection
 * string. Requiere `NEON_API_KEY` (consola Neon → Account settings → API keys).
 *
 * Docs: https://api-docs.neon.tech/reference/createproject
 */

const NEON_API = 'https://console.neon.tech/api/v2'

export interface NeonProjectResult {
  projectId: string
  databaseName: string
  /** Connection string DIRECTA (no pooled) — para migraciones y seeding. */
  directUrl: string
  /** Connection string POOLED — para el runtime de la app (pgBouncer de Neon). */
  pooledUrl: string
}

function apiKey(): string {
  const k = process.env.NEON_API_KEY?.trim()
  if (!k) {
    throw new Error(
      '[neon] NEON_API_KEY no definida. Genérala en la consola de Neon ' +
      '(Account settings → API keys) y ponla en las variables de entorno.'
    )
  }
  return k
}

/**
 * Resuelve el org_id de Neon. Las API keys de organización exigen org_id al crear
 * proyectos. Se toma de `NEON_ORG_ID` si está definido; si no, se consulta la API.
 */
async function getOrgId(): Promise<string | undefined> {
  const fromEnv = process.env.NEON_ORG_ID?.trim()
  if (fromEnv) return fromEnv
  try {
    const res = await fetch(`${NEON_API}/users/me/organizations`, {
      headers: { Authorization: `Bearer ${apiKey()}`, Accept: 'application/json' },
    })
    if (!res.ok) return undefined
    const data = (await res.json()) as { organizations?: { id?: string }[] }
    return data.organizations?.[0]?.id
  } catch {
    return undefined
  }
}

/** Deriva el host pooled de Neon insertando "-pooler" en el id del endpoint. */
function toPooled(uri: string): string {
  try {
    const u = new URL(uri)
    const labels = u.hostname.split('.')
    if (labels[0] && !labels[0].includes('-pooler')) {
      labels[0] = `${labels[0]}-pooler`
      u.hostname = labels.join('.')
    }
    return u.toString()
  } catch {
    return uri
  }
}

/**
 * Crea un proyecto Neon nuevo para un tenant y devuelve sus connection strings.
 * @param nombre  nombre legible del proyecto (ej. el slug del tenant)
 * @param region  region_id de Neon (default aws-us-east-1)
 */
export async function createNeonProject(
  nombre: string,
  region = 'aws-us-east-1'
): Promise<NeonProjectResult> {
  const orgId = await getOrgId()
  const project: Record<string, unknown> = { name: nombre, region_id: region }
  if (orgId) project.org_id = orgId

  const res = await fetch(`${NEON_API}/projects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ project }),
  })

  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`[neon] createProject ${res.status}: ${t.slice(0, 400)}`)
  }

  const data = (await res.json()) as {
    project?: { id?: string }
    connection_uris?: { connection_uri?: string; connection_parameters?: { database?: string } }[]
    databases?: { name?: string }[]
  }

  const direct = data.connection_uris?.[0]?.connection_uri
  if (!direct) throw new Error('[neon] La respuesta no incluyó connection_uri')

  const databaseName =
    data.databases?.[0]?.name ??
    data.connection_uris?.[0]?.connection_parameters?.database ??
    'neondb'

  return {
    projectId: data.project?.id ?? '',
    databaseName,
    directUrl: direct,
    pooledUrl: toPooled(direct),
  }
}

/** Elimina un proyecto Neon (rollback si el aprovisionamiento falla después de crearlo). */
export async function deleteNeonProject(projectId: string): Promise<void> {
  if (!projectId) return
  await fetch(`${NEON_API}/projects/${projectId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${apiKey()}`, Accept: 'application/json' },
  }).catch(() => null)
}
