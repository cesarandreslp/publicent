import { redirect } from "next/navigation"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"
import AdminsClient from "./admins-client"

export const metadata = { title: "Superadmins — OSS Innovation" }
export const dynamic = "force-dynamic"

export default async function AdminsPage() {
  const session = await getSASession()
  if (!session) redirect("/superadmin-login")

  const admins = await prismaMeta.superAdmin.findMany({
    select: { id: true, email: true, nombre: true, activo: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white">Superadmins de la plataforma</h1>
      <p className="text-sm text-slate-400 mt-1">Operadores de OSS Innovation con acceso a este panel.</p>
      <AdminsClient inicial={admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))} />
    </div>
  )
}
