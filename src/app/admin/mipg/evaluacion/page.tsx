import { Metadata } from "next"
import { requireRoles } from "@/lib/authorization"
import { redirect } from "next/navigation"
import MipgEvaluacionClient from "./client-page"

export const metadata: Metadata = {
  title: "Autodiagnóstico Institucional | Admin",
  description: "Matriz de evaluación de políticas institucionales - Sistema MIPG"
}

export default async function MipgEvaluacionPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN"])
  } catch {
    redirect("/admin/mipg")
  }

  return <MipgEvaluacionClient />
}
