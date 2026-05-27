/**
 * /api/admin/psu/cdp — Certificados de Disponibilidad Presupuestal.
 * POST valida que el rubro tenga apropiación disponible para la vigencia.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { psuCdpCreateSchema, validateBody } from "@/lib/validations"
import { saldoApropiacion } from "@/lib/presupuesto-saldos"

export async function GET(req: NextRequest) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const vigencia = searchParams.get('vigencia')
  const rubroId = searchParams.get('rubroId') ?? undefined

  const prisma = await getTenantPrisma()
  const cdps = await prisma.psuCdp.findMany({
    where: {
      ...(vigencia ? { vigencia: Number(vigencia) } : {}),
      ...(rubroId ? { rubroId } : {}),
    },
    include: {
      rubro: { select: { codigo: true, nombre: true } },
      _count: { select: { rps: true } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  })
  return NextResponse.json({ cdps })
}

export async function POST(req: Request) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(psuCdpCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  const saldo = await saldoApropiacion(prisma, d.rubroId, d.vigencia)
  if (!saldo.existe) {
    return NextResponse.json({ error: "El rubro no tiene apropiación para esta vigencia" }, { status: 400 })
  }
  if (d.valor > saldo.disponible + 0.005) {
    return NextResponse.json(
      { error: `Saldo insuficiente. Disponible: ${saldo.disponible.toFixed(2)}` },
      { status: 409 }
    )
  }

  try {
    const cdp = await prisma.psuCdp.create({
      data: {
        numero: d.numero,
        fecha: new Date(d.fecha),
        vigencia: d.vigencia,
        rubroId: d.rubroId,
        valor: d.valor,
        objeto: d.objeto,
        creadoPor: guard.user?.id ?? null,
      },
    })
    return NextResponse.json({ cdp }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `CDP "${d.numero}" ya existe` }, { status: 409 })
    }
    console.error("[psu/cdp POST]", err)
    return NextResponse.json({ error: "Error al crear CDP" }, { status: 500 })
  }
}
