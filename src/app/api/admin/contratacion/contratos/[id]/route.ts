import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContratacion } from "@/lib/frisco-guard"
import { conContratoUpdateSchema, validateBody } from "@/lib/validations"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const v = validateBody(conContratoUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const data: Record<string, unknown> = { ...v.data }
  if (v.data.fechaSuscripcion) data.fechaSuscripcion = new Date(v.data.fechaSuscripcion)
  if (v.data.fechaInicio)      data.fechaInicio      = new Date(v.data.fechaInicio)
  if (v.data.fechaTerminacion) data.fechaTerminacion = new Date(v.data.fechaTerminacion)
  if (v.data.fechaLiquidacion) data.fechaLiquidacion = new Date(v.data.fechaLiquidacion)

  const contrato = await prisma.conContrato.update({ where: { id }, data })

  // Si el contrato pasa a LIQUIDADO, avanzar el proceso también
  if (v.data.estado === 'LIQUIDADO') {
    const todosLiquidados = await prisma.conContrato.count({
      where: { procesoId: contrato.procesoId, estado: { not: 'LIQUIDADO' } },
    })
    if (todosLiquidados === 0) {
      await prisma.conProceso.update({ where: { id: contrato.procesoId }, data: { estado: 'LIQUIDADO' } })
    }
  }

  return NextResponse.json(contrato)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  await prisma.conContrato.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
