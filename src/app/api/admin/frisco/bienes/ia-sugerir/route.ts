import { NextResponse } from "next/server"
import { z } from "zod"
import { requireFrisco } from "@/lib/frisco-guard"
import { validateBody } from "@/lib/validations"
import { analizarBien } from "@/lib/frisco-bien-ia"
import { getTenantId } from "@/lib/tenant"

const schema = z.object({ descripcion: z.string().min(10).max(1000) })

export async function POST(req: Request) {
  const guard = await requireFrisco(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(schema, body)
  if (!v.success) return v.response

  const tenantId = await getTenantId()
  const sugerencia = await analizarBien(tenantId, v.data.descripcion)
  return NextResponse.json({ sugerencia })
}
