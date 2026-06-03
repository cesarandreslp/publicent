import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { obtenerAuditoria, obtenerEstadisticasAuditoria } from "@/lib/auditoria"
import AuditoriaClient from "./client-page"

export const metadata: Metadata = {
  title: "Auditoría avanzada",
  description: "Registro de trazabilidad de acciones del sistema",
}

export default async function AuditoriaPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.AUDITORIA_AVANZADA)
  if (!activo) redirect("/admin")

  const [{ registros, total, paginas }, stats] = await Promise.all([
    obtenerAuditoria({ pagina: 1, limite: 50 }),
    obtenerEstadisticasAuditoria(30),
  ])

  return (
    <AuditoriaClient
      registros={JSON.parse(JSON.stringify(registros))}
      total={total}
      paginas={paginas}
      stats={JSON.parse(JSON.stringify(stats))}
    />
  )
}
