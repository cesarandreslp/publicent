import { Metadata } from "next"
import { requireRoles } from "@/lib/authorization"
import { redirect } from "next/navigation"
import MipgEvidenciasClient from "./client-page"

export const metadata: Metadata = {
  title: "Bóveda de Evidencias MIPG | Admin",
  description: "Gestor centralizado de evidencias probatorias MIPG"
}

export default async function MipgEvidenciasPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  } catch {
    redirect("/admin")
  }

  return <MipgEvidenciasClient />
}
