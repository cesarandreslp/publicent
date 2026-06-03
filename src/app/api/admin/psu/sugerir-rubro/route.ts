import { NextResponse } from "next/server"
import { z } from "zod"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { validateBody } from "@/lib/validations"
import { sugerirRubro } from "@/lib/presupuesto-ia"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"

const schema = z.object({ concepto: z.string().min(5).max(400) })

export async function POST(req: Request) {
  const guard = await requirePresupuesto(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(schema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const rubros = await prisma.psuRubro.findMany({
    where: { permiteMovimientos: true },
    select: { codigo: true, nombre: true, tipo: true },
    orderBy: { codigo: "asc" },
    take: 200,
  })

  const tenantId = await getTenantId()
  const sugerencia = await sugerirRubro(tenantId, v.data.concepto, rubros)
  return NextResponse.json({ sugerencia })
}
