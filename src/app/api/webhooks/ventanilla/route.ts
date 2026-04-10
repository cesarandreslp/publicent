/**
 * POST /api/webhooks/ventanilla
 *
 * Endpoint que recibe notificaciones del sistema externo de Ventanilla Única
 * cuando una PQRS cambia de estado (ej: de EN_TRAMITE a RESPONDIDO).
 *
 * Flujo:
 * 1. Valida la firma o API Key de la petición entrante.
 * 2. Identifica el radicado.
 * 3. Actualiza el estado en la base de datos local (si se hace mirror)
 *    o simplemente gatilla eventos (ej: enviar email al ciudadano).
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma, getTenantModulos, MODULO_IDS } from "@/lib/tenant"
import { isModuleActive, getVentanillaConfig } from "@/lib/modules"
import { webhookVentanillaSchema, validateBody } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const modulos = await getTenantModulos()

    // Si el módulo no está activo, rechaza el webhook
    if (!isModuleActive(modulos, MODULO_IDS.VENTANILLA_UNICA)) {
      return NextResponse.json({ error: "Módulo inactivo" }, { status: 403 })
    }

    const vuConfig = getVentanillaConfig(modulos)
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("x-api-key")

    // Validar autorización básica
    if (vuConfig.apiKey && authHeader !== `Bearer ${vuConfig.apiKey}` && authHeader !== vuConfig.apiKey) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const validated = validateBody(webhookVentanillaSchema, body)
    if (!validated.success) return validated.response
    const { radicado, nuevoEstado, fechaActualizacion, comentarios } = body

    if (!radicado || !nuevoEstado) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()

    // Verificar si tenemos copia local del radicado
    const pqrsLocal = await prisma.pQRS.findUnique({
      where: { radicado }
    })

    if (pqrsLocal) {
      // Si operamos en modo Híbrido/Mirror, actualizamos la BD local
      await prisma.pQRS.update({
        where: { id: pqrsLocal.id },
        data: {
          estado: nuevoEstado.toUpperCase(),
          updatedAt: fechaActualizacion ? new Date(fechaActualizacion) : new Date(),
        }
      })
      
      // Aquí se podría integrar el servicio de correos para notificar al ciudadano
      // enviarEmailCambioEstado(pqrsLocal.email, radicado, nuevoEstado, comentarios)
    }

    // Retorna 200 OK para que el sistema externo sepa que recibimos el webhook
    return NextResponse.json({ success: true, radicado, procesado: !!pqrsLocal })

  } catch (error) {
    console.error("[Webhook Ventanilla]", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 })
  }
}
