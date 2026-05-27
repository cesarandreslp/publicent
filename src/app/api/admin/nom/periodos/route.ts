/**
 * /api/admin/nom/periodos — Periodos mensuales de nómina.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"
import { nomPeriodoCreateSchema, validateBody } from "@/lib/validations"

export async function GET() {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const prisma = await getTenantPrisma()
  const periodos = await prisma.nomNominaPeriodo.findMany({
    orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    take: 36,
    include: { _count: { select: { liquidaciones: true } } },
  })
  return NextResponse.json({ periodos })
}

export async function POST(req: Request) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(nomPeriodoCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const codigo = `${d.anio}-${String(d.mes).padStart(2, '0')}`
  const fechaInicio = new Date(Date.UTC(d.anio, d.mes - 1, 1))
  const fechaFin = new Date(Date.UTC(d.anio, d.mes, 0, 23, 59, 59))

  const prisma = await getTenantPrisma()
  try {
    const periodo = await prisma.nomNominaPeriodo.create({
      data: { codigo, anio: d.anio, mes: d.mes, fechaInicio, fechaFin, estado: 'ABIERTO' },
    })
    return NextResponse.json({ periodo }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Periodo "${codigo}" ya existe` }, { status: 409 })
    }
    console.error("[nom/periodos POST]", err)
    return NextResponse.json({ error: "Error al crear periodo" }, { status: 500 })
  }
}
