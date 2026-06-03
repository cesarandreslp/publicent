/**
 * /api/admin/frisco/reportes/[reporteId]/analisis
 * PATCH — override humano del análisis IA. Persiste revisadoPor / revisadoEn.
 *         La IA sugiere, el humano decide.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { FriscoReporteUrgencia } from "@prisma/client"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { validateBody } from "@/lib/validations"
import { sendMail } from "@/lib/mail"

type Params = { params: Promise<{ reporteId: string }> }

const schema = z.object({
  urgencia:  z.nativeEnum(FriscoReporteUrgencia),
  etiquetas: z.array(z.string().max(60)).max(20).optional(),
})

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireFrisco(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (guard.error) return guard.error

  const { reporteId } = await params

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 }) }

  const validated = validateBody(schema, body)
  if (!validated.success) return validated.response
  const data = validated.data
  const userId = (guard.user as { id?: string } | null)?.id ?? null

  const prisma = await getTenantPrisma()

  try {
    const analisis = await prisma.friscoReporteAnalisisIA.update({
      where: { reporteId },
      data: {
        urgencia:    data.urgencia,
        etiquetas:   data.etiquetas ?? undefined,
        revisadoPor: userId,
        revisadoEn:  new Date(),
      },
      include: {
        reporte: {
          select: {
            periodo: true,
            depositario: { select: { nombre: true, bien: { select: { codigo: true, tipo: true } } } },
          },
        },
      },
    })

    // Notificación: si se clasifica como CRITICA, avisar al primer admin activo
    if (data.urgencia === "CRITICA") {
      notificarCritica({
        prisma,
        bienCodigo: analisis.reporte.depositario.bien.codigo,
        bienTipo:   analisis.reporte.depositario.bien.tipo,
        depositario: analisis.reporte.depositario.nombre,
        periodo:    analisis.reporte.periodo,
        etiquetas:  (analisis.etiquetas ?? []) as string[],
        resumen:    analisis.resumen ?? "",
      }).catch(() => {}) // aislado — no cancela la operación si falla
    }

    return NextResponse.json({ analisis })
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Análisis IA no encontrado para este reporte" }, { status: 404 })
    }
    console.error("[reportes/analisis PATCH]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al actualizar análisis" }, { status: 500 })
  }
}

// ─── Notificación de urgencia CRÍTICA ────────────────────────────────────────

async function notificarCritica(input: {
  prisma: Awaited<ReturnType<typeof getTenantPrisma>>
  bienCodigo: string
  bienTipo: string
  depositario: string
  periodo: string
  etiquetas: string[]
  resumen: string
}): Promise<void> {
  const responsable = await input.prisma.usuario.findFirst({
    where: { activo: true, rol: { nombre: { in: ["ADMIN", "SUPER_ADMIN"] } } },
    select: { email: true, nombre: true, apellido: true },
    orderBy: { createdAt: "asc" },
  })
  if (!responsable?.email) return

  const etiquetasHtml = input.etiquetas.length
    ? `<p><strong>Etiquetas:</strong> ${input.etiquetas.join(", ")}</p>`
    : ""

  await sendMail({
    to: responsable.email,
    subject: `🔴 Reporte CRÍTICO — Bien ${input.bienCodigo} (${input.periodo})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#dc2626">⚠️ Reporte clasificado como CRÍTICO</h2>
        <p>El análisis del reporte mensual del depositario ha sido marcado como <strong>CRÍTICO</strong>.</p>
        <table style="border-collapse:collapse;width:100%;margin:12px 0">
          <tr><td style="padding:4px 8px;color:#6b7280">Bien</td><td style="padding:4px 8px;font-weight:bold">${input.bienCodigo} — ${input.bienTipo}</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280">Depositario</td><td style="padding:4px 8px">${input.depositario}</td></tr>
          <tr><td style="padding:4px 8px;color:#6b7280">Período</td><td style="padding:4px 8px">${input.periodo}</td></tr>
        </table>
        ${etiquetasHtml}
        ${input.resumen ? `<p><strong>Resumen IA:</strong> ${input.resumen}</p>` : ""}
        <p>Ingrese al sistema para revisar el reporte y tomar acción.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
        <p style="font-size:12px;color:#9ca3af">PublicEnt — FRISCO · Notificación automática</p>
      </div>
    `,
  })
}
