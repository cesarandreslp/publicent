/**
 * /api/admin/frisco/depositarios
 * GET  — listar depositarios (filtrable por bienId, activo)
 * POST — registrar un depositario para un bien
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { friscoDepositarioCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const bienId = searchParams.get('bienId')
  const activo = searchParams.get('activo')

  const where: Prisma.FriscoDepositarioWhereInput = {}
  if (bienId) where.bienId = bienId
  if (activo !== null) where.activo = activo === 'true'

  const prisma = await getTenantPrisma()
  const depositarios = await prisma.friscoDepositario.findMany({
    where,
    orderBy: { fechaAsignacion: 'desc' },
    include: { bien: { select: { id: true, codigo: true, descripcion: true } } },
  })

  return NextResponse.json({ depositarios })
}

export async function POST(req: Request) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  const validated = validateBody(friscoDepositarioCreateSchema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const prisma = await getTenantPrisma()
  try {
    const depositario = await prisma.friscoDepositario.create({
      data: {
        bienId:          data.bienId,
        tipoPersona:     data.tipoPersona,
        nombre:          data.nombre,
        documento:       data.documento,
        email:           data.email ?? null,
        telefono:        data.telefono ?? null,
        direccion:       data.direccion ?? null,
        fechaAsignacion: new Date(data.fechaAsignacion),
        fechaFin:        data.fechaFin ? new Date(data.fechaFin) : null,
        activo:          data.activo ?? true,
        polizaVigenteHasta: data.polizaVigenteHasta ? new Date(data.polizaVigenteHasta) : null,
        observaciones:   data.observaciones ?? null,
      },
    })
    return NextResponse.json({ depositario }, { status: 201 })
  } catch (err) {
    console.error("[frisco/depositarios POST]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al registrar depositario" }, { status: 500 })
  }
}
