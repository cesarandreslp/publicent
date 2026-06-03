import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"
import { renContribuyenteUpdateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error
  void req
  const { id } = await params
  const prisma = await getTenantPrisma()
  const row = await prisma.renContribuyente.findUnique({
    where: { id },
    include: {
      liquidaciones: {
        include: { concepto: { select: { nombre: true, tipo: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })
  if (!row) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(row)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error
  const { id } = await params
  const v = validateBody(renContribuyenteUpdateSchema, await req.json())
  if (!v.success) return v.response
  const prisma = await getTenantPrisma()
  const row = await prisma.renContribuyente.update({
    where: { id },
    data: {
      ...(v.data.nombre      !== undefined ? { nombre:      v.data.nombre }      : {}),
      ...(v.data.razonSocial !== undefined ? { razonSocial: v.data.razonSocial } : {}),
      ...(v.data.direccion   !== undefined ? { direccion:   v.data.direccion }   : {}),
      ...(v.data.telefono    !== undefined ? { telefono:    v.data.telefono }    : {}),
      ...(v.data.email       !== undefined ? { email:       v.data.email }       : {}),
      ...(v.data.activo      !== undefined ? { activo:      v.data.activo }      : {}),
    },
  })
  return NextResponse.json(row)
}
