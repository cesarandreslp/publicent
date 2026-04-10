import { Metadata } from "next"
import { requireRoles } from "@/lib/authorization"
import { redirect } from "next/navigation"
import MipgClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Dashboard MIPG | Admin Personería Buga",
  description: "Modelo Integrado de Planeación y Gestión - Dashboard Analítico"
}

export default async function MipgPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN"])
  } catch {
    redirect("/admin")
  }

  return <MipgClientPage />
}
