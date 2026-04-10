import { prismaMeta } from "@/lib/prisma-meta"
import { getSASession } from "@/lib/superadmin-auth"
import Link from "next/link"

async function getStats() {
  const [totalTenants, activos, suspendidos, porPlan] = await Promise.all([
    prismaMeta.tenant.count(),
    prismaMeta.tenant.count({ where: { activo: true, suspendido: false } }),
    prismaMeta.tenant.count({ where: { suspendido: true } }),
    prismaMeta.tenant.groupBy({ by: ["plan"], _count: { id: true } }),
  ])

  const recientes = await prismaMeta.tenant.findMany({
    orderBy: { createdAt: "desc" },
    take:    6,
    select: {
      id: true, slug: true, nombre: true, nombreCorto: true,
      tipoEntidad: true, plan: true, activo: true, suspendido: true, createdAt: true,
    },
  })

  return { totalTenants, activos, suspendidos, porPlan, recientes }
}

const PLAN_COLORS: Record<string, string> = {
  BASICO:       "bg-slate-700 text-slate-300",
  ESTANDAR:     "bg-blue-900/50 text-blue-300",
  PROFESIONAL:  "bg-purple-900/50 text-purple-300",
  ENTERPRISE:   "bg-amber-900/50 text-amber-300",
}

const TIPO_LABEL: Record<string, string> = {
  PERSONERIA:  "Personería",
  CONTRALORIA: "Contraloría",
  ALCALDIA:    "Alcaldía",
  CONCEJO:     "Concejo",
  GOBERNACION: "Gobernación",
  ASAMBLEA:    "Asamblea",
  OTRO:        "Otra",
}

export default async function SuperAdminDashboard() {
  const [session, stats] = await Promise.all([getSASession(), getStats()])

  const hora = new Date().getHours()
  const saludo = hora < 12 ? "Buenos días" : hora < 18 ? "Buenas tardes" : "Buenas noches"

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {saludo}, {session?.nombre?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Resumen general de la plataforma PublicEnt · Colombia
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total entidades",
            value: stats.totalTenants,
            icon: "🏛️",
            color: "from-blue-600/20 to-blue-800/10 border-blue-800/30",
          },
          {
            label: "Activas",
            value: stats.activos,
            icon: "✅",
            color: "from-emerald-600/20 to-emerald-800/10 border-emerald-800/30",
          },
          {
            label: "Suspendidas",
            value: stats.suspendidos,
            icon: "⚠️",
            color: "from-amber-600/20 to-amber-800/10 border-amber-800/30",
          },
          {
            label: "Planes activos",
            value: stats.porPlan.length,
            icon: "📊",
            color: "from-purple-600/20 to-purple-800/10 border-purple-800/30",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`bg-linear-to-br ${card.color} border rounded-2xl p-5`}
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-slate-400 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Distribución por plan */}
      {stats.porPlan.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Distribución por plan
          </h2>
          <div className="flex flex-wrap gap-3">
            {stats.porPlan.map((p) => (
              <div
                key={p.plan}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${PLAN_COLORS[p.plan] ?? "bg-slate-800 text-slate-300"}`}
              >
                <span>{p.plan}</span>
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                  {p._count.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Entidades recientes */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Entidades recientes
          </h2>
          <Link
            href="/superadmin/tenants"
            className="text-xs text-blue-400 hover:text-blue-300 transition"
          >
            Ver todas →
          </Link>
        </div>

        <div className="divide-y divide-slate-800">
          {stats.recientes.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500 text-sm">
              No hay entidades registradas aún.{" "}
              <Link href="/superadmin/tenants/nuevo" className="text-blue-400 hover:underline">
                Registrar la primera
              </Link>
            </div>
          ) : (
            stats.recientes.map((t) => (
              <Link
                key={t.id}
                href={`/superadmin/tenants/${t.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0 uppercase">
                    {t.nombreCorto?.[0] ?? t.nombre[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.nombre}</p>
                    <p className="text-xs text-slate-500">{TIPO_LABEL[t.tipoEntidad] ?? t.tipoEntidad} · {t.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLORS[t.plan] ?? "bg-slate-700 text-slate-300"}`}>
                    {t.plan}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${t.activo && !t.suspendido ? "bg-emerald-400" : "bg-red-400"}`} />
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800">
          <Link
            href="/superadmin/tenants/nuevo"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Registrar nueva entidad
          </Link>
        </div>
      </div>
    </div>
  )
}
