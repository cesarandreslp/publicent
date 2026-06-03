import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"

/**
 * GET /api/admin/teso/saldos
 * Devuelve el saldo contable de cada cuenta activa calculado como:
 *   saldo = Σ INGRESO - Σ EGRESO (sobre todos los movimientos registrados)
 * Plus: movimientos pendientes de conciliar por cuenta.
 */
export async function GET() {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  const prisma = await getTenantPrisma()
  const cuentas = await prisma.tesoCuenta.findMany({
    where: { activa: true },
    orderBy: { nombre: 'asc' },
  })

  const saldos = await Promise.all(cuentas.map(async (c) => {
    const [ingresos, egresos, pendientes] = await Promise.all([
      prisma.tesoMovimiento.aggregate({
        where: { cuentaId: c.id, tipo: 'INGRESO' },
        _sum: { valor: true },
      }),
      prisma.tesoMovimiento.aggregate({
        where: { cuentaId: c.id, tipo: 'EGRESO' },
        _sum: { valor: true },
      }),
      prisma.tesoMovimiento.count({
        where: { cuentaId: c.id, conciliado: false },
      }),
    ])

    const totalIngresos = Number(ingresos._sum.valor ?? 0)
    const totalEgresos  = Number(egresos._sum.valor ?? 0)

    return {
      id:              c.id,
      nombre:          c.nombre,
      banco:           c.banco,
      numeroCuenta:    c.numeroCuenta,
      tipo:            c.tipo,
      saldo:           totalIngresos - totalEgresos,
      totalIngresos,
      totalEgresos,
      pendientesConciliar: pendientes,
    }
  }))

  const totalGeneral = saldos.reduce((acc, s) => acc + s.saldo, 0)
  return NextResponse.json({ cuentas: saldos, totalGeneral })
}
