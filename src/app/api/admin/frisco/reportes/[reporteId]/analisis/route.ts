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
    })
    return NextResponse.json({ analisis })
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Análisis IA no encontrado para este reporte" }, { status: 404 })
    }
    console.error("[reportes/analisis PATCH]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al actualizar análisis" }, { status: 500 })
  }
}
