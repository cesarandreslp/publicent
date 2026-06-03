/**
 * /admin/reportes-control — Generador y bitácora de reportes a entes de control.
 */
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import ReportesControlClient from "./client-page"

export const metadata: Metadata = {
  title: "Reportes a entes de control",
  description: "CHIP, FUT, Ley 617",
}

export default async function ReportesControlPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.REPORTES_CONTROL)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()
  const [periodos, reportes] = await Promise.all([
    prisma.cpPeriodoContable.findMany({ orderBy: [{ anio: 'desc' }, { mes: 'desc' }], take: 24,
      select: { id: true, codigo: true, anio: true, mes: true, estado: true } }),
    prisma.rcReporteGenerado.findMany({
      orderBy: { generadoEn: 'desc' }, take: 60,
      select: { id: true, tipo: true, vigencia: true, periodoContableId: true, totales: true, generadoEn: true, observacion: true },
    }),
  ])

  return <ReportesControlClient
    periodos={JSON.parse(JSON.stringify(periodos))}
    reportes={JSON.parse(JSON.stringify(reportes))}
    vigenciaActual={new Date().getFullYear()}
  />
}
