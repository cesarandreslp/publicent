import { redirect } from "next/navigation"
import Link from "next/link"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"

export const metadata = { title: "Auditoría — Superadmin" }
export const dynamic = "force-dynamic"

export default async function AuditoriaPage() {
  const session = await getSASession()
  if (!session) redirect("/superadmin-login")

  const eventos = await prismaMeta.eventoTenant.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: { tenant: { select: { nombre: true, slug: true } } },
  })

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white">Auditoría de la plataforma</h1>
      <p className="text-sm text-slate-400 mt-1">Eventos de todos los tenants (activación, módulos, aprovisionamiento, configuración).</p>

      <div className="mt-6 border border-slate-800 rounded-2xl overflow-hidden bg-[#111827]">
        {eventos.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-10">Sin eventos registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900/60 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Entidad</th>
                <th className="px-4 py-3 text-left">Evento</th>
                <th className="px-4 py-3 text-left">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {eventos.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30">
                  <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleString("es-CO", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-2.5 text-slate-300">{e.tenant?.nombre ?? e.tenantId}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{e.tipo}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{e.descripcion ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4">
        <Link href="/superadmin/tenants" className="text-sm text-slate-400 hover:text-white">← Tenants</Link>
      </div>
    </div>
  )
}
