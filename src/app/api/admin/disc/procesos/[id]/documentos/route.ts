/**
 * /api/admin/disc/procesos/[id]/documentos
 * GET  — listar documentos del proceso
 * POST — adjuntar un documento al proceso
 */

import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"
import { registrarAuditoria } from "@/lib/auditoria"
import { discDocumentoSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const documentos = await prisma.discDocumento.findMany({
    where: { procesoId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(documentos)
}

export async function POST(req: NextRequest, { params }: Params) {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const { id } = await params
  const body = await req.json().catch(() => null)
  const v = validateBody(discDocumentoSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const proceso = await prisma.discProceso.findUnique({ where: { id }, select: { id: true, numero: true } })
  if (!proceso) return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })

  const documento = await prisma.discDocumento.create({
    data: {
      procesoId: id,
      nombre:    v.data.nombre,
      tipo:      v.data.tipo,
      url:       v.data.url ?? null,
      gdDocId:   v.data.gdDocId ?? null,
    },
  })

  try {
    await registrarAuditoria({
      accion: 'UPLOAD',
      entidad: 'DiscDocumento',
      entidadId: documento.id,
      usuarioId: guard.user?.id,
      descripcion: `Documento adjuntado al proceso ${proceso.numero}: ${v.data.nombre}`,
    })
  } catch { /* no crítico */ }

  return NextResponse.json(documento, { status: 201 })
}
