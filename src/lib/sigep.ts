/**
 * SIGEP Client — Integración con el Sistema de Gestión del Empleo Público
 *
 * Busca y sincroniza funcionarios públicos desde el directorio SIGEP.
 * Caché local en BD (GdSigepCache) con TTL de 1 hora.
 * Fallback graceful si SIGEP no responde.
 */

import { getTenantPrisma } from "@/lib/tenant"

export interface FuncionarioSigep {
  cedula: string
  nombre: string
  cargo: string | null
  entidad: string | null
  dependencia: string | null
  email: string | null
  telefono: string | null
}

const SIGEP_BASE_URL = "https://www.sigep.gov.co/api"
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora

// ─── Caché en memoria (TTL 1h, máximo 500 entradas) ──────────────────────────

const memoryCache = new Map<string, { data: FuncionarioSigep; expires: number }>()
const MAX_MEMORY_CACHE = 500

function getFromMemory(cedula: string): FuncionarioSigep | null {
  const entry = memoryCache.get(cedula)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    memoryCache.delete(cedula)
    return null
  }
  return entry.data
}

function setInMemory(cedula: string, data: FuncionarioSigep): void {
  if (memoryCache.size >= MAX_MEMORY_CACHE) {
    // Eliminar la entrada más antigua
    const oldest = memoryCache.keys().next().value
    if (oldest) memoryCache.delete(oldest)
  }
  memoryCache.set(cedula, { data, expires: Date.now() + CACHE_TTL_MS })
}

// ─── Búsqueda ─────────────────────────────────────────────────────────────────

/**
 * Busca un funcionario por cédula.
 * Orden: memoria → BD cache → API SIGEP → null
 */
export async function buscarFuncionarioPorCedula(cedula: string): Promise<FuncionarioSigep | null> {
  // 1. Caché en memoria
  const enMemoria = getFromMemory(cedula)
  if (enMemoria) return enMemoria

  // 2. Caché en BD
  const prisma = await getTenantPrisma()
  const cached = await prisma.gdSigepCache.findUnique({ where: { cedula } })
  if (cached && new Date() < cached.expiraEn) {
    const funcionario: FuncionarioSigep = {
      cedula: cached.cedula,
      nombre: cached.nombre,
      cargo: cached.cargo,
      entidad: cached.entidad,
      dependencia: cached.dependencia,
      email: cached.email,
      telefono: cached.telefono,
    }
    setInMemory(cedula, funcionario)
    return funcionario
  }

  // 3. API SIGEP (con fallback graceful)
  const fromApi = await fetchSigep(cedula)
  if (fromApi) {
    // Guardar en caché BD
    await prisma.gdSigepCache.upsert({
      where: { cedula },
      create: {
        cedula: fromApi.cedula,
        nombre: fromApi.nombre,
        cargo: fromApi.cargo,
        entidad: fromApi.entidad,
        dependencia: fromApi.dependencia,
        email: fromApi.email,
        telefono: fromApi.telefono,
        expiraEn: new Date(Date.now() + CACHE_TTL_MS),
      },
      update: {
        nombre: fromApi.nombre,
        cargo: fromApi.cargo,
        entidad: fromApi.entidad,
        dependencia: fromApi.dependencia,
        email: fromApi.email,
        telefono: fromApi.telefono,
        expiraEn: new Date(Date.now() + CACHE_TTL_MS),
      },
    })

    setInMemory(cedula, fromApi)
    return fromApi
  }

  // Si hay caché expirada, usarla como fallback
  if (cached) {
    return {
      cedula: cached.cedula,
      nombre: cached.nombre,
      cargo: cached.cargo,
      entidad: cached.entidad,
      dependencia: cached.dependencia,
      email: cached.email,
      telefono: cached.telefono,
    }
  }

  return null
}

/**
 * Busca funcionarios por nombre (búsqueda parcial).
 * Solo busca en caché local (no llama a SIGEP para búsquedas abiertas).
 */
export async function buscarFuncionariosPorNombre(nombre: string, limit = 10): Promise<FuncionarioSigep[]> {
  const prisma = await getTenantPrisma()

  const resultados = await prisma.gdSigepCache.findMany({
    where: { nombre: { contains: nombre, mode: "insensitive" } },
    take: limit,
    orderBy: { nombre: "asc" },
  })

  return resultados.map(r => ({
    cedula: r.cedula,
    nombre: r.nombre,
    cargo: r.cargo,
    entidad: r.entidad,
    dependencia: r.dependencia,
    email: r.email,
    telefono: r.telefono,
  }))
}

// ─── API SIGEP (fetch real) ──────────────────────────────────────────────────

async function fetchSigep(cedula: string): Promise<FuncionarioSigep | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

    const res = await fetch(`${SIGEP_BASE_URL}/funcionarios?cedula=${cedula}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })

    clearTimeout(timeout)

    if (!res.ok) return null

    const data = await res.json()

    // Adaptar respuesta al formato interno
    if (data?.funcionario) {
      return {
        cedula: data.funcionario.cedula ?? cedula,
        nombre: data.funcionario.nombre ?? "N/A",
        cargo: data.funcionario.cargo ?? null,
        entidad: data.funcionario.entidad ?? null,
        dependencia: data.funcionario.dependencia ?? null,
        email: data.funcionario.email ?? null,
        telefono: data.funcionario.telefono ?? null,
      }
    }

    return null
  } catch {
    // SIGEP no responde — fallback graceful
    console.warn(`[SIGEP] No se pudo consultar cédula ${cedula} — timeout o error de red`)
    return null
  }
}
