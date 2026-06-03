import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"
import { renPagoSchema, validateBody } from "@/lib/validations"

export async function POST(req: NextRequest) {
  const guard = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  const v = validateBody(renPagoSchema, await req.json())
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const liq = await prisma.renLiquidacion.findUnique({ where: { id: v.data.liquidacionId } })
  if (!liq) return NextResponse.json({ error: 'Liquidación no encontrada' }, { status: 404 })
  if (liq.estado === 'ANULADA') return NextResponse.json({ error: 'La liquidación está anulada' }, { status: 409 })
  if (liq.estado === 'PAGADA')  return NextResponse.json({ error: 'La liquidación ya está pagada' }, { status: 409 })

  const saldoActual = Number(liq.saldo)
  if (v.data.valor > saldoActual + 0.01) {
    return NextResponse.json({ error: `El valor del pago (${v.data.valor}) supera el saldo (${saldoActual.toFixed(2)})` }, { status: 409 })
  }

  const pago = await prisma.$transaction(async (tx) => {
    const p = await tx.renPago.create({
      data: {
        liquidacionId: v.data.liquidacionId,
        valor:         v.data.valor,
        fecha:         new Date(v.data.fecha),
        medioPago:     v.data.medioPago,
        referencia:    v.data.referencia ?? null,
        observacion:   v.data.observacion ?? null,
        creadoPor:     guard.user?.id ?? null,
      },
    })

    const nuevoTotalPagado = Number(liq.totalPagado) + v.data.valor
    const nuevoSaldo       = Number(liq.totalACobrar) - nuevoTotalPagado
    const nuevoEstado =
      nuevoSaldo <= 0.01   ? 'PAGADA' :
      nuevoTotalPagado > 0 ? 'PARCIAL' : liq.estado

    await tx.renLiquidacion.update({
      where: { id: v.data.liquidacionId },
      data: {
        totalPagado: nuevoTotalPagado,
        saldo:       Math.max(0, nuevoSaldo),
        estado:      nuevoEstado as never,
      },
    })
    return p
  })

  return NextResponse.json(pago, { status: 201 })
}
