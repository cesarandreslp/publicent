/**
 * API: Visto Bueno (VoBo) multi-nivel
 *
 * GET  — Listar VoBo de un radicado
 * POST — Solicitar VoBo / Aprobar / Rechazar
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { gdVoboSchema, validateBody } from "@/lib/validations"

// GET /api/admin/gd/vobo?radicadoId=xxx
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const radicadoId = searchParams.get("radicadoId")
    const pendientes = searchParams.get("pendientes") === "true"

    const prisma = await getTenantPrisma()

    if (radicadoId) {
      const vobos = await prisma.gdVoBo.findMany({
        where: { radicadoId },
        include: {
          usuario: { select: { id: true, nombre: true, apellido: true, cargo: true } },
          aprobador: { select: { id: true, nombre: true, apellido: true, cargo: true } },
        },
        orderBy: { nivel: "asc" },
      })
      return NextResponse.json({ vobos })
    }

    if (pendientes) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 })
      }

      const pendientesVoBo = await prisma.gdVoBo.findMany({
        where: { usuarioId: session.user.id, estado: "PENDIENTE" },
        include: {
          radicado: {
            select: { id: true, numero: true, asunto: true, tipo: true, estado: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      return NextResponse.json({ pendientes: pendientesVoBo, total: pendientesVoBo.length })
    }

    return NextResponse.json({ error: "radicadoId o pendientes=true requerido" }, { status: 400 })
  } catch (error: any) {
    console.error("[/api/admin/gd/vobo] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener VoBo" }, { status: 500 })
  }
}

// POST /api/admin/gd/vobo
// Body: { radicadoId, accion: "SOLICITAR" | "APROBAR" | "RECHAZAR", usuarioId?, nivel?, comentario? }
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const validated = validateBody(gdVoboSchema, body)
    if (!validated.success) return validated.response
    const { radicadoId, accion, usuarioId, nivel, comentario } = body

    if (!radicadoId || !accion) {
      return NextResponse.json({ error: "radicadoId y accion son requeridos" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()

    // ── SOLICITAR VoBo ──
    if (accion === "SOLICITAR") {
      if (!usuarioId || !nivel) {
        return NextResponse.json(
          { error: "usuarioId y nivel son requeridos para solicitar VoBo" },
          { status: 400 }
        )
      }

      const vobo = await prisma.gdVoBo.create({
        data: {
          radicadoId,
          nivel,
          usuarioId, // A quién se le pide el VoBo
          comentario,
        },
      })

      // Cambiar estado del radicado
      await prisma.gdRadicado.update({
        where: { id: radicadoId },
        data: { estado: "PENDIENTE_VOBO" },
      })

      // Log
      const aprobadorInfo = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { nombre: true, apellido: true, cargo: true },
      })

      await prisma.gdLogTransaccion.create({
        data: {
          accion: "VOBO_SOLICITUD",
          descripcion: `VoBo nivel ${nivel} solicitado a ${aprobadorInfo?.nombre} ${aprobadorInfo?.apellido} (${aprobadorInfo?.cargo ?? "sin cargo"})`,
          estadoAnterior: "EN_TRAMITE",
          estadoNuevo: "PENDIENTE_VOBO",
          usuarioId: session.user.id,
          radicadoId,
        },
      })

      return NextResponse.json({ vobo }, { status: 201 })
    }

    // ── APROBAR VoBo ──
    if (accion === "APROBAR") {
      const vobo = await prisma.gdVoBo.findFirst({
        where: { radicadoId, usuarioId: session.user.id, estado: "PENDIENTE" },
        orderBy: { nivel: "asc" },
      })

      if (!vobo) {
        return NextResponse.json({ error: "No tiene VoBo pendiente para este radicado" }, { status: 404 })
      }

      await prisma.gdVoBo.update({
        where: { id: vobo.id },
        data: {
          estado: "APROBADO",
          aprobadorId: session.user.id,
          comentario: comentario ?? null,
          fechaAccion: new Date(),
        },
      })

      // Verificar si hay más niveles pendientes
      const pendientesRestantes = await prisma.gdVoBo.count({
        where: { radicadoId, estado: "PENDIENTE" },
      })

      // Si no quedan pendientes, pasar a PENDIENTE_FIRMA
      if (pendientesRestantes === 0) {
        await prisma.gdRadicado.update({
          where: { id: radicadoId },
          data: { estado: "PENDIENTE_FIRMA" },
        })
      }

      await prisma.gdLogTransaccion.create({
        data: {
          accion: "VOBO_APROBACION",
          descripcion: `VoBo nivel ${vobo.nivel} aprobado por ${session.user.name ?? session.user.email}${comentario ? `: "${comentario}"` : ""}`,
          estadoAnterior: "PENDIENTE_VOBO",
          estadoNuevo: pendientesRestantes === 0 ? "PENDIENTE_FIRMA" : "PENDIENTE_VOBO",
          usuarioId: session.user.id,
          radicadoId,
        },
      })

      return NextResponse.json({ aprobado: true, pendientesRestantes })
    }

    // ── RECHAZAR VoBo ──
    if (accion === "RECHAZAR") {
      const vobo = await prisma.gdVoBo.findFirst({
        where: { radicadoId, usuarioId: session.user.id, estado: "PENDIENTE" },
      })

      if (!vobo) {
        return NextResponse.json({ error: "No tiene VoBo pendiente para este radicado" }, { status: 404 })
      }

      await prisma.gdVoBo.update({
        where: { id: vobo.id },
        data: {
          estado: "RECHAZADO",
          aprobadorId: session.user.id,
          comentario: comentario ?? "Rechazado sin comentario",
          fechaAccion: new Date(),
        },
      })

      // Devolver el radicado a EN_TRAMITE
      await prisma.gdRadicado.update({
        where: { id: radicadoId },
        data: { estado: "EN_TRAMITE" },
      })

      await prisma.gdLogTransaccion.create({
        data: {
          accion: "VOBO_RECHAZO",
          descripcion: `VoBo nivel ${vobo.nivel} rechazado: "${comentario ?? "Sin motivo"}"`,
          estadoAnterior: "PENDIENTE_VOBO",
          estadoNuevo: "EN_TRAMITE",
          usuarioId: session.user.id,
          radicadoId,
        },
      })

      return NextResponse.json({ rechazado: true })
    }

    return NextResponse.json({ error: "Acción no válida. Use SOLICITAR, APROBAR o RECHAZAR" }, { status: 400 })
  } catch (error: any) {
    console.error("[/api/admin/gd/vobo] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al procesar VoBo" }, { status: 500 })
  }
}
