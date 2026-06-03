import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContratacion } from "@/lib/frisco-guard"
import { conDocumentoCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const procesoId  = searchParams.get('procesoId')
  const contratoId = searchParams.get('contratoId')

  const prisma = await getTenantPrisma()
  const docs = await prisma.conDocumento.findMany({
    where: {
      ...(procesoId  ? { procesoId }  : {}),
      ...(contratoId ? { contratoId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(docs)
}

export async function POST(req: NextRequest) {
  const guard = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(conDocumentoCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const doc = await prisma.conDocumento.create({
    data: {
      procesoId:   v.data.procesoId ?? null,
      contratoId:  v.data.contratoId ?? null,
      tipo:        v.data.tipo,
      nombre:      v.data.nombre,
      url:         v.data.url ?? null,
      fechaDoc:    v.data.fechaDoc ? new Date(v.data.fechaDoc) : null,
      observacion: v.data.observacion ?? null,
      creadoPor:   guard.user?.id ?? null,
    },
  })
  return NextResponse.json(doc, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const prisma = await getTenantPrisma()
  await prisma.conDocumento.delete({ where: { id } })
  return NextResponse.json({ eliminado: true })
}
