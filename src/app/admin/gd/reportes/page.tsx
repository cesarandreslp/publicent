import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import ReportesClient from "./client-page"

export const metadata = {
  title: "Reportes | Gestor Documental",
  description: "Exportación de radicados y estadísticas del Gestor Documental",
}

export default async function ReportesPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])

  const prisma = await getTenantPrisma()

  const dependencias = await prisma.gdTrdDependencia.findMany({
    where: { activa: true },
    select: { id: true, codigo: true, nombre: true },
    orderBy: { codigo: "asc" },
  })

  // Stats rápidos
  const [totalRadicados, porTipo, porEstado] = await Promise.all([
    prisma.gdRadicado.count(),
    prisma.gdRadicado.groupBy({ by: ["tipo"], _count: true }),
    prisma.gdRadicado.groupBy({ by: ["estado"], _count: true }),
  ])

  return (
    <ReportesClient
      dependencias={dependencias}
      stats={{
        total: totalRadicados,
        porTipo: porTipo.map(g => ({ tipo: g.tipo, count: g._count })),
        porEstado: porEstado.map(g => ({ estado: g.estado, count: g._count })),
      }}
    />
  )
}
