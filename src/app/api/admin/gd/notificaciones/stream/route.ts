/**
 * SSE: Notificaciones del Gestor Documental en tiempo real
 *
 * Los funcionarios se suscriben a este endpoint y reciben eventos cuando:
 * - Se les asigna un radicado
 * - Se les solicita VoBo
 * - Son agregados como informados (CC)
 * - Un radicado que tramitan está próximo a vencer
 *
 * Compatible con Edge Runtime de Next.js (no usa WebSockets).
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const userId = user!.id

    // Crear ReadableStream para SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        const send = (event: string, data: object) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        }

        // Enviar heartbeat cada 30s para mantener la conexión viva
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`: heartbeat\n\n`))
          } catch {
            clearInterval(heartbeat)
            clearInterval(pollInterval)
          }
        }, 30_000)

        // Polling cada 15 segundos (más eficiente que WebSockets para la mayoría de entidades)
        let lastChecked = new Date()

        const checkNotificaciones = async () => {
          try {
            const prisma = await getTenantPrisma()
            const ahora = new Date()

            // 1. Nuevos radicados asignados al usuario
            const nuevosAsignados = await prisma.gdRadicado.findMany({
              where: {
                tramitadorId: userId,
                createdAt: { gt: lastChecked },
              },
              select: { id: true, numero: true, asunto: true, tipo: true, prioridad: true },
              take: 10,
            })

            for (const r of nuevosAsignados) {
              send("radicado_asignado", {
                id: r.id,
                numero: r.numero,
                asunto: r.asunto,
                tipo: r.tipo,
                prioridad: r.prioridad,
                mensaje: `Nuevo radicado asignado: ${r.numero}`,
              })
            }

            // 2. Solicitudes de VoBo pendientes
            const voboPendientes = await prisma.gdVoBo.findMany({
              where: {
                usuarioId: userId,
                estado: "PENDIENTE",
                createdAt: { gt: lastChecked },
              },
              include: {
                radicado: { select: { id: true, numero: true, asunto: true } },
              },
              take: 10,
            })

            for (const v of voboPendientes) {
              send("vobo_solicitado", {
                voboId: v.id,
                radicadoId: v.radicado.id,
                numero: v.radicado.numero,
                asunto: v.radicado.asunto,
                nivel: v.nivel,
                mensaje: `VoBo nivel ${v.nivel} solicitado para ${v.radicado.numero}`,
              })
            }

            // 3. Nuevos CC / informados
            const nuevosCc = await prisma.gdRadicadoInformado.findMany({
              where: {
                usuarioId: userId,
                leido: false,
                createdAt: { gt: lastChecked },
              },
              include: {
                radicado: { select: { id: true, numero: true, asunto: true, tipo: true } },
              },
              take: 10,
            })

            for (const cc of nuevosCc) {
              send("informado_cc", {
                radicadoId: cc.radicado.id,
                numero: cc.radicado.numero,
                asunto: cc.radicado.asunto,
                mensaje: `Añadido como CC en ${cc.radicado.numero}`,
              })
            }

            // 4. Radicados próximos a vencer (dentro de 2 días hábiles)
            const enDosDias = new Date()
            enDosDias.setDate(enDosDias.getDate() + 3) // ~2 días hábiles
            const proximosVencer = await prisma.gdRadicado.findMany({
              where: {
                tramitadorId: userId,
                estado: { in: ["EN_TRAMITE", "PENDIENTE_VOBO"] },
                fechaVencimiento: {
                  gt: ahora,
                  lt: enDosDias,
                },
              },
              select: { id: true, numero: true, asunto: true, fechaVencimiento: true },
              take: 5,
            })

            // Solo enviar alertas de vencimiento cada minuto, no cada 15s
            if (ahora.getSeconds() < 15) {
              for (const r of proximosVencer) {
                send("proximo_vencer", {
                  radicadoId: r.id,
                  numero: r.numero,
                  asunto: r.asunto,
                  fechaVencimiento: r.fechaVencimiento,
                  mensaje: `⚠️ ${r.numero} próximo a vencer`,
                })
              }
            }

            lastChecked = ahora
          } catch (err) {
            console.error("[SSE notificaciones] Error en polling:", err instanceof Error ? err.message : String(err))
          }
        }

        // Check inicial inmediato
        await checkNotificaciones()

        // Polling periódico
        const pollInterval = setInterval(checkNotificaciones, 15_000)

        // Limpiar al desconectar
        req.signal.addEventListener("abort", () => {
          clearInterval(heartbeat)
          clearInterval(pollInterval)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Para Nginx
      },
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/notificaciones/stream] error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al iniciar stream de notificaciones" }, { status: 500 })
  }
}
