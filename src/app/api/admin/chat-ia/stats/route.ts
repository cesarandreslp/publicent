/**
 * /api/admin/chat-ia/stats
 * GET — Estadísticas del módulo: chunks indexados, conversaciones recientes, top preguntas.
 * Protegido: módulo chat_ia_ciudadano + roles SUPER_ADMIN / ADMIN.
 */

import { NextResponse } from 'next/server'
import { getTenantPrisma, getTenantId } from '@/lib/tenant'
import { requireChatIa } from '@/lib/frisco-guard'

export async function GET() {
  const guard = await requireChatIa(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  try {
    const [prisma, tenantId] = await Promise.all([getTenantPrisma(), getTenantId()])
    const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [totalChunks, chunksPorFuente, totalConversaciones, conversacionesRecientes] =
      await Promise.all([
        prisma.chatIaChunk.count({ where: { tenantId } }),
        prisma.chatIaChunk.groupBy({
          by: ['fuente'],
          where: { tenantId },
          _count: { id: true },
        }),
        prisma.chatIaConversacion.count({
          where: { tenantId, createdAt: { gte: hace30Dias } },
        }),
        prisma.chatIaConversacion.findMany({
          where: { tenantId, createdAt: { gte: hace30Dias } },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: { id: true, sessionId: true, mensajes: true, createdAt: true },
        }),
      ])

    // Top preguntas: primera pregunta de cada conversación, agrupada por prefijo (50 chars)
    const contadorPreguntas = new Map<string, number>()
    for (const conv of conversacionesRecientes) {
      const msgs = (conv.mensajes ?? []) as Array<{ rol: string; texto: string }>
      const primeraUser = msgs.find((m: { rol: string; texto: string }) => m.rol === 'user')
      if (!primeraUser) continue
      const clave = primeraUser.texto.substring(0, 50).toLowerCase().trim()
      contadorPreguntas.set(clave, (contadorPreguntas.get(clave) ?? 0) + 1)
    }

    const topPreguntas = [...contadorPreguntas.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pregunta, veces]) => ({ pregunta, veces }))

    return NextResponse.json({
      totalChunks,
      chunksPorFuente: chunksPorFuente.map((g: { fuente: string; _count: { id: number } }) => ({ fuente: g.fuente, total: g._count.id })),
      totalConversaciones,
      topPreguntas,
      conversacionesRecientes: conversacionesRecientes.map((c) => ({
        id: c.id,
        sessionId: c.sessionId,
        createdAt: c.createdAt,
        primeraPreguenta: (
          ((c.mensajes ?? []) as Array<{ rol: string; texto: string }>)
            .find((m: { rol: string; texto: string }) => m.rol === 'user')
            ?.texto ?? ''
        ).substring(0, 100),
      })),
    })
  } catch (e) {
    console.error('[chat-ia/stats]', e instanceof Error ? e.message : String(e))
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
