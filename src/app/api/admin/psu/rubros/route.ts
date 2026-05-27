/**
 * /api/admin/psu/rubros — Catálogo de rubros presupuestales.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { psuRubroCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const q = searchParams.get('q')?.trim()
  const soloMovimiento = searchParams.get('soloMovimiento') === '1'

  const where: Prisma.PsuRubroWhereInput = { activa: true }
  if (tipo) where.tipo = tipo as Prisma.PsuRubroWhereInput['tipo']
  if (soloMovimiento) where.permiteMovimientos = true
  if (q) {
    where.OR = [
      { codigo: { contains: q, mode: 'insensitive' } },
      { nombre: { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const rubros = await prisma.psuRubro.findMany({ where, orderBy: { codigo: 'asc' }, take: 500 })
  return NextResponse.json({ rubros })
}

export async function POST(req: Request) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(psuRubroCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  try {
    const rubro = await prisma.psuRubro.create({
      data: {
        codigo: d.codigo,
        nombre: d.nombre,
        tipo: d.tipo,
        nivel: d.nivel,
        fuente: d.fuente ?? null,
        programa: d.programa ?? null,
        proyecto: d.proyecto ?? null,
        parentId: d.parentId ?? null,
        permiteMovimientos: d.permiteMovimientos ?? false,
        activa: d.activa ?? true,
      },
    })
    return NextResponse.json({ rubro }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Rubro "${d.codigo}" ya existe` }, { status: 409 })
    }
    console.error("[psu/rubros POST]", err)
    return NextResponse.json({ error: "Error al crear rubro" }, { status: 500 })
  }
}
