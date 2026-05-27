/**
 * /api/admin/nom/empleados — CRUD de empleados.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"
import { nomEmpleadoCreateSchema, validateBody } from "@/lib/validations"
import type { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const activo = searchParams.get('activo')
  const tipo = searchParams.get('tipoVinculacion')

  const where: Prisma.NomEmpleadoWhereInput = {}
  if (activo !== null) where.activo = activo === '1'
  if (tipo) where.tipoVinculacion = tipo as Prisma.NomEmpleadoWhereInput['tipoVinculacion']
  if (q) {
    where.OR = [
      { documento: { contains: q, mode: 'insensitive' } },
      { primerNombre: { contains: q, mode: 'insensitive' } },
      { primerApellido: { contains: q, mode: 'insensitive' } },
      { cargo: { contains: q, mode: 'insensitive' } },
    ]
  }

  const prisma = await getTenantPrisma()
  const empleados = await prisma.nomEmpleado.findMany({
    where,
    orderBy: [{ activo: 'desc' }, { primerApellido: 'asc' }],
    take: 200,
  })
  return NextResponse.json({ empleados })
}

export async function POST(req: Request) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(nomEmpleadoCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  try {
    const empleado = await prisma.nomEmpleado.create({
      data: {
        documento: d.documento,
        tipoDocumento: d.tipoDocumento,
        primerNombre: d.primerNombre,
        segundoNombre: d.segundoNombre ?? null,
        primerApellido: d.primerApellido,
        segundoApellido: d.segundoApellido ?? null,
        email: d.email ?? null,
        telefono: d.telefono ?? null,
        cargo: d.cargo,
        dependencia: d.dependencia ?? null,
        tipoVinculacion: d.tipoVinculacion,
        fechaIngreso: new Date(d.fechaIngreso),
        salarioBasico: d.salarioBasico,
        cuentaBanco: d.cuentaBanco ?? null,
        bancoNombre: d.bancoNombre ?? null,
        tipoCuenta: d.tipoCuenta ?? null,
        eps: d.eps ?? null,
        afp: d.afp ?? null,
        arl: d.arl ?? null,
        cajaCompensacion: d.cajaCompensacion ?? null,
        retencionFuenteAplica: d.retencionFuenteAplica ?? true,
      },
    })
    return NextResponse.json({ empleado }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Empleado con documento "${d.documento}" ya existe` }, { status: 409 })
    }
    console.error("[nom/empleados POST]", err)
    return NextResponse.json({ error: "Error al crear empleado" }, { status: 500 })
  }
}
