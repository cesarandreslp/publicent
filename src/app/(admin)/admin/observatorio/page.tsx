import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import ObservatorioClient from "./client-page"

export const metadata: Metadata = {
  title: "Observatorio de indicadores",
  description: "Gestión y publicación de indicadores de gestión institucional",
}

export default async function ObservatorioPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.OBSERVATORIO)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()
  const indicadores = await prisma.obsIndicador.findMany({
    include: {
      mediciones: { orderBy: { fecha: 'desc' }, take: 24 },
      _count: { select: { mediciones: true } },
    },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
  })

  const kpis = {
    total:      indicadores.length,
    publicados: indicadores.filter(i => i.publicado).length,
    enMeta:     indicadores.filter(i => {
      if (i.valorActual == null) return false
      const v = Number(i.valorActual)
      const m = Number(i.meta)
      if (i.metaTipo === 'MAYOR_ES_MEJOR') return v >= m
      if (i.metaTipo === 'MENOR_ES_MEJOR') return v <= m
      return Math.abs(v - m) / m <= 0.05
    }).length,
  }

  return (
    <ObservatorioClient
      indicadores={JSON.parse(JSON.stringify(indicadores))}
      kpis={kpis}
    />
  )
}
