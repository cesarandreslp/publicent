import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"
import { renContribuyenteCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  const prisma = await getTenantPrisma()
  const rows = await prisma.renContribuyente.findMany({
    where: {
      activo: true,
      ...(q ? { OR: [
        { nombre:      { contains: q, mode: 'insensitive' } },
        { razonSocial: { contains: q, mode: 'insensitive' } },
        { documento:   { contains: q, mode: 'insensitive' } },
      ]} : {}),
    },
    include: { _count: { select: { liquidaciones: true } } },
    orderBy: { nombre: 'asc' },
    take: 200,
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const guard = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const v = validateBody(renContribuyenteCreateSchema, await req.json())
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const existe = await prisma.renContribuyente.findUnique({ where: { documento: v.data.documento } })
  if (existe) return NextResponse.json({ error: 'Ya existe un contribuyente con ese documento' }, { status: 409 })

  const row = await prisma.renContribuyente.create({
    data: {
      documento:   v.data.documento,
      tipoDoc:     v.data.tipoDoc ?? 'CC',
      nombre:      v.data.nombre,
      razonSocial: v.data.razonSocial ?? null,
      direccion:   v.data.direccion ?? null,
      telefono:    v.data.telefono ?? null,
      email:       v.data.email ?? null,
      creadoPor:   guard.user?.id ?? null,
    },
  })
  return NextResponse.json(row, { status: 201 })
}
