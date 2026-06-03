/**
 * GET /api/admin/psu/rp/[id]  — detalle de un RP
 * PATCH /api/admin/psu/rp/[id] — anular RP
 *
 * Regla de anulación: un RP no puede anularse si tiene Obligaciones vigentes.
 */

import { NextResponse } from "next/server"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { getTenantPrisma } from "@/lib/tenant"
import { psuAnularSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const guard = await requirePresupuesto(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()

  const rp = await prisma.psuRp.findUnique({
    where: { id },
    include: {
      obligaciones: {
        select: { id: true, numero: true, valor: true, estado: true },
      },
    },
  })
  if (!rp) return NextResponse.json({ error: "RP no encontrado" }, { status: 404 })

  return NextResponse.json({ rp })
}

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requirePresupuesto(["SUPER_ADMIN", "ADMIN"])
  if (guard.error) return guard.error

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(psuAnularSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const rp = await prisma.psuRp.findUnique({ where: { id } })
  if (!rp) return NextResponse.json({ error: "RP no encontrado" }, { status: 404 })
  if (rp.estado === "ANULADO") {
    return NextResponse.json({ error: "El RP ya está anulado" }, { status: 409 })
  }

  // Verificar hijos vigentes
  const hijos = await prisma.psuObligacion.count({
    where: { rpId: id, estado: { not: "ANULADO" } },
  })
  if (hijos > 0) {
    return NextResponse.json(
      { error: `No se puede anular: tiene ${hijos} Obligación(es) vigente(s). Anúlelas primero.` },
      { status: 409 }
    )
  }

  const ahora = new Date()
  const rpAnulado = await prisma.psuRp.update({
    where: { id },
    data: {
      estado: "ANULADO",
      anuladoEn: ahora,
      anuladoPor: guard.user?.id ?? null,
      motivoAnulacion: v.data.motivoAnulacion,
    },
  })

  return NextResponse.json({ rp: rpAnulado })
}
