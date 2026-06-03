/**
 * /admin/frisco — Dashboard del módulo FRISCO (bienes intervenidos).
 * Server component: precarga KPIs + primera página de bienes.
 */

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import FriscoDashboardClient from "./client-page"

export const metadata: Metadata = {
  title: "FRISCO — Bienes intervenidos",
  description: "Gestión de bienes con extinción de dominio o medida cautelar.",
}

export default async function FriscoPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }

  const activo = await isTenantModuleActive(MODULO_IDS.FRISCO_BIENES)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()

  const [total, enProceso, cautelar, extinto, devuelto, bienes] = await Promise.all([
    prisma.friscoBien.count(),
    prisma.friscoBien.count({ where: { estadoJuridico: "EN_PROCESO" } }),
    prisma.friscoBien.count({ where: { estadoJuridico: "CAUTELAR" } }),
    prisma.friscoBien.count({ where: { estadoJuridico: "EXTINTO" } }),
    prisma.friscoBien.count({ where: { estadoJuridico: "DEVUELTO" } }),
    prisma.friscoBien.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        _count: { select: { depositarios: true, contratos: true } },
        destinacion: { select: { tipo: true, fecha: true } },
      },
    }),
  ])

  const kpis = { total, enProceso, cautelar, extinto, devuelto }
  const bienesSerial = JSON.parse(JSON.stringify(bienes))

  return <FriscoDashboardClient kpis={kpis} bienesIniciales={bienesSerial} />
}
