/**
 * GET /api/admin/psu/obligaciones/[id]  — detalle de una Obligación
 * PATCH /api/admin/psu/obligaciones/[id] — anular Obligación
 *
 * Regla de anulación: una Obligación no puede anularse si tiene Pagos registrados.
 * (Los pagos no tienen estado ANULADO — se verifica count directo).
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

  const obligacion = await prisma.psuObligacion.findUnique({
    where: { id },
    include: {
      pagos: {
        select: { id: true, numero: true, valor: true, fecha: true },
      },
    },
  })
  if (!obligacion) return NextResponse.json({ error: "Obligación no encontrada" }, { status: 404 })

  return NextResponse.json({ obligacion })
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
  const obligacion = await prisma.psuObligacion.findUnique({ where: { id } })
  if (!obligacion) return NextResponse.json({ error: "Obligación no encontrada" }, { status: 404 })
  if (obligacion.estado === "ANULADO") {
    return NextResponse.json({ error: "La obligación ya está anulada" }, { status: 409 })
  }

  // Verificar pagos existentes
  const pagos = await prisma.psuPago.count({ where: { obligacionId: id } })
  if (pagos > 0) {
    return NextResponse.json(
      { error: `No se puede anular: tiene ${pagos} pago(s) registrado(s).` },
      { status: 409 }
    )
  }

  const ahora = new Date()
  const obligacionAnulada = await prisma.psuObligacion.update({
    where: { id },
    data: {
      estado: "ANULADO",
      anuladoEn: ahora,
      anuladoPor: guard.user?.id ?? null,
      motivoAnulacion: v.data.motivoAnulacion,
    },
  })

  return NextResponse.json({ obligacion: obligacionAnulada })
}
