/**
 * /api/admin/cp/periodos — Periodos contables.
 * GET  — lista periodos ordenados desc por (anio, mes).
 * POST — abre un periodo nuevo.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { cpPeriodoCreateSchema, validateBody } from "@/lib/validations"

export async function GET() {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const prisma = await getTenantPrisma()
  const periodos = await prisma.cpPeriodoContable.findMany({
    orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    include: { _count: { select: { comprobantes: true } } },
    take: 60,
  })
  return NextResponse.json({ periodos })
}

export async function POST(req: Request) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(cpPeriodoCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  try {
    const periodo = await prisma.cpPeriodoContable.create({
      data: {
        codigo: d.codigo,
        anio: d.anio,
        mes: d.mes ?? null,
        fechaInicio: new Date(d.fechaInicio),
        fechaFin: new Date(d.fechaFin),
        estado: 'ABIERTO',
      },
    })
    return NextResponse.json({ periodo }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Ya existe el periodo "${d.codigo}"` }, { status: 409 })
    }
    console.error("[cp/periodos POST]", err)
    return NextResponse.json({ error: "Error al crear periodo" }, { status: 500 })
  }
}
