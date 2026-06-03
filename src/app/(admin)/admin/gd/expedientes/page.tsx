import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import ExpedientesClient from "./client-page"

export const metadata = { title: "Expedientes AGN | Gestor Documental" }

export default async function ExpedientesPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  const prisma = await getTenantPrisma()

  // Lista de expedientes
  const expedientes = await prisma.gdExpediente.findMany({
    include: {
      dependencia: true,
      serie: true,
      subserie: true,
      _count: { select: { radicados: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return <ExpedientesClient expedientes={expedientes} />
}
