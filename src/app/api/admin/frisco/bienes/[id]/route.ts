/**
 * /api/admin/frisco/bienes/[id]
 * GET    — detalle completo con depositarios, contratos y destinación
 * PATCH  — actualizar campos del bien
 * DELETE — eliminar (cascada borra depositarios, contratos, destinación)
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { friscoBienUpdateSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()

  const bien = await prisma.friscoBien.findUnique({
    where: { id },
    include: {
      depositarios: { orderBy: { fechaAsignacion: 'desc' } },
      contratos:    { orderBy: { fechaInicio: 'desc' } },
      destinacion:  true,
      expediente:   { select: { id: true, codigo: true, nombre: true } },
      carpetaFisica:{ select: { id: true, codigo: true, titulo: true } },
    },
  })

  if (!bien) return NextResponse.json({ error: "Bien no encontrado" }, { status: 404 })
  return NextResponse.json({ bien })
}

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

  const validated = validateBody(friscoBienUpdateSchema, body)
  if (!validated.success) return validated.response
  const data = validated.data

  const prisma = await getTenantPrisma()

  try {
    const bien = await prisma.friscoBien.update({
      where: { id },
      data: {
        ...(data.codigo          !== undefined && { codigo: data.codigo }),
        ...(data.folioMatricula  !== undefined && { folioMatricula: data.folioMatricula }),
        ...(data.placa           !== undefined && { placa: data.placa }),
        ...(data.tipo            !== undefined && { tipo: data.tipo }),
        ...(data.estadoJuridico  !== undefined && { estadoJuridico: data.estadoJuridico }),
        ...(data.estadoFisico    !== undefined && { estadoFisico: data.estadoFisico }),
        ...(data.descripcion     !== undefined && { descripcion: data.descripcion }),
        ...(data.ubicacion       !== undefined && { ubicacion: data.ubicacion }),
        ...(data.latitud         !== undefined && { latitud: data.latitud }),
        ...(data.longitud        !== undefined && { longitud: data.longitud }),
        ...(data.avaluoVigente   !== undefined && { avaluoVigente: data.avaluoVigente }),
        ...(data.monedaAvaluo    !== undefined && { monedaAvaluo: data.monedaAvaluo }),
        ...(data.fechaAvaluo     !== undefined && { fechaAvaluo: data.fechaAvaluo ? new Date(data.fechaAvaluo) : null }),
        ...(data.numeroProceso   !== undefined && { numeroProceso: data.numeroProceso }),
        ...(data.juzgado         !== undefined && { juzgado: data.juzgado }),
        ...(data.expedienteId    !== undefined && { expedienteId: data.expedienteId }),
        ...(data.carpetaFisicaId !== undefined && { carpetaFisicaId: data.carpetaFisicaId }),
        ...(data.observaciones   !== undefined && { observaciones: data.observaciones }),
      },
    })
    return NextResponse.json({ bien })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Record to update not found')) {
      return NextResponse.json({ error: "Bien no encontrado" }, { status: 404 })
    }
    console.error("[frisco/bienes PATCH]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al actualizar el bien" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requireFrisco(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()

  try {
    await prisma.friscoBien.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Record to delete')) {
      return NextResponse.json({ error: "Bien no encontrado" }, { status: 404 })
    }
    console.error("[frisco/bienes DELETE]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al eliminar el bien" }, { status: 500 })
  }
}
