/**
 * /api/admin/psu/obligaciones — Obligaciones (cuentas por pagar).
 * Afecta a un RP. Valida saldo del RP.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { psuObligacionCreateSchema, validateBody } from "@/lib/validations"
import { saldoRp } from "@/lib/presupuesto-saldos"

export async function GET(req: NextRequest) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const rpId = searchParams.get('rpId') ?? undefined

  const prisma = await getTenantPrisma()
  const obligaciones = await prisma.psuObligacion.findMany({
    where: { ...(rpId ? { rpId } : {}) },
    include: {
      rp: { select: { numero: true, tercero: { select: { razonSocial: true } } } },
      _count: { select: { pagos: true } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  })
  return NextResponse.json({ obligaciones })
}

export async function POST(req: Request) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(psuObligacionCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  const saldo = await saldoRp(prisma, d.rpId)
  if (!saldo) return NextResponse.json({ error: "RP no encontrado" }, { status: 404 })
  if (saldo.rp.estado === 'ANULADO') {
    return NextResponse.json({ error: "El RP está anulado" }, { status: 409 })
  }
  if (d.valor > saldo.disponible + 0.005) {
    return NextResponse.json(
      { error: `Saldo RP insuficiente. Disponible: ${saldo.disponible.toFixed(2)}` },
      { status: 409 }
    )
  }

  try {
    const obligacion = await prisma.psuObligacion.create({
      data: {
        numero: d.numero,
        fecha: new Date(d.fecha),
        rpId: d.rpId,
        valor: d.valor,
        concepto: d.concepto,
        creadoPor: guard.user?.id ?? null,
      },
    })
    return NextResponse.json({ obligacion }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Obligación "${d.numero}" ya existe` }, { status: 409 })
    }
    console.error("[psu/obligaciones POST]", err)
    return NextResponse.json({ error: "Error al crear obligación" }, { status: 500 })
  }
}
