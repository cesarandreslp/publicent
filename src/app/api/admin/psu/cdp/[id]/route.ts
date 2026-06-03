/**
 * GET /api/admin/psu/cdp/[id]  — detalle de un CDP
 * PATCH /api/admin/psu/cdp/[id] — anular CDP
 *
 * Regla de anulación: un CDP no puede anularse si tiene RPs vigentes (estado != ANULADO).
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

  const cdp = await prisma.psuCdp.findUnique({
    where: { id },
    include: {
      rps: {
        select: { id: true, numero: true, valor: true, estado: true },
      },
    },
  })
  if (!cdp) return NextResponse.json({ error: "CDP no encontrado" }, { status: 404 })

  return NextResponse.json({ cdp })
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
  const cdp = await prisma.psuCdp.findUnique({ where: { id } })
  if (!cdp) return NextResponse.json({ error: "CDP no encontrado" }, { status: 404 })
  if (cdp.estado === "ANULADO") {
    return NextResponse.json({ error: "El CDP ya está anulado" }, { status: 409 })
  }

  // Verificar hijos vigentes
  const hijos = await prisma.psuRp.count({
    where: { cdpId: id, estado: { not: "ANULADO" } },
  })
  if (hijos > 0) {
    return NextResponse.json(
      { error: `No se puede anular: tiene ${hijos} RP(s) vigente(s). Anúlelos primero.` },
      { status: 409 }
    )
  }

  const ahora = new Date()
  const cdpAnulado = await prisma.psuCdp.update({
    where: { id },
    data: {
      estado: "ANULADO",
      anuladoEn: ahora,
      anuladoPor: guard.user?.id ?? null,
      motivoAnulacion: v.data.motivoAnulacion,
    },
  })

  return NextResponse.json({ cdp: cdpAnulado })
}
