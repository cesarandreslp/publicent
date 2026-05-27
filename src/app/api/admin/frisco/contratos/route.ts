/**
 * /api/admin/frisco/contratos
 * GET  — listar contratos (filtrable por bienId, estado)
 * POST — crear contrato sobre un bien
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { friscoContratoCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const bienId = searchParams.get('bienId')
  const estado = searchParams.get('estado')

  const where: Prisma.FriscoContratoWhereInput = {}
  if (bienId) where.bienId = bienId
  if (estado) where.estado = estado as Prisma.FriscoContratoWhereInput['estado']

  const prisma = await getTenantPrisma()
  const contratos = await prisma.friscoContrato.findMany({
    where,
    orderBy: { fechaInicio: 'desc' },
    include: { bien: { select: { id: true, codigo: true, descripcion: true } } },
  })

  return NextResponse.json({ contratos })
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

  const validated = validateBody(friscoContratoCreateSchema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const prisma = await getTenantPrisma()
  try {
    const contrato = await prisma.friscoContrato.create({
      data: {
        bienId:               data.bienId,
        numero:               data.numero,
        tipo:                 data.tipo,
        contraparteNombre:    data.contraparteNombre,
        contraparteDocumento: data.contraparteDocumento,
        contraparteEmail:     data.contraparteEmail ?? null,
        contraparteTelefono:  data.contraparteTelefono ?? null,
        fechaInicio:          new Date(data.fechaInicio),
        fechaFin:             data.fechaFin ? new Date(data.fechaFin) : null,
        canon:                data.canon ?? null,
        periodicidad:         data.periodicidad ?? null,
        polizaNumero:         data.polizaNumero ?? null,
        polizaVigenteHasta:   data.polizaVigenteHasta ? new Date(data.polizaVigenteHasta) : null,
        estado:               data.estado ?? 'VIGENTE',
        observaciones:        data.observaciones ?? null,
      },
    })
    return NextResponse.json({ contrato }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: `Ya existe un contrato con número "${data.numero}"` },
        { status: 409 }
      )
    }
    console.error("[frisco/contratos POST]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al crear el contrato" }, { status: 500 })
  }
}
