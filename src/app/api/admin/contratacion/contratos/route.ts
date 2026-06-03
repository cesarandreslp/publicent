import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContratacion } from "@/lib/frisco-guard"
import { conContratoCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const procesoId = searchParams.get('procesoId')
  const estado    = searchParams.get('estado')
  const q         = searchParams.get('q')

  const prisma = await getTenantPrisma()
  const contratos = await prisma.conContrato.findMany({
    where: {
      ...(procesoId ? { procesoId } : {}),
      ...(estado    ? { estado: estado as never } : {}),
      ...(q ? { OR: [
        { numero:             { contains: q, mode: 'insensitive' } },
        { contratistaNombre:  { contains: q, mode: 'insensitive' } },
        { contratistaDoc:     { contains: q, mode: 'insensitive' } },
      ]} : {}),
    },
    include: { proceso: { select: { numero: true, objeto: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json(contratos)
}

export async function POST(req: NextRequest) {
  const guard = await requireContratacion(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(conContratoCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const proceso = await prisma.conProceso.findUnique({ where: { id: v.data.procesoId } })
  if (!proceso)
    return NextResponse.json({ error: 'Proceso no encontrado' }, { status: 404 })

  const existe = await prisma.conContrato.findUnique({ where: { numero: v.data.numero } })
  if (existe)
    return NextResponse.json({ error: `Ya existe un contrato con número ${v.data.numero}` }, { status: 409 })

  const contrato = await prisma.conContrato.create({
    data: {
      procesoId:           v.data.procesoId,
      numero:              v.data.numero,
      tipo:                v.data.tipo,
      contratistaNombre:   v.data.contratistaNombre,
      contratistaDoc:      v.data.contratistaDoc,
      contratistaEmail:    v.data.contratistaEmail ?? null,
      contratistaTelefono: v.data.contratistaTelefono ?? null,
      valorContrato:       v.data.valorContrato,
      plazoMeses:          v.data.plazoMeses ?? null,
      fechaSuscripcion:    new Date(v.data.fechaSuscripcion),
      fechaInicio:         v.data.fechaInicio ? new Date(v.data.fechaInicio) : null,
      fechaTerminacion:    v.data.fechaTerminacion ? new Date(v.data.fechaTerminacion) : null,
      rpId:                v.data.rpId ?? null,
      rpNumero:            v.data.rpNumero ?? null,
      supervisorNombre:    v.data.supervisorNombre ?? null,
      observacion:         v.data.observacion ?? null,
      creadoPor:           guard.user?.id ?? null,
    },
  })

  // Avanzar proceso a CONTRATADO si estaba en ADJUDICADO
  if (proceso.estado === 'ADJUDICADO') {
    await prisma.conProceso.update({ where: { id: proceso.id }, data: { estado: 'CONTRATADO' } })
  }

  return NextResponse.json(contrato, { status: 201 })
}
