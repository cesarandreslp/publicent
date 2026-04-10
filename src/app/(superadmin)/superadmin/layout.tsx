import { redirect } from "next/navigation"
import { getSASession } from "@/lib/superadmin-auth"
import SuperAdminSidebar from "@/components/admin/superadmin/sidebar"

export const metadata = { title: "PublicEnt Admin — Panel de Plataforma" }

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSASession()
  if (!session) redirect("/superadmin-login")

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex text-white">
      <SuperAdminSidebar admin={session} />

      {/* Área de contenido */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-[#0a0f1e]/80 backdrop-blur-sm border-b border-slate-800">
          <h1 className="text-sm font-medium text-slate-400">
            Panel de Administración de Plataforma
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{session.email}</span>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold uppercase">
              {session.nombre?.[0] ?? "SA"}
            </div>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
