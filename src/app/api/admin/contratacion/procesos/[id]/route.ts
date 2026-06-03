import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContratacion } from "@/lib/frisco-guard"
import { conProcesoUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const proceso = await prisma.conProceso.findUnique({
    where: { id },
    include: {
      contratos: {
        include: { adiciones: { orderBy: { fecha: 'asc' } } },
        orderBy: { createdAt: 'asc' },
      },
      documentos: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!proceso) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })
  return NextResponse.json(proceso)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const v = validateBody(conProcesoUpdateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const data: Record<string, unknown> = { ...v.data }
  if (v.data.fechaAviso)      data.fechaAviso      = new Date(v.data.fechaAviso)
  if (v.data.fechaCierre)     data.fechaCierre     = new Date(v.data.fechaCierre)
  if (v.data.fechaAdjudicacion) data.fechaAdjudicacion = new Date(v.data.fechaAdjudicacion)

  const proceso = await prisma.conProceso.update({ where: { id }, data })
  return NextResponse.json(proceso)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { id } = await params
  const prisma = await getTenantPrisma()

  const contratosCount = await prisma.conContrato.count({ where: { procesoId: id } })
  if (contratosCount > 0)
    return NextResponse.json({ error: 'No se puede eliminar: el proceso tiene contratos asociados' }, { status: 409 })

  await prisma.conProceso.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
