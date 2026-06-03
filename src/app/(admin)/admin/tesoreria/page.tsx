import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import TesoreriaClient from "./client-page"

export const metadata: Metadata = {
  title: "Tesorería",
  description: "Cuentas bancarias, movimientos y conciliación",
}

export default async function TesoreriaPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.TESORERIA)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()

  const [cuentas, movimientosRecientes] = await Promise.all([
    prisma.tesoCuenta.findMany({
      orderBy: [{ activa: 'desc' }, { nombre: 'asc' }],
    }),
    prisma.tesoMovimiento.findMany({
      orderBy: [{ fecha: 'desc' }, { createdAt: 'desc' }],
      take: 80,
    }),
  ])

  // Calcular saldos por cuenta en paralelo
  const saldosPorCuenta: Record<string, number> = {}
  await Promise.all(cuentas.map(async (c) => {
    const [ing, eg] = await Promise.all([
      prisma.tesoMovimiento.aggregate({ where: { cuentaId: c.id, tipo: 'INGRESO' }, _sum: { valor: true } }),
      prisma.tesoMovimiento.aggregate({ where: { cuentaId: c.id, tipo: 'EGRESO'  }, _sum: { valor: true } }),
    ])
    saldosPorCuenta[c.id] = Number(ing._sum.valor ?? 0) - Number(eg._sum.valor ?? 0)
  }))

  return (
    <TesoreriaClient
      cuentas={JSON.parse(JSON.stringify(cuentas))}
      movimientosRecientes={JSON.parse(JSON.stringify(movimientosRecientes))}
      saldosPorCuenta={saldosPorCuenta}
    />
  )
}
