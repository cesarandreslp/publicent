import { requireRoles } from "@/lib/authorization"
import BiDashboardClient from "./client-page"

export const metadata = {
  title: "Dashboard BI | Gestor Documental",
  description: "Métricas de cumplimiento, productividad y proyección FURAG",
}

export default async function BiDashboardPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  return <BiDashboardClient />
}
