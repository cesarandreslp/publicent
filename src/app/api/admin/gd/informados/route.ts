/**
 * API: Usuarios Informados (CC) en un radicado
 *
 * GET    — Lista informados de un radicado
 * POST   — Agrega usuario como informado
 * PATCH  — Marca como leído
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { idBodySchema, validateBody } from "@/lib/validations"

// GET /api/admin/gd/informados?radicadoId=xxx
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const radicadoId = searchParams.get("radicadoId")
    const pendientes = searchParams.get("pendientes") === "true"

    const prisma = await getTenantPrisma()

    if (radicadoId) {
      // Informados de un radicado específico
      const informados = await prisma.gdRadicadoInformado.findMany({
        where: { radicadoId },
        include: {
          usuario: { select: { id: true, nombre: true, apellido: true, cargo: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json({ informados })
    }

    if (pendientes) {
      // Radicados pendientes de leer para el usuario actual
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
      }

      const noLeidos = await prisma.gdRadicadoInformado.findMany({
        where: { usuarioId: session.user.id, leido: false },
        include: {
          radicado: {
            select: { id: true, numero: true, asunto: true, tipo: true, estado: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      return NextResponse.json({ noLeidos, total: noLeidos.length })
    }

    return NextResponse.json({ error: "radicadoId o pendientes=true requerido" }, { status: 400 })
  } catch (error: any) {
    console.error("[/api/admin/gd/informados] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener informados" }, { status: 500 })
  }
}

// POST /api/admin/gd/informados — Agregar informado
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { radicadoId, usuarioId } = await req.json()
    if (!radicadoId || !usuarioId) {
      return NextResponse.json({ error: "radicadoId y usuarioId requeridos" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()

    // Verificar que el radicado existe
    const radicado = await prisma.gdRadicado.findUnique({
      where: { id: radicadoId },
      select: { id: true, numero: true },
    })
    if (!radicado) {
      return NextResponse.json({ error: "Radicado no encontrado" }, { status: 404 })
    }

    // Crear o actualizar
    const informado = await prisma.gdRadicadoInformado.upsert({
      where: { radicadoId_usuarioId: { radicadoId, usuarioId } },
      create: { radicadoId, usuarioId },
      update: {}, // Ya existe — no hacer nada
    })

    // Log de transacción
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, apellido: true },
    })

    await prisma.gdLogTransaccion.create({
      data: {
        accion: "INFORMADO",
        descripcion: `${usuario?.nombre} ${usuario?.apellido} agregado como informado (CC)`,
        usuarioId: session.user.id,
        radicadoId,
      },
    })

    return NextResponse.json({ informado }, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/gd/informados] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al agregar informado" }, { status: 500 })
  }
}

// PATCH /api/admin/gd/informados — Marcar como leído
export async function PATCH(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { radicadoId } = await req.json()
    if (!radicadoId) {
      return NextResponse.json({ error: "radicadoId requerido" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()

    await prisma.gdRadicadoInformado.updateMany({
      where: { radicadoId, usuarioId: session.user.id },
      data: { leido: true, leidoEn: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[/api/admin/gd/informados] PATCH error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al marcar como leído" }, { status: 500 })
  }
}
