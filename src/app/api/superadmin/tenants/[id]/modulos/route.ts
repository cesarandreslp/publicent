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
  MODULO_IDS,
  type ModulosConfig,
} from "@/lib/modules"
import { superadminModuloSchema, validateBody } from "@/lib/validations"

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

  const nueva: ModulosConfig = {
    sitio_web: {
      ...actual.sitio_web,
      ...(body.sitio_web ?? {}),
      // Sitio web siempre activo
      activo: true,
    },
    ventanilla_unica: {
      ...actual.ventanilla_unica,
      ...(body.ventanilla_unica ?? {}),
    },
    gestion_documental: {
      ...actual.gestion_documental,
      ...(body.gestion_documental ?? {}),
    },
  }

  // Validar acceso por plan
  const PLAN_RANK: Record<string, number> = {
    BASICO: 0, ESTANDAR: 1, PROFESIONAL: 2, ENTERPRISE: 3,
  }
  const planRank = PLAN_RANK[tenant.plan] ?? 0

  if (nueva.ventanilla_unica.activo && planRank < PLAN_RANK.ESTANDAR) {
    return NextResponse.json(
      { error: "El módulo Ventanilla Única requiere plan ESTÁNDAR o superior" },
      { status: 400 }
    )
  }
  if (nueva.gestion_documental.activo && planRank < PLAN_RANK.PROFESIONAL) {
    return NextResponse.json(
      { error: "El módulo Gestión Documental requiere plan PROFESIONAL o superior" },
      { status: 400 }
    )
  }

  const updated = await prismaMeta.tenant.update({
    where: { id },
    data: { modulosActivos: nueva as unknown as Prisma.InputJsonValue },
    select: { id: true, modulosActivos: true },
  })

  // Registrar evento de auditoría
  const modulosCambiados = Object.entries({
    [MODULO_IDS.VENTANILLA_UNICA]:   actual.ventanilla_unica.activo !== nueva.ventanilla_unica.activo,
    [MODULO_IDS.GESTION_DOCUMENTAL]: actual.gestion_documental.activo !== nueva.gestion_documental.activo,
  })
    .filter(([, changed]) => changed)
    .map(([modulo]) => modulo)

  if (modulosCambiados.length > 0) {
    await prismaMeta.eventoTenant.create({
      data: {
        tenantId: id,
        tipo: "MODULO_ACTUALIZADO",
        descripcion: `Módulos modificados: ${modulosCambiados.join(", ")}`,
        datos: { anterior: actual, nuevo: nueva } as unknown as Prisma.InputJsonValue,
      },
    })
  }

  return NextResponse.json({ modulos: resolveModulosConfig(updated.modulosActivos) })
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
