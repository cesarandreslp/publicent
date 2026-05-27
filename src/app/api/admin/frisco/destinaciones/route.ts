/**
 * /api/admin/frisco/destinaciones
 * POST — registra (o reemplaza) la destinación final de un bien
 *
 * Nota: la relación bien ↔ destinación es 1:1, así que se usa upsert.
 */

import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { friscoDestinacionSchema, validateBody } from "@/lib/validations"

export async function POST(req: Request) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  const validated = validateBody(friscoDestinacionSchema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const prisma = await getTenantPrisma()
  try {
    const destinacion = await prisma.friscoDestinacion.upsert({
      where: { bienId: data.bienId },
      create: {
        bienId:             data.bienId,
        tipo:               data.tipo,
        fecha:              new Date(data.fecha),
        beneficiario:       data.beneficiario ?? null,
        valorRealizacion:   data.valorRealizacion ?? null,
        actoAdministrativo: data.actoAdministrativo ?? null,
        observaciones:      data.observaciones ?? null,
      },
      update: {
        tipo:               data.tipo,
        fecha:              new Date(data.fecha),
        beneficiario:       data.beneficiario ?? null,
        valorRealizacion:   data.valorRealizacion ?? null,
        actoAdministrativo: data.actoAdministrativo ?? null,
        observaciones:      data.observaciones ?? null,
      },
    })
    return NextResponse.json({ destinacion }, { status: 201 })
  } catch (err) {
    console.error("[frisco/destinaciones POST]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al registrar destinación" }, { status: 500 })
  }
}
