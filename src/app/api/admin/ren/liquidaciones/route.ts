import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"
import { renLiquidacionCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const contribuyenteId = searchParams.get('contribuyenteId')
  const conceptoId      = searchParams.get('conceptoId')
  const vigencia        = searchParams.get('vigencia')
  const estado          = searchParams.get('estado')
  const q               = searchParams.get('q')

  const prisma = await getTenantPrisma()
  const rows = await prisma.renLiquidacion.findMany({
    where: {
      ...(contribuyenteId ? { contribuyenteId } : {}),
      ...(conceptoId      ? { conceptoId }      : {}),
      ...(vigencia        ? { vigencia: parseInt(vigencia) } : {}),
      ...(estado          ? { estado: estado as never }      : {}),
      ...(q ? { OR: [
        { numero:                { contains: q, mode: 'insensitive' } },
        { contribuyente: { nombre:    { contains: q, mode: 'insensitive' } } },
        { contribuyente: { documento: { contains: q, mode: 'insensitive' } } },
      ]} : {}),
    },
    include: {
      concepto:      { select: { nombre: true, tipo: true } },
      contribuyente: { select: { nombre: true, documento: true, razonSocial: true } },
      _count:        { select: { pagos: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const guard = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const v = validateBody(renLiquidacionCreateSchema, await req.json())
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const existe = await prisma.renLiquidacion.findUnique({ where: { numero: v.data.numero } })
  if (existe) return NextResponse.json({ error: 'Ya existe una liquidación con ese número' }, { status: 409 })

  const intereses  = v.data.intereses  ?? 0
  const descuentos = v.data.descuentos ?? 0
  const impuesto   = v.data.baseGravable * v.data.tarifa
  const total      = impuesto + intereses - descuentos

  const row = await prisma.renLiquidacion.create({
    data: {
      numero:          v.data.numero,
      conceptoId:      v.data.conceptoId,
      contribuyenteId: v.data.contribuyenteId,
      vigencia:        v.data.vigencia,
      periodo:         v.data.periodo ?? null,
      baseGravable:    v.data.baseGravable,
      tarifa:          v.data.tarifa,
      impuesto,
      intereses,
      descuentos,
      totalACobrar:    total,
      saldo:           total,
      fechaVencimiento: v.data.fechaVencimiento ? new Date(v.data.fechaVencimiento) : null,
      observacion:     v.data.observacion ?? null,
      creadoPor:       guard.user?.id ?? null,
    },
    include: {
      concepto:      { select: { nombre: true, tipo: true } },
      contribuyente: { select: { nombre: true, documento: true, razonSocial: true } },
    },
  })
  return NextResponse.json(row, { status: 201 })
}
