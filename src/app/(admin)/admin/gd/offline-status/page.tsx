import { requireRoles } from "@/lib/authorization"
import OfflineStatusClient from "./client-page"

export const metadata = {
  title: "Estado Offline | Gestor Documental",
  description: "Estado de conexión y cola de sincronización offline",
}

export default async function OfflineStatusPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  return <OfflineStatusClient />
}
