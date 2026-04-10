import { prismaMeta } from "@/lib/prisma-meta"
import Link from "next/link"
import TenantActions from "@/components/admin/superadmin/tenant-actions"

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

const PLAN_COLORS: Record<string, string> = {
  BASICO:       "bg-slate-700 text-slate-300",
  ESTANDAR:     "bg-blue-900/50 text-blue-300",
  PROFESIONAL:  "bg-purple-900/50 text-purple-300",
  ENTERPRISE:   "bg-amber-900/50 text-amber-300",
}

const TIPO_SHORT: Record<string, string> = {
  PERSONERIA:  "Personería",
  CONTRALORIA: "Contraloría",
  ALCALDIA:    "Alcaldía",
  CONCEJO:     "Concejo",
  GOBERNACION: "Gobernación",
  ASAMBLEA:    "Asamblea",
  OTRO:        "Otra",
}

export default async function TenantsPage({ searchParams }: PageProps) {
  const { q = "", page = "1" } = await searchParams
  const perPage = 15
  const currentPage = Math.max(1, parseInt(page))
  const skip = (currentPage - 1) * perPage

  const where = q
    ? {
        OR: [
          { nombre:    { contains: q, mode: "insensitive" as const } },
          { slug:      { contains: q, mode: "insensitive" as const } },
          { municipio: { contains: q, mode: "insensitive" as const } },
          { codigo:    { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [tenants, total] = await Promise.all([
    prismaMeta.tenant.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, codigo: true, nombre: true, nombreCorto: true,
        tipoEntidad: true, municipio: true, departamento: true,
        dominioPrincipal: true, plan: true, activo: true, suspendido: true,
        emailContacto: true, createdAt: true,
      },
    }),
    prismaMeta.tenant.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    params.set("page", String(p))
    return `/superadmin/tenants?${params}`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Entidades / Tenants</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} entidad{total !== 1 ? "es" : ""} registrada{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/superadmin/tenants/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva entidad
        </Link>
      </div>

      {/* Buscador */}
      <form method="GET" action="/superadmin/tenants" className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, slug, municipio, código DIVIPOLA…"
          className="w-full pl-11 pr-4 py-3 bg-[#111827] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-sm"
        />
      </form>

      {/* Tabla */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        {tenants.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            {q ? `No se encontraron entidades para "${q}"` : "No hay entidades registradas."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-6 py-3 font-medium">Entidad</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Dominio</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Municipio</th>
                  <th className="text-left px-4 py-3 font-medium">Plan</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0 uppercase">
                          {(t.nombreCorto ?? t.nombre)[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{t.nombre}</p>
                          <p className="text-xs text-slate-500">{TIPO_SHORT[t.tipoEntidad] ?? t.tipoEntidad} · {t.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-slate-400">
                      <span className="truncate max-w-50 block">{t.dominioPrincipal}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-slate-400 text-xs">
                      {t.municipio}, {t.departamento}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PLAN_COLORS[t.plan] ?? "bg-slate-700 text-slate-300"}`}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {t.suspendido ? (
                        <span className="flex items-center gap-1.5 text-xs text-red-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          Suspendida
                        </span>
                      ) : t.activo ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Activa
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                        <Link
                          href={`/superadmin/tenants/${t.id}`}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <TenantActions tenantId={t.id} tenantName={t.nombre} activo={t.activo} suspendido={t.suspendido} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Mostrando {skip + 1}–{Math.min(skip + perPage, total)} de {total}
            </span>
            <div className="flex items-center gap-2">
              {currentPage > 1 && (
                <Link href={pageUrl(currentPage - 1)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                  ← Anterior
                </Link>
              )}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (p < 1 || p > totalPages) return null
                return (
                  <Link
                    key={p}
                    href={pageUrl(p)}
                    className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg transition ${
                      p === currentPage ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    {p}
                  </Link>
                )
              })}
              {currentPage < totalPages && (
                <Link href={pageUrl(currentPage + 1)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
