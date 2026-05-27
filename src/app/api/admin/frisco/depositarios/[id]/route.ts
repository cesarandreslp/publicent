/**
 * /api/admin/frisco/depositarios/[id]
 * PATCH  — actualizar (terminar custodia, registrar reporte, póliza, etc.)
 * DELETE — eliminar registro
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { friscoDepositarioUpdateSchema, validateBody } from "@/lib/validations"

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

  const validated = validateBody(friscoDepositarioUpdateSchema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const prisma = await getTenantPrisma()
  try {
    const depositario = await prisma.friscoDepositario.update({
      where: { id },
      data: {
        ...(data.tipoPersona !== undefined && { tipoPersona: data.tipoPersona }),
        ...(data.nombre      !== undefined && { nombre: data.nombre }),
        ...(data.documento   !== undefined && { documento: data.documento }),
        ...(data.email       !== undefined && { email: data.email }),
        ...(data.telefono    !== undefined && { telefono: data.telefono }),
        ...(data.direccion   !== undefined && { direccion: data.direccion }),
        ...(data.fechaAsignacion !== undefined && { fechaAsignacion: new Date(data.fechaAsignacion) }),
        ...(data.fechaFin    !== undefined && { fechaFin: data.fechaFin ? new Date(data.fechaFin) : null }),
        ...(data.activo      !== undefined && { activo: data.activo }),
        ...(data.ultimoReporte !== undefined && { ultimoReporte: data.ultimoReporte ? new Date(data.ultimoReporte) : null }),
        ...(data.polizaVigenteHasta !== undefined && { polizaVigenteHasta: data.polizaVigenteHasta ? new Date(data.polizaVigenteHasta) : null }),
        ...(data.observaciones !== undefined && { observaciones: data.observaciones }),
      },
    })
    return NextResponse.json({ depositario })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Record to update not found')) {
      return NextResponse.json({ error: "Depositario no encontrado" }, { status: 404 })
    }
    console.error("[frisco/depositarios PATCH]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al actualizar depositario" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  try {
    await prisma.friscoDepositario.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Record to delete')) {
      return NextResponse.json({ error: "Depositario no encontrado" }, { status: 404 })
    }
    console.error("[frisco/depositarios DELETE]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al eliminar depositario" }, { status: 500 })
  }
}
