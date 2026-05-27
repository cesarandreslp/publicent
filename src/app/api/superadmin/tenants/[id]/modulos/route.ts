/**
 * /api/superadmin/tenants/[id]/modulos
 * PUT — reemplaza la configuración completa de módulos de un tenant
 * GET — devuelve la configuración actual de módulos
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"
import type { Prisma } from "@/generated/meta-client"
import {
  resolveModulosConfig,
  MODULOS_CATALOGO,
  type ModulosConfig,
  type ModuloId,
} from "@/lib/modules"
import { superadminModuloSchema, validateBody } from "@/lib/validations"

const PLAN_RANK: Record<string, number> = {
  BASICO: 0, ESTANDAR: 1, PROFESIONAL: 2, ENTERPRISE: 3,
}

type Params = { params: Promise<{ id: string }> }

// ─── GET /api/superadmin/tenants/[id]/modulos ─────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const tenant = await prismaMeta.tenant.findUnique({
    where: { id },
    select: { id: true, nombre: true, plan: true, modulosActivos: true },
  })

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  const modulos = resolveModulosConfig(tenant.modulosActivos)
  return NextResponse.json({ modulos, plan: tenant.plan })
}

// ─── PUT /api/superadmin/tenants/[id]/modulos ──────────────────────────────────

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const tenant = await prismaMeta.tenant.findUnique({
    where: { id },
    select: { id: true, plan: true, modulosActivos: true },
  })

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  let body: Partial<ModulosConfig>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  const validated = validateBody(superadminModuloSchema, body)
  if (!validated.success) return validated.response

  // Partir de la configuración actual y aplicar los cambios enviados
  const actual = resolveModulosConfig(tenant.modulosActivos)
  const incoming = body as Partial<Record<ModuloId, { activo: boolean } & Record<string, unknown>>>
  const nueva: ModulosConfig = { ...actual }

  for (const cat of MODULOS_CATALOGO) {
    const prev = actual[cat.id]
    const next = incoming[cat.id]
    if (!next) continue
    nueva[cat.id] = { ...prev, ...next } as ModulosConfig[typeof cat.id]
    if (cat.obligatorio) {
      nueva[cat.id] = { ...nueva[cat.id], activo: true } as ModulosConfig[typeof cat.id]
    }
  }

  // Validar acceso por plan: cada módulo activado debe estar disponible en el plan del tenant
  const planRank = PLAN_RANK[tenant.plan] ?? 0
  for (const cat of MODULOS_CATALOGO) {
    const activoAhora = nueva[cat.id]?.activo === true
    if (!activoAhora) continue
    const minPlan = cat.planesDisponibles[0]
    const minRank = PLAN_RANK[minPlan] ?? 0
    if (planRank < minRank) {
      return NextResponse.json(
        { error: `El módulo "${cat.nombre}" requiere plan ${minPlan} o superior` },
        { status: 400 }
      )
    }
  }

  const updated = await prismaMeta.tenant.update({
    where: { id },
    data: { modulosActivos: nueva as unknown as Prisma.InputJsonValue },
    select: { id: true, modulosActivos: true },
  })

  // Registrar evento de auditoría — sólo los módulos cuyo `activo` cambió
  const modulosCambiados = MODULOS_CATALOGO
    .filter((cat) => actual[cat.id]?.activo !== nueva[cat.id]?.activo)
    .map((cat) => cat.id)

  // ── Auto-siembra de catálogos al activar módulos del MVP fiscal ───────────
  // Si un módulo recién activado necesita un catálogo de base (PUC, rubros),
  // lo sembramos en la BD del tenant. Idempotente: si ya está, no hace nada.
  const recienActivados = MODULOS_CATALOGO.filter(
    (cat) => actual[cat.id]?.activo !== true && nueva[cat.id]?.activo === true,
  ).map((cat) => cat.id)
  const semillas: { modulo: string; total?: number; error?: string }[] = []
  if (recienActivados.includes("contabilidad_publica") || recienActivados.includes("presupuesto_ejecucion")) {
    try {
      const { getOrCreateTenantClientById } = await import("@/lib/tenant")
      const tenantPrisma = await getOrCreateTenantClientById(id)

      if (recienActivados.includes("contabilidad_publica")) {
        const { seedCgc } = await import("@/lib/seeders/cgc-cuentas")
        const r = await seedCgc(tenantPrisma)
        semillas.push({ modulo: "contabilidad_publica", total: r.total })
      }
      if (recienActivados.includes("presupuesto_ejecucion")) {
        const { seedCcp } = await import("@/lib/seeders/ccp-rubros")
        const r = await seedCcp(tenantPrisma)
        semillas.push({ modulo: "presupuesto_ejecucion", total: r.total })
      }
    } catch (e) {
      // No abortamos la activación: el módulo queda activo, sólo registramos
      // que la siembra automática falló (puede correrse manualmente luego).
      semillas.push({ modulo: recienActivados.join(","), error: e instanceof Error ? e.message : String(e) })
    }
  }

  if (modulosCambiados.length > 0) {
    await prismaMeta.eventoTenant.create({
      data: {
        tenantId: id,
        tipo: "MODULO_ACTUALIZADO",
        descripcion: `Módulos modificados: ${modulosCambiados.join(", ")}`,
        datos: { anterior: actual, nuevo: nueva, semillas } as unknown as Prisma.InputJsonValue,
      },
    })
  }

  return NextResponse.json({ modulos: resolveModulosConfig(updated.modulosActivos), semillas })
}

// ─── PATCH /api/superadmin/tenants/[id]/modulos ────────────────────────────────
// Permite actualizaciones parciales (como la configuración del storage)

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  const tenant = await prismaMeta.tenant.findUnique({
    where: { id },
    select: { id: true, modulosActivos: true },
  })

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  const actual = resolveModulosConfig(tenant.modulosActivos)
  let nueva = { ...actual }

  if (body.storageConfig) {
    nueva.gestion_documental = {
      ...actual.gestion_documental,
      storage: body.storageConfig,
    }
  }

  const updated = await prismaMeta.tenant.update({
    where: { id },
    data: { modulosActivos: nueva as unknown as Prisma.InputJsonValue },
    select: { id: true, modulosActivos: true },
  })

  await prismaMeta.eventoTenant.create({
    data: {
      tenantId: id,
      tipo: "CONFIG_ACTUALIZADA",
      descripcion: `Actualización de configuración de almacenamiento de documentos`,
      datos: { cambios: Object.keys(body) } as unknown as Prisma.InputJsonValue,
    },
  })

  return NextResponse.json({ modulos: resolveModulosConfig(updated.modulosActivos) })
}
