import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import ContratacionClient from "./client-page"

export const metadata: Metadata = {
  title: "Contratación pública",
  description: "Procesos contractuales Ley 80/1150",
}

export default async function ContratacionPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.CONTRATACION)
  if (!activo) redirect("/admin")

  const secopActivo = await isTenantModuleActive(MODULO_IDS.INTEGRACIONES_ESTADO)

  const prisma = await getTenantPrisma()
  const vigenciaActual = new Date().getFullYear()

  const [procesos, contratosRecientes] = await Promise.all([
    prisma.conProceso.findMany({
      where: { vigencia: vigenciaActual },
      include: { _count: { select: { contratos: true, documentos: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.conContrato.findMany({
      include: { proceso: { select: { numero: true, objeto: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  // KPIs
  const [totalProcesos, totalContratos, valorTotal] = await Promise.all([
    prisma.conProceso.count({ where: { vigencia: vigenciaActual } }),
    prisma.conContrato.count(),
    prisma.conContrato.aggregate({ _sum: { valorContrato: true, valorAdiciones: true } }),
  ])

  return (
    <ContratacionClient
      procesos={JSON.parse(JSON.stringify(procesos))}
      contratosRecientes={JSON.parse(JSON.stringify(contratosRecientes))}
      vigenciaActual={vigenciaActual}
      kpis={{
        totalProcesos,
        totalContratos,
        valorTotal: Number(valorTotal._sum.valorContrato ?? 0) + Number(valorTotal._sum.valorAdiciones ?? 0),
      }}
      secopActivo={secopActivo}
    />
  )
}
