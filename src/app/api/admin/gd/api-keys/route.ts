/**
 * API: Gestión de API Keys (para API Pública REST)
 *
 * GET  — Listar API keys del tenant
 * POST — Crear nueva API key
 * DELETE — Revocar API key
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { gdApiKeySchema, validateBody } from "@/lib/validations"

// GET /api/admin/gd/api-keys
export async function GET() {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const prisma = await getTenantPrisma()
    const apiKeys = await prisma.gdApiKey.findMany({
      include: {
        creador: { select: { nombre: true, apellido: true, email: true } },
        logs: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: { metodo: true, ruta: true, status: true, ip: true, createdAt: true },
        },
        _count: { select: { logs: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Nunca devolver el hash
    const safe = apiKeys.map(({ keyHash, ...rest }) => rest)

    return NextResponse.json({ apiKeys: safe })
  } catch (error: any) {
    console.error("[/api/admin/gd/api-keys] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al listar API keys" }, { status: 500 })
  }
}

// POST /api/admin/gd/api-keys — Crear nueva
// Body: { nombre, permisos: string[] }
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const { nombre, permisos } = body
    const validated = validateBody(gdApiKeySchema, body)
    if (!validated.success) return validated.response
    if (!nombre) {
      return NextResponse.json({ error: "nombre requerido" }, { status: 400 })
    }

    // Generar API key segura
    const rawKey = `gd_${crypto.randomBytes(32).toString("hex")}`
    const keyPrefix = rawKey.substring(0, 8)
    const keyHash = await bcrypt.hash(rawKey, 10)

    const prisma = await getTenantPrisma()
    const apiKey = await prisma.gdApiKey.create({
      data: {
        nombre,
        keyHash,
        keyPrefix,
        permisos: permisos ?? ["radicados:read"],
        creadorId: session.user.id,
      },
    })

    // IMPORTANTE: el rawKey solo se devuelve UNA VEZ
    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        nombre: apiKey.nombre,
        keyPrefix: apiKey.keyPrefix,
        permisos: apiKey.permisos,
        rawKey, // ← SOLO se muestra una vez al crear
      },
      warning: "Guarde esta API Key. No podrá verla de nuevo.",
    }, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/gd/api-keys] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al crear API key" }, { status: 500 })
  }
}

// DELETE /api/admin/gd/api-keys?id=xxx — Revocar
export async function DELETE(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()
    await prisma.gdApiKey.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ message: "API Key revocada" })
  } catch (error: any) {
    console.error("[/api/admin/gd/api-keys] DELETE error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al revocar API key" }, { status: 500 })
  }
}
