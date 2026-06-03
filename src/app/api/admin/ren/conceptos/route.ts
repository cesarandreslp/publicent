import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"
import { renConceptoCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const { error } = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error
  void req
  const prisma = await getTenantPrisma()
  const rows = await prisma.renConcepto.findMany({
    include: { _count: { select: { liquidaciones: true } } },
    orderBy: { nombre: 'asc' },
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const guard = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const body = await req.json()
  const v = validateBody(renConceptoCreateSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()
  const existe = await prisma.renConcepto.findUnique({ where: { codigo: v.data.codigo } })
  if (existe) return NextResponse.json({ error: 'Código ya en uso' }, { status: 409 })

  const row = await prisma.renConcepto.create({
    data: {
      codigo:       v.data.codigo,
      nombre:       v.data.nombre,
      descripcion:  v.data.descripcion ?? null,
      tipo:         v.data.tipo,
      periodicidad: v.data.periodicidad,
      tasaBase:     v.data.tasaBase ?? null,
      activo:       v.data.activo ?? true,
      creadoPor:    guard.user?.id ?? null,
    },
  })
  return NextResponse.json(row, { status: 201 })
}
