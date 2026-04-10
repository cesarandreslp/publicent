import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import NuevoExpedienteClient from "./client-page"

export const metadata = { title: "Nuevo Expediente AGN | Gestor Documental" }

export default async function NuevoExpedientePage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  const prisma = await getTenantPrisma()

  // Cargar jerarquía TRD
  const dependencias = await prisma.gdTrdDependencia.findMany({
    include: {
      series: {
        include: {
          subseries: {
            include: { tiposDoc: true }
          }
        }
      }
    }
  })

  return <NuevoExpedienteClient dependencias={dependencias} />
}
