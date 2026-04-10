import { requireRoles } from "@/lib/authorization"
import ApiKeysClient from "./client-page"

export const metadata = {
  title: "API Keys | Gestor Documental",
  description: "Gestión de claves de acceso para la API pública REST",
}

export default async function ApiKeysPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN"])
  return <ApiKeysClient />
}
