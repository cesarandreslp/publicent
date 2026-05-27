/**
 * /api/admin/cp/terceros — Auxiliares (NIT/CC).
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { cpTerceroCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const where: Prisma.CpAuxiliarTerceroWhereInput = { activo: true }
  if (q) {
    where.OR = [
      { documento: { contains: q, mode: 'insensitive' } },
      { razonSocial: { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const terceros = await prisma.cpAuxiliarTercero.findMany({
    where, orderBy: { razonSocial: 'asc' }, take: 200,
  })
  return NextResponse.json({ terceros })
}

export async function POST(req: Request) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(cpTerceroCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  try {
    const tercero = await prisma.cpAuxiliarTercero.create({
      data: {
        documento: d.documento,
        tipoDocumento: d.tipoDocumento,
        razonSocial: d.razonSocial,
        email: d.email ?? null,
        telefono: d.telefono ?? null,
        direccion: d.direccion ?? null,
        ciudad: d.ciudad ?? null,
        activo: d.activo ?? true,
      },
    })
    return NextResponse.json({ tercero }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Tercero "${d.documento}" ya existe` }, { status: 409 })
    }
    console.error("[cp/terceros POST]", err)
    return NextResponse.json({ error: "Error al crear tercero" }, { status: 500 })
  }
}
