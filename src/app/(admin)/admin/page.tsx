import { auth } from "@/lib/auth"
import { getTenantPrisma, getTenantInfo } from "@/lib/tenant"
import Link from "next/link"

async function getDashboardData() {
  const prisma = await getTenantPrisma()

  const [
    totalNoticias,
    noticiasPendientes,
    totalDocumentos,
    pqrsPendientes,
    pqrsRecientes,
    totalUsuarios,
    totalSliders,
  ] = await Promise.all([
    prisma.noticia.count(),
    prisma.noticia.count({ where: { estado: "BORRADOR" } }),
    prisma.documento.count(),
    prisma.pQRS.count({ where: { estado: "RECIBIDA" } }),
    prisma.pQRS.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, radicado: true, tipo: true, estado: true,
        asunto: true, createdAt: true, nombreSolicitante: true,
      },
    }),
    prisma.usuario.count({ where: { activo: true } }),
    prisma.slider.count({ where: { activo: true } }),
  ])

  return { totalNoticias, noticiasPendientes, totalDocumentos, pqrsPendientes, pqrsRecientes, totalUsuarios, totalSliders }
}

const ESTADO_COLOR: Record<string, string> = {
  RECIBIDA:   "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  EN_PROCESO: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  RESPONDIDA: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  CERRADA:    "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  RECHAZADA:  "bg-red-50 text-red-700 ring-1 ring-red-200",
}

const TIPO_PQRS_LABEL: Record<string, string> = {
  PETICION:   "Petición",
  QUEJA:      "Queja",
  RECLAMO:    "Reclamo",
  SUGERENCIA: "Sugerencia",
  DENUNCIA:   "Denuncia",
  SOLICITUD:  "Solicitud",
}

export default async function AdminDashboard() {
  const [session, tenant, data] = await Promise.all([
    auth(),
    getTenantInfo(),
    getDashboardData(),
  ])

  const kpis = [
    {
      label:    "Noticias publicadas",
      value:    data.totalNoticias,
      sub:      data.noticiasPendientes > 0 ? `${data.noticiasPendientes} en borrador` : "Al día",
      subColor: data.noticiasPendientes > 0 ? "text-amber-500" : "text-emerald-500",
      href:     "/admin/noticias",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      bg: "bg-blue-500",
    },
    {
      label:    "Documentos",
      value:    data.totalDocumentos,
      sub:      "Total en repositorio",
      subColor: "text-slate-400",
      href:     "/admin/documentos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bg: "bg-violet-500",
    },
    {
      label:    "PQRSD pendientes",
      value:    data.pqrsPendientes,
      sub:      data.pqrsPendientes > 0 ? "Requieren atención" : "Sin pendientes",
      subColor: data.pqrsPendientes > 0 ? "text-amber-500" : "text-emerald-500",
      href:     "/admin/pqrs",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      bg: "bg-amber-500",
    },
    {
      label:    "Usuarios activos",
      value:    data.totalUsuarios,
      sub:      `${data.totalSliders} sliders activos`,
      subColor: "text-slate-400",
      href:     "/admin/usuarios",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bg: "bg-emerald-500",
    },
  ]

  const quickActions = [
    { label: "Nueva noticia",    href: "/admin/noticias/nueva",   icon: "📝" },
    { label: "Editar secciones", href: "/admin/paginas",          icon: "🧩" },
    { label: "Subir documento",  href: "/admin/documentos/subir", icon: "📎" },
    { label: "Configuración",    href: "/admin/configuracion",    icon: "⚙️" },
  ]

  return (
    <div className="space-y-6">
      {/* Encabezado de bienvenida */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">
          ¡Hola, {session?.user?.name?.split(" ")[0] ?? "Admin"}! 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {tenant?.nombre ?? "Panel de administración"}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center text-white shrink-0`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.subColor}`}>{kpi.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PQRSD recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">PQRSD recientes</h2>
            <Link href="/admin/pqrs" className="text-xs text-blue-600 hover:underline">Ver todas →</Link>
          </div>
          {data.pqrsRecientes.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">Sin solicitudes recientes</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.pqrsRecientes.map((pqrs) => (
                <div key={pqrs.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{pqrs.asunto}</p>
                    <p className="text-xs text-slate-400">
                      {TIPO_PQRS_LABEL[pqrs.tipo] ?? pqrs.tipo} · {pqrs.radicado}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${ESTADO_COLOR[pqrs.estado] ?? ""}`}>
                    {pqrs.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Acciones rápidas */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Acciones rápidas</h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-center"
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs font-medium text-slate-600">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Estado del sitio */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Estado del sitio</h2>
            </div>
            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="font-medium text-slate-800">{tenant?.plan ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  tenant?.activo && !tenant.suspendido
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}>
                  {tenant?.activo && !tenant?.suspendido ? "Activo" : "Suspendido"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Módulos activos</span>
                <span className="font-medium text-slate-800">
                  {tenant?.modulosActivos
                    ? Object.values(tenant.modulosActivos).filter(Boolean).length
                    : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
