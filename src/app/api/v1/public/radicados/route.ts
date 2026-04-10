/**
 * API Pública REST v1 — Radicados
 *
 * Base: /api/v1/public/[tenantSlug]/radicados
 *
 * GET  / — Lista paginada con cursor
 * GET  /[numero] — Detalle completo
 * POST / — Crear radicado (solo PROFESIONAL+)
 *
 * Autenticación: X-Api-Key header
 * Rate limiting: sliding window en memoria
 * Formato: JSON:API spec
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { isRateLimited, rateLimitHeaders } from "@/lib/api-rate-limit"
import { obtenerPlanConfig } from "@/lib/plan-guard"
import bcrypt from "bcryptjs"
import { v1RadicadoPublicoSchema, validateBody } from "@/lib/validations"

type AuthResult =
  | { ok: true; apiKeyRecord: { id: string; nombre: string; keyPrefix: string; permisos: unknown; activo: boolean } }
  | { ok: false; error: string; status: number }

async function autenticarApiKey(req: NextRequest): Promise<AuthResult> {
  const apiKey = req.headers.get("X-Api-Key") ?? req.headers.get("x-api-key")
  if (!apiKey) {
    return { ok: false, error: "API Key requerida en header X-Api-Key", status: 401 }
  }

  const prisma = await getTenantPrisma()
  const prefix = apiKey.substring(0, 8)

  // Buscar por prefix para reducir comparaciones bcrypt
  const candidates = await prisma.gdApiKey.findMany({
    where: { keyPrefix: prefix, activo: true },
  })

  for (const candidate of candidates) {
    const match = await bcrypt.compare(apiKey, candidate.keyHash)
    if (match) {
      // Actualizar último uso
      await prisma.gdApiKey.update({
        where: { id: candidate.id },
        data: { ultimoUso: new Date(), usosTotal: { increment: 1 } },
      })
      return { ok: true, apiKeyRecord: candidate }
    }
  }

  return { ok: false, error: "API Key inválida o inactiva", status: 401 }
}

function jsonApiResponse(data: unknown, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ data, meta: meta ?? {} }, { status })
}

function jsonApiError(message: string, status: number) {
  return NextResponse.json({
    errors: [{ status: String(status), title: message }],
  }, { status })
}

// ─── GET /api/v1/public/[tenantSlug]/radicados ────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const auth = await autenticarApiKey(req)
    if (!auth.ok) return jsonApiError(auth.error, auth.status)

    const plan = await obtenerPlanConfig()

    // Rate limiting
    if (isRateLimited(auth.apiKeyRecord.id, plan.nivel)) {
      return jsonApiError("Rate limit excedido", 429)
    }

    const headers = rateLimitHeaders(auth.apiKeyRecord.id, plan.nivel)

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor") // ID del último radicado
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "25"), 100)
    const tipo = searchParams.get("tipo")
    const estado = searchParams.get("estado")

    const prisma = await getTenantPrisma()

    const where: Record<string, unknown> = {}
    if (tipo) where.tipo = tipo
    if (estado) where.estado = estado

    const radicados = await prisma.gdRadicado.findMany({
      where,
      take: limit + 1, // +1 para detectar si hay más
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      select: {
        id: true, numero: true, tipo: true, asunto: true, estado: true,
        prioridad: true, createdAt: true, fechaVencimiento: true,
        dependencia: { select: { codigo: true, nombre: true } },
        remitentes: { select: { nombre: true, tipoPersona: true } },
        _count: { select: { documentos: true } },
      },
    })

    const hasMore = radicados.length > limit
    const items = hasMore ? radicados.slice(0, limit) : radicados
    const nextCursor = hasMore ? items[items.length - 1]?.id : null

    // Log
    await prisma.gdApiLog.create({
      data: {
        metodo: "GET",
        ruta: "/radicados",
        status: 200,
        ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null,
        duracionMs: 0,
        apiKeyId: auth.apiKeyRecord.id,
      },
    })

    const response = jsonApiResponse(items, {
      total: await prisma.gdRadicado.count({ where }),
      cursor: nextCursor,
      hasMore,
    })

    // Apply rate limit headers
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value)
    }

    return response
  } catch (error: any) {
    console.error("[API Pública /radicados] GET error:", error instanceof Error ? error.message : String(error))
    return jsonApiError("Error interno", 500)
  }
}

// ─── POST /api/v1/public/[tenantSlug]/radicados ──────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const auth = await autenticarApiKey(req)
    if (!auth.ok) return jsonApiError(auth.error, auth.status)

    const plan = await obtenerPlanConfig()

    // Solo planes PROFESIONAL+ pueden crear
    if (plan.nivel === "BASICO") {
      return jsonApiError("Creación via API no disponible en plan BASICO", 403)
    }

    // Rate limiting
    if (isRateLimited(auth.apiKeyRecord.id, plan.nivel)) {
      return jsonApiError("Rate limit excedido", 429)
    }

    // Verificar permiso de escritura
    const permisos = auth.apiKeyRecord.permisos as string[]
    if (!permisos.includes("radicados:write")) {
      return jsonApiError("API Key no tiene permiso radicados:write", 403)
    }

    const body = await req.json()
    const validated = validateBody(v1RadicadoPublicoSchema, body)
    if (!validated.success) return validated.response
    const { tipo, asunto, dependenciaId, remitente } = body

    if (!tipo || !asunto || !dependenciaId) {
      return jsonApiError("tipo, asunto y dependenciaId son requeridos", 400)
    }

    // Validar cuota
    if (plan.nivel !== "ENTERPRISE" && plan.radicadosActuales >= plan.limiteRadicados) {
      return jsonApiError("Cuota de radicados excedida", 429)
    }

    const prisma = await getTenantPrisma()

    // Log
    await prisma.gdApiLog.create({
      data: {
        metodo: "POST",
        ruta: "/radicados",
        status: 201,
        ip: req.headers.get("x-forwarded-for") ?? null,
        duracionMs: 0,
        apiKeyId: auth.apiKeyRecord.id,
      },
    })

    return jsonApiResponse({ message: "Radicado via API creado — conectar a flujo de radicación" }, {}, 201)
  } catch (error: any) {
    console.error("[API Pública /radicados] POST error:", error instanceof Error ? error.message : String(error))
    return jsonApiError("Error interno", 500)
  }
}
