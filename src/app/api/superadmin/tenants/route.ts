/**
 * /api/superadmin/tenants
 * GET  — lista de tenants con paginación y filtros
 * POST — crear nuevo tenant
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"
import { superadminTenantSchema, validateBody } from "@/lib/validations"

// ─── GET /api/superadmin/tenants ──────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const q       = searchParams.get("q") ?? ""
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const perPage = Math.min(50, parseInt(searchParams.get("perPage") ?? "20"))
  const skip    = (page - 1) * perPage

  const where = q
    ? {
        OR: [
          { nombre:    { contains: q, mode: "insensitive" as const } },
          { slug:      { contains: q, mode: "insensitive" as const } },
          { municipio: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [tenants, total] = await Promise.all([
    prismaMeta.tenant.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        codigo: true,
        nombre: true,
        nombreCorto: true,
        tipoEntidad: true,
        municipio: true,
        departamento: true,
        dominioPrincipal: true,
        dominioPersonalizado: true,
        plan: true,
        activo: true,
        suspendido: true,
        emailContacto: true,
        logoUrl: true,
        colorPrimario: true,
        fechaActivacion: true,
        fechaVencimiento: true,
        createdAt: true,
      },
    }),
    prismaMeta.tenant.count({ where }),
  ])

  return NextResponse.json({ tenants, total, page, perPage })
}

// ─── POST /api/superadmin/tenants ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = await req.json()
    const validated = validateBody(superadminTenantSchema, body)
    if (!validated.success) return validated.response

    const {
      slug,
      codigo,
      nombre,
      nombreCorto,
      tipoEntidad,
      nit,
      municipio,
      departamento,
      codigoDivipola,
      dominioPrincipal,
      dominioPersonalizado,
      databaseUrl,
      databaseName,
      plan,
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

    // Validaciones mínimas
    if (!slug || !codigo || !nombre || !databaseUrl || !databaseName || !emailContacto || !dominioPrincipal) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: slug, codigo, nombre, databaseUrl, databaseName, emailContacto, dominioPrincipal" },
        { status: 400 }
      )
    }

    const tenant = await prismaMeta.tenant.create({
      data: {
        slug,
        codigo,
        nombre,
        nombreCorto: nombreCorto ?? nombre,
        tipoEntidad: tipoEntidad ?? "PERSONERIA",
        nit,
        municipio: municipio ?? "",
        departamento: departamento ?? "",
        codigoDivipola,
        dominioPrincipal,
        dominioPersonalizado: dominioPersonalizado || null,
        databaseUrl,
        databaseName,
        plan: plan ?? "BASICO",
        emailContacto,
        telefonoContacto,
        nombreContacto,
        logoUrl,
        colorPrimario,
        colorSecundario,
        fechaActivacion: fechaActivacion ? new Date(fechaActivacion) : null,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        modulosActivos: modulosActivos ?? { pqrsd: false, gestionDocumental: false, ventanillaUnica: false },
        creadoPor: session.id,
      },
    })

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (err: unknown) {
    console.error("[SA TENANT POST]", err instanceof Error ? err.message : String(err))
    const code = (err as { code?: string })?.code
    if (code === "P2002") {
      return NextResponse.json({ error: "Slug, código o dominio ya existe" }, { status: 409 })
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
