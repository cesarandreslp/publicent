/**
 * /api/admin/frisco/interop/snr — consulta SNR por folio de matrícula.
 * POST { folioMatricula: string, bienId?: string }
 *
 * Cada consulta queda registrada en FriscoInteropLog para auditoría.
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFriscoInterop } from "@/lib/frisco-guard"
import { validateBody } from "@/lib/validations"
import { lookup } from "@/lib/frisco-interop/snr"

const schema = z.object({
  folioMatricula: z.string().min(5).max(60),
  bienId:         z.string().cuid().optional(),
})

export async function POST(req: Request) {
  const guard = await requireFriscoInterop(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 }) }

  const validated = validateBody(schema, body)
  if (!validated.success) return validated.response
  const { folioMatricula, bienId } = validated.data

  const result = await lookup({ folioMatricula })

  const prisma = await getTenantPrisma()
  await prisma.friscoInteropLog.create({
    data: {
      servicio:   "SNR",
      bienId:     bienId ?? null,
      consulta:   { folioMatricula },
      respuesta:  result.ok ? (result.data as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      exito:      result.ok,
      errorMsg:   result.ok ? null : result.error,
      latenciaMs: result.latenciaMs,
      usuarioId:  (guard.user as { id?: string } | null)?.id ?? null,
    },
  })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 })
  return NextResponse.json({ data: result.data, latenciaMs: result.latenciaMs })
}
