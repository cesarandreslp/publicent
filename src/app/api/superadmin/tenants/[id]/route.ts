/**
 * /api/superadmin/tenants/[id]
 * GET    — detalle del tenant
 * PATCH  — actualizar campos parciales
 * DELETE — eliminar tenant (soft delete → suspendido)
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"

type Params = { params: Promise<{ id: string }> }

// ─── GET /api/superadmin/tenants/[id] ────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const tenant = await prismaMeta.tenant.findUnique({
    where: { id },
    include: { eventos: { orderBy: { createdAt: "desc" }, take: 20 } },
  })

  if (!tenant) return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })

  return NextResponse.json({ tenant })
}

// ─── PATCH /api/superadmin/tenants/[id] ──────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  try {
    const body = await req.json()

    // Campos que se pueden actualizar (excluye id y campos inmutables)
    const {
      nombre,
      nombreCorto,
      nit,
      municipio,
      departamento,
      codigoDivipola,
      dominioPrincipal,
      dominioPersonalizado,
      databaseUrl,
      databaseName,
      plan,
      activo,
      suspendido,
      motivoSuspension,
      emailContacto,
      telefonoContacto,
      nombreContacto,
      logoUrl,
      colorPrimario,
      colorSecundario,
      fechaActivacion,
      fechaVencimiento,
      modulosActivos,
    } = body

    const data: Record<string, unknown> = {}
    if (nombre             !== undefined) data.nombre             = nombre
    if (nombreCorto        !== undefined) data.nombreCorto        = nombreCorto
    if (nit                !== undefined) data.nit                = nit
    if (municipio          !== undefined) data.municipio          = municipio
    if (departamento       !== undefined) data.departamento       = departamento
    if (codigoDivipola     !== undefined) data.codigoDivipola     = codigoDivipola
    if (dominioPrincipal   !== undefined) data.dominioPrincipal   = dominioPrincipal
    if (dominioPersonalizado !== undefined) data.dominioPersonalizado = dominioPersonalizado || null
    if (databaseUrl        !== undefined) data.databaseUrl        = databaseUrl
    if (databaseName       !== undefined) data.databaseName       = databaseName
    if (plan               !== undefined) data.plan               = plan
    if (activo             !== undefined) data.activo             = activo
    if (suspendido         !== undefined) data.suspendido         = suspendido
    if (motivoSuspension   !== undefined) data.motivoSuspension   = motivoSuspension
    if (emailContacto      !== undefined) data.emailContacto      = emailContacto
    if (telefonoContacto   !== undefined) data.telefonoContacto   = telefonoContacto
    if (nombreContacto     !== undefined) data.nombreContacto     = nombreContacto
    if (logoUrl            !== undefined) data.logoUrl            = logoUrl
    if (colorPrimario      !== undefined) data.colorPrimario      = colorPrimario
    if (colorSecundario    !== undefined) data.colorSecundario    = colorSecundario
    if (fechaActivacion    !== undefined) data.fechaActivacion    = fechaActivacion ? new Date(fechaActivacion) : null
    if (fechaVencimiento   !== undefined) data.fechaVencimiento   = fechaVencimiento ? new Date(fechaVencimiento) : null
    if (modulosActivos     !== undefined) data.modulosActivos     = modulosActivos

    const tenant = await prismaMeta.tenant.update({ where: { id }, data })

    // Registrar evento de auditoría
    await prismaMeta.eventoTenant.create({
      data: {
        tenantId: id,
        tipo:     "CONFIGURACION",
        descripcion: `Actualizado por superadmin ${session.email}`,
        creadoPor: session.id,
      },
    })

    return NextResponse.json({ tenant })
  } catch (err: unknown) {
    console.error("[SA TENANT PATCH]", err instanceof Error ? err.message : String(err))
    const code = (err as { code?: string })?.code
    if (code === "P2025") return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    if (code === "P2002") return NextResponse.json({ error: "Dominio o código duplicado" }, { status: 409 })
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// ─── DELETE /api/superadmin/tenants/[id] ─────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  try {
    // Soft delete: suspender en lugar de eliminar físicamente
    await prismaMeta.tenant.update({
      where: { id },
      data: {
        activo:          false,
        suspendido:      true,
        motivoSuspension: `Eliminado por superadmin ${session.email}`,
      },
    })

    await prismaMeta.eventoTenant.create({
      data: {
        tenantId:    id,
        tipo:        "SUSPENSION",
        descripcion: `Desactivado por superadmin ${session.email}`,
        creadoPor: session.id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === "P2025") return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
