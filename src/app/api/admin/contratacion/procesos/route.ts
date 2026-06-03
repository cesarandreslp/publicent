import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContratacion } from "@/lib/frisco-guard"
import { conProcesoCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const vigencia  = searchParams.get('vigencia')
  const estado    = searchParams.get('estado')
  const modalidad = searchParams.get('modalidad')
  const q         = searchParams.get('q')

  const prisma = await getTenantPrisma()
  const procesos = await prisma.conProceso.findMany({
    where: {
      ...(vigencia  ? { vigencia: Number(vigencia) } : {}),
      ...(estado    ? { estado: estado as never } : {}),
      ...(modalidad ? { modalidad: modalidad as never } : {}),
      ...(q ? { OR: [
        { numero: { contains: q, mode: 'insensitive' } },
        { objeto:  { contains: q, mode: 'insensitive' } },
      ]} : {}),
    },
    include: { _count: { select: { contratos: true, documentos: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(procesos)
}

export async function POST(req: NextRequest) {
  const guard = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(conProcesoCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const existe = await prisma.conProceso.findUnique({ where: { numero: v.data.numero } })
  if (existe)
    return NextResponse.json({ error: `Ya existe un proceso con número ${v.data.numero}` }, { status: 409 })

  const proceso = await prisma.conProceso.create({
    data: {
      numero:           v.data.numero,
      modalidad:        v.data.modalidad,
      objeto:           v.data.objeto,
      vigencia:         v.data.vigencia,
      valorEstimado:    v.data.valorEstimado,
      cdpId:            v.data.cdpId ?? null,
      cdpNumero:        v.data.cdpNumero ?? null,
      rubroNombre:      v.data.rubroNombre ?? null,
      fechaAviso:       v.data.fechaAviso ? new Date(v.data.fechaAviso) : null,
      fechaCierre:      v.data.fechaCierre ? new Date(v.data.fechaCierre) : null,
      fechaAdjudicacion: v.data.fechaAdjudicacion ? new Date(v.data.fechaAdjudicacion) : null,
      supervisorNombre: v.data.supervisorNombre ?? null,
      supervisorCargo:  v.data.supervisorCargo ?? null,
      dependencia:      v.data.dependencia ?? null,
      creadoPor:        guard.user?.id ?? null,
    },
  })
  return NextResponse.json(proceso, { status: 201 })
}
