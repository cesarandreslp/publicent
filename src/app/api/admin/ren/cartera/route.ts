import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireRentasLocales } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireRentasLocales(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error
  void req

  const prisma = await getTenantPrisma()

  const [kpis, vencidas, porConcepto] = await Promise.all([
    Promise.all([
      prisma.renLiquidacion.aggregate({ _sum: { totalACobrar: true, totalPagado: true, saldo: true } }),
      prisma.renLiquidacion.count({ where: { estado: 'PENDIENTE' } }),
      prisma.renLiquidacion.count({ where: { estado: 'VENCIDA'  } }),
      prisma.renLiquidacion.count({ where: { estado: 'PAGADA'   } }),
    ]),
    prisma.renLiquidacion.findMany({
      where: {
        estado: { in: ['PENDIENTE', 'PARCIAL'] },
        fechaVencimiento: { lt: new Date() },
      },
      include: {
        contribuyente: { select: { nombre: true, documento: true } },
        concepto:      { select: { nombre: true } },
      },
      orderBy: { fechaVencimiento: 'asc' },
      take: 50,
    }),
    prisma.renLiquidacion.groupBy({
      by: ['conceptoId'],
      _sum: { saldo: true, totalACobrar: true },
      where: { estado: { notIn: ['ANULADA', 'PAGADA'] } },
    }),
  ])

  const [aggs, pendientes, vencidasCount, pagadas] = kpis

  return NextResponse.json({
    totalCobrar:   Number(aggs._sum.totalACobrar ?? 0),
    totalRecaudado: Number(aggs._sum.totalPagado  ?? 0),
    totalSaldo:    Number(aggs._sum.saldo         ?? 0),
    pendientes,
    vencidas:      vencidasCount,
    pagadas,
    liquidacionesVencidas: vencidas,
    porConcepto,
  })
}
