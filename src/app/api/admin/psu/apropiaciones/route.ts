/**
 * /api/admin/psu/apropiaciones — Apropiación presupuestal por rubro y vigencia.
 * GET (?vigencia=YYYY) | POST (upsert por [rubroId, vigencia])
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { psuApropiacionCreateSchema, validateBody } from "@/lib/validations"

export async function GET(req: NextRequest) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const vigencia = Number(searchParams.get('vigencia') ?? new Date().getFullYear())

  const prisma = await getTenantPrisma()
  const apropiaciones = await prisma.psuApropiacion.findMany({
    where: { vigencia },
    include: { rubro: { select: { codigo: true, nombre: true, tipo: true } } },
    orderBy: { rubro: { codigo: 'asc' } },
    take: 1000,
  })
  return NextResponse.json({ vigencia, apropiaciones })
}

export async function POST(req: Request) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(psuApropiacionCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  const apropiacion = await prisma.psuApropiacion.upsert({
    where: { rubroId_vigencia: { rubroId: d.rubroId, vigencia: d.vigencia } },
    create: {
      rubroId: d.rubroId,
      vigencia: d.vigencia,
      apropiacionInicial: d.apropiacionInicial,
      adiciones: d.adiciones ?? 0,
      reducciones: d.reducciones ?? 0,
    },
    update: {
      apropiacionInicial: d.apropiacionInicial,
      adiciones: d.adiciones ?? 0,
      reducciones: d.reducciones ?? 0,
    },
  })
  return NextResponse.json({ apropiacion }, { status: 201 })
}
