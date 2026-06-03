import { NextResponse } from "next/server"
import { z } from "zod"
import { requireContabilidad } from "@/lib/frisco-guard"
import { validateBody } from "@/lib/validations"
import { sugerirCuentas } from "@/lib/contabilidad-ia"
import { getTenantPrisma, getTenantId } from "@/lib/tenant"

const schema = z.object({ descripcion: z.string().min(5).max(500) })

export async function POST(req: Request) {
  const guard = await requireContabilidad(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(schema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const cuentas = await prisma.cpPlanCuenta.findMany({
    where: { permiteMovimientos: true, activa: true },
    select: { codigo: true, nombre: true, naturaleza: true },
    orderBy: { codigo: "asc" },
    take: 200,
  })

  const tenantId = await getTenantId()
  const sugerencia = await sugerirCuentas(
    tenantId,
    v.data.descripcion,
    cuentas.map(c => ({ codigo: c.codigo, nombre: c.nombre, naturaleza: c.naturaleza })),
  )
  return NextResponse.json({ sugerencia })
}
