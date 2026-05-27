/**
 * /api/admin/frisco/contratos/[id]
 * PATCH  — actualizar contrato
 * DELETE — eliminar contrato
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { friscoContratoUpdateSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
  }

  const validated = validateBody(friscoContratoUpdateSchema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const prisma = await getTenantPrisma()
  try {
    const contrato = await prisma.friscoContrato.update({
      where: { id },
      data: {
        ...(data.numero !== undefined && { numero: data.numero }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.contraparteNombre !== undefined && { contraparteNombre: data.contraparteNombre }),
        ...(data.contraparteDocumento !== undefined && { contraparteDocumento: data.contraparteDocumento }),
        ...(data.contraparteEmail !== undefined && { contraparteEmail: data.contraparteEmail }),
        ...(data.contraparteTelefono !== undefined && { contraparteTelefono: data.contraparteTelefono }),
        ...(data.fechaInicio !== undefined && { fechaInicio: new Date(data.fechaInicio) }),
        ...(data.fechaFin !== undefined && { fechaFin: data.fechaFin ? new Date(data.fechaFin) : null }),
        ...(data.canon !== undefined && { canon: data.canon }),
        ...(data.periodicidad !== undefined && { periodicidad: data.periodicidad }),
        ...(data.polizaNumero !== undefined && { polizaNumero: data.polizaNumero }),
        ...(data.polizaVigenteHasta !== undefined && { polizaVigenteHasta: data.polizaVigenteHasta ? new Date(data.polizaVigenteHasta) : null }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.observaciones !== undefined && { observaciones: data.observaciones }),
      },
    })
    return NextResponse.json({ contrato })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Record to update not found')) {
      return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 })
    }
    console.error("[frisco/contratos PATCH]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al actualizar contrato" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  try {
    await prisma.friscoContrato.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Record to delete')) {
      return NextResponse.json({ error: "Contrato no encontrado" }, { status: 404 })
    }
    console.error("[frisco/contratos DELETE]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al eliminar contrato" }, { status: 500 })
  }
}
