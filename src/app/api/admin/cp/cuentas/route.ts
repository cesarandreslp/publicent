/**
 * /api/admin/cp/cuentas — Plan Único de Cuentas.
 * GET  — lista plana o jerárquica (?tree=1) con filtro de búsqueda y tipo.
 * POST — crea una cuenta (sólo cuentas hoja deben tener permiteMovimientos=true).
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { cpCuentaCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const tipo = searchParams.get('tipo')
  const soloMovimiento = searchParams.get('soloMovimiento') === '1'

  const where: Prisma.CpPlanCuentaWhereInput = { activa: true }
  if (tipo) where.tipo = tipo as Prisma.CpPlanCuentaWhereInput['tipo']
  if (soloMovimiento) where.permiteMovimientos = true
  if (q) {
    where.OR = [
      { codigo: { contains: q, mode: 'insensitive' } },
      { nombre: { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const cuentas = await prisma.cpPlanCuenta.findMany({
    where,
    orderBy: { codigo: 'asc' },
    take: 500,
  })
  return NextResponse.json({ cuentas })
}

export async function POST(req: Request) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(cpCuentaCreateSchema, body)
  if (!v.success) return v.response
  const data = v.data

  const prisma = await getTenantPrisma()
  try {
    const cuenta = await prisma.cpPlanCuenta.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        nivel: data.nivel,
        naturaleza: data.naturaleza,
        tipo: data.tipo,
        parentId: data.parentId ?? null,
        permiteMovimientos: data.permiteMovimientos ?? false,
        activa: data.activa ?? true,
      },
    })
    return NextResponse.json({ cuenta }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Ya existe la cuenta "${data.codigo}"` }, { status: 409 })
    }
    console.error("[cp/cuentas POST]", err)
    return NextResponse.json({ error: "Error al crear cuenta" }, { status: 500 })
  }
}
