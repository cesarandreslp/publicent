import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import RentasClient from "./client-page"

export const metadata: Metadata = {
  title: "Rentas locales",
  description: "Gestión tributaria municipal — predial, ICA, estampillas y más",
}

export default async function RentasPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.RENTAS_LOCALES)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()
  const vigencia = new Date().getFullYear()

  const [conceptos, contribuyentes, liquidaciones, kpiAgg] = await Promise.all([
    prisma.renConcepto.findMany({
      where: { activo: true },
      include: { _count: { select: { liquidaciones: true } } },
      orderBy: { nombre: 'asc' },
    }),
    prisma.renContribuyente.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
      take: 500,
    }),
    prisma.renLiquidacion.findMany({
      where: { vigencia },
      include: {
        concepto:      { select: { nombre: true, tipo: true } },
        contribuyente: { select: { nombre: true, documento: true, razonSocial: true } },
        _count:        { select: { pagos: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.renLiquidacion.aggregate({
      where: { vigencia },
      _sum: { totalACobrar: true, totalPagado: true, saldo: true },
    }),
  ])

  return (
    <RentasClient
      conceptos={JSON.parse(JSON.stringify(conceptos))}
      contribuyentes={JSON.parse(JSON.stringify(contribuyentes))}
      liquidaciones={JSON.parse(JSON.stringify(liquidaciones))}
      vigencia={vigencia}
      kpis={{
        totalCobrar:    Number(kpiAgg._sum.totalACobrar ?? 0),
        totalRecaudado: Number(kpiAgg._sum.totalPagado  ?? 0),
        totalSaldo:     Number(kpiAgg._sum.saldo        ?? 0),
        pendientes:     liquidaciones.filter(l => l.estado === 'PENDIENTE').length,
        vencidas:       liquidaciones.filter(l => l.estado === 'VENCIDA').length,
      }}
    />
  )
}
