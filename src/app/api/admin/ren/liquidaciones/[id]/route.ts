import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"
import { renLiquidacionUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error
  void req
  const { id } = await params
  const prisma = await getTenantPrisma()
  const row = await prisma.renLiquidacion.findUnique({
    where: { id },
    include: {
      concepto:      true,
      contribuyente: true,
      pagos:         { orderBy: { fecha: 'desc' } },
    },
  })
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error
  const { id } = await params
  const v = validateBody(renLiquidacionUpdateSchema, await req.json())
  if (!v.success) return v.response
  const prisma = await getTenantPrisma()
  const row = await prisma.renLiquidacion.update({
    where: { id },
    data: {
      ...(v.data.estado          !== undefined ? { estado:           v.data.estado }          : {}),
      ...(v.data.intereses       !== undefined ? { intereses:        v.data.intereses }       : {}),
      ...(v.data.descuentos      !== undefined ? { descuentos:       v.data.descuentos }      : {}),
      ...(v.data.observacion     !== undefined ? { observacion:      v.data.observacion }     : {}),
      ...(v.data.fechaVencimiento !== undefined ? { fechaVencimiento: v.data.fechaVencimiento ? new Date(v.data.fechaVencimiento) : null } : {}),
    },
  })
  return NextResponse.json(row)
}
