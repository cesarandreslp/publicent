"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import Link from "next/link"
import {
  FileText, Inbox, Send, Clock, CheckCircle,
  Plus, Search, Download, BarChart2, RefreshCw,
  ChevronRight, ChevronLeft, AlertTriangle, Archive,
  Loader2, Filter, SlidersHorizontal
} from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Radicado {
  id: string
  numero: string
  tipo: string
  asunto: string
  estado: string
  prioridad: string
  createdAt: string
  fechaVencimiento?: string
  dependencia: { codigo: string; nombre: string }
  tramitador: { nombre: string; apellido: string; cargo?: string } | null
  remitentes: { nombre: string; tipoPersona: string }[]
  _count?: { documentos: number; transacciones: number }
}

interface KPIs {
  totalRadicados: number
  enTramite: number
  respondidos: number
  entradas: number
  salidas: number
}

interface Props {
  kpis: KPIs
  radicadosIniciales: Radicado[]
  dependencias: { id: string; codigo: string; nombre: string }[]
}

// ─── Helpers UI ──────────────────────────────────────────────────────────────

const TIPO_COLOR: Record<string, string> = {
  ENTRADA:    "bg-blue-500/20 text-blue-300 border-blue-500/30",
  SALIDA:     "bg-purple-500/20 text-purple-300 border-purple-500/30",
  INTERNO:    "bg-slate-500/20 text-slate-300 border-slate-500/30",
  PQRS:       "bg-orange-500/20 text-orange-300 border-orange-500/30",
  RESOLUCION: "bg-green-500/20 text-green-300 border-green-500/30",
  COMUNICADO: "bg-teal-500/20 text-teal-300 border-teal-500/30",
}

const ESTADO_COLOR: Record<string, string> = {
  RADICADO:       "bg-blue-500/20 text-blue-300",
  EN_TRAMITE:     "bg-yellow-500/20 text-yellow-300",
  PENDIENTE_VOBO: "bg-cyan-500/20 text-cyan-300",
  PENDIENTE_FIRMA:"bg-orange-500/20 text-orange-300",
  RESPONDIDO:     "bg-emerald-500/20 text-emerald-300",
  RESUELTO:       "bg-green-500/20 text-green-300",
  ARCHIVADO:      "bg-slate-500/20 text-slate-400",
  ANULADO:        "bg-red-500/20 text-red-300",
  DEVUELTO:       "bg-rose-500/20 text-rose-300",
  VOBO:           "bg-cyan-500/20 text-cyan-300",
}

const PRIORIDAD_DOT: Record<string, string> = {
  BAJA:    "bg-slate-400",
  NORMAL:  "bg-blue-400",
  ALTA:    "bg-orange-400",
  URGENTE: "bg-red-500 animate-pulse",
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

function isVencido(fechaVencimiento?: string, estado?: string) {
  if (!fechaVencimiento || estado === "RESPONDIDO" || estado === "ARCHIVADO") return false
  return new Date(fechaVencimiento) < new Date()
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function GestorDocumentalClient({ kpis, radicadosIniciales, dependencias }: Props) {
  // Estado de la bandeja
  const [radicados, setRadicados] = useState<Radicado[]>(radicadosIniciales)
  const [total, setTotal] = useState(kpis.totalRadicados)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(Math.ceil(kpis.totalRadicados / 25))
  const [isPending, startTransition] = useTransition()

  // Filtros
  const [busqueda, setBusqueda] = useState("")
  const [filtroTipo, setFiltroTipo] = useState("TODOS")
  const [filtroEstado, setFiltroEstado] = useState("TODOS")
  const [filtroDependencia, setFiltroDependencia] = useState("")
  const [showFiltros, setShowFiltros] = useState(false)

  // Cargar radicados desde la API real
  const cargarRadicados = useCallback((newPage = 1, resetPage = false) => {
    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          page: String(resetPage ? 1 : newPage),
          limit: "25",
        })
        if (busqueda.trim())    params.set("q",            busqueda.trim())
        if (filtroTipo !== "TODOS")   params.set("tipo",         filtroTipo)
        if (filtroEstado !== "TODOS") params.set("estado",       filtroEstado)
        if (filtroDependencia)        params.set("dependenciaId", filtroDependencia)

        const res = await fetch(`/api/admin/gd/radicados?${params}`)
        if (!res.ok) throw new Error("Error al cargar radicados")
        const data = await res.json()

        setRadicados(data.radicados)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        if (resetPage) setPage(1)
      } catch (err) {
        console.error("[GestorDocumental]", err)
      }
    })
  }, [busqueda, filtroTipo, filtroEstado, filtroDependencia])

  // Recarga cuando cambian filtros (debounce en búsqueda)
  useEffect(() => {
    const timer = setTimeout(() => cargarRadicados(1, true), busqueda ? 500 : 0)
    return () => clearTimeout(timer)
  }, [filtroTipo, filtroEstado, filtroDependencia, busqueda]) // eslint-disable-line

  // KPIs locales sumando vencidos
  const vencidos = radicados.filter(r => isVencido(r.fechaVencimiento, r.estado)).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* ── Header ── */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Gestor Documental
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Sistema de radicación oficial · AGN-compatible · Orfeo NG
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => cargarRadicados(page)}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/admin/gd/nuevo"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/30"
            >
              <Plus className="w-4 h-4" />
              Nuevo Radicado
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Total",       valor: kpis.totalRadicados, icon: FileText,     color: "from-blue-500 to-blue-700" },
            { label: "En Trámite",  valor: kpis.enTramite,      icon: Clock,        color: "from-amber-500 to-orange-600" },
            { label: "Respondidos", valor: kpis.respondidos,    icon: CheckCircle,  color: "from-emerald-500 to-green-600" },
            { label: "Entradas",    valor: kpis.entradas,       icon: Inbox,        color: "from-indigo-500 to-blue-600" },
            { label: "Salidas",     valor: kpis.salidas,        icon: Send,         color: "from-purple-500 to-violet-600" },
            { label: "Vencidos",    valor: vencidos,            icon: AlertTriangle,color: "from-red-500 to-rose-600" },
          ].map(({ label, valor, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-2 shadow-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{valor.toLocaleString()}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Barra de búsqueda y filtros ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              {isPending && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
              )}
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar número, asunto, remitente..."
                className="w-full pl-9 pr-9 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Filtro Tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos los tipos</option>
              {["ENTRADA", "SALIDA", "INTERNO", "PQRS", "RESOLUCION", "COMUNICADO"].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Filtro Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos los estados</option>
              {["RADICADO", "EN_TRAMITE", "PENDIENTE_VOBO", "PENDIENTE_FIRMA", "RESPONDIDO", "RESUELTO", "ARCHIVADO", "ANULADO", "DEVUELTO"].map(e => (
                <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
              ))}
            </select>

            {/* Filtro Dependencia */}
            <button
              onClick={() => setShowFiltros(v => !v)}
              className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition-all ${
                showFiltros || filtroDependencia
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                  : "bg-white/5 border-white/15 text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {filtroDependencia ? "Filtro activo" : "Dependencia"}
            </button>

            <span className="text-slate-400 text-sm ml-auto">
              {isPending ? "Cargando..." : `${total.toLocaleString()} radicado(s)`}
            </span>
          </div>

          {/* Filtro dependencia expandible */}
          {showFiltros && (
            <div className="pt-2 border-t border-white/10">
              <select
                value={filtroDependencia}
                onChange={(e) => setFiltroDependencia(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Todas las dependencias</option>
                {dependencias.map(d => (
                  <option key={d.id} value={d.id}>{d.codigo} — {d.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Tabla de Radicados ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Número</th>
                  <th className="px-5 py-3 text-left">Tipo</th>
                  <th className="px-5 py-3 text-left">Asunto / Dependencia</th>
                  <th className="px-5 py-3 text-left">Remitente</th>
                  <th className="px-5 py-3 text-left">Tramitador</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Radicado</th>
                  <th className="px-5 py-3 text-left">Vence</th>
                  <th className="px-5 py-3 text-center">Docs</th>
                  <th className="px-5 py-3 text-center">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isPending ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-16 text-center">
                      <Loader2 className="w-8 h-8 mx-auto text-blue-400 animate-spin mb-2" />
                      <p className="text-slate-400 text-sm">Cargando radicados...</p>
                    </td>
                  </tr>
                ) : radicados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-16 text-center text-slate-500">
                      <Archive className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No hay radicados con los filtros aplicados</p>
                    </td>
                  </tr>
                ) : (
                  radicados.map((r) => {
                    const vence = isVencido(r.fechaVencimiento, r.estado)
                    return (
                      <tr key={r.id} className={`hover:bg-white/5 transition-colors group ${vence ? "bg-red-500/5" : ""}`}>

                        {/* Número */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORIDAD_DOT[r.prioridad] ?? "bg-gray-400"}`} />
                            <span className="font-mono text-cyan-400 font-semibold text-xs whitespace-nowrap">{r.numero}</span>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${TIPO_COLOR[r.tipo] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
                            {r.tipo}
                          </span>
                        </td>

                        {/* Asunto */}
                        <td className="px-5 py-3 max-w-[220px]">
                          <p className="truncate text-white text-sm">{r.asunto}</p>
                          <p className="text-slate-500 text-xs">{r.dependencia?.codigo} — {r.dependencia?.nombre}</p>
                        </td>

                        {/* Remitente */}
                        <td className="px-5 py-3 text-slate-300 text-xs">
                          {r.remitentes.length > 1
                            ? <span className="text-slate-400">{r.remitentes.length} remitentes</span>
                            : r.remitentes[0]?.nombre ?? <span className="text-slate-600">—</span>}
                        </td>

                        {/* Tramitador */}
                        <td className="px-5 py-3 text-slate-300 text-xs whitespace-nowrap">
                          {r.tramitador
                            ? `${r.tramitador.nombre} ${r.tramitador.apellido}`
                            : <span className="text-yellow-600 italic">Sin asignar</span>}
                        </td>

                        {/* Estado */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            {vence && <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[r.estado] ?? "bg-gray-500/20 text-gray-400"}`}>
                              {r.estado.replace(/_/g, " ")}
                            </span>
                          </div>
                        </td>

                        {/* Fecha radicación */}
                        <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                          {formatFecha(r.createdAt)}
                        </td>

                        {/* Fecha vencimiento */}
                        <td className="px-5 py-3 text-xs whitespace-nowrap">
                          {r.fechaVencimiento
                            ? <span className={vence ? "text-red-400 font-semibold" : "text-slate-400"}>
                                {formatFecha(r.fechaVencimiento)}
                              </span>
                            : <span className="text-slate-600">—</span>}
                        </td>

                        {/* Docs count */}
                        <td className="px-5 py-3 text-center">
                          <span className="text-xs text-slate-500">
                            {r._count?.documentos ?? 0}
                          </span>
                        </td>

                        {/* Acción */}
                        <td className="px-5 py-3 text-center">
                          <Link
                            href={`/admin/gd/${r.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-medium transition-all"
                          >
                            Ver <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Paginación ── */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Página <span className="text-white font-semibold">{page}</span> de{" "}
                <span className="text-white font-semibold">{totalPages}</span>
                {" "}· {total.toLocaleString()} radicados
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { const p = page - 1; setPage(p); cargarRadicados(p) }}
                  disabled={page === 1 || isPending}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <button
                  onClick={() => { const p = page + 1; setPage(p); cargarRadicados(p) }}
                  disabled={page === totalPages || isPending}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Accesos rápidos ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { href: "/admin/gd/nuevo",       icon: Plus,     title: "Nuevo Radicado",   desc: "Criar radicado con número AGN oficial", color: "from-blue-600 to-cyan-600" },
            { href: "/admin/gd/trd",          icon: BarChart2,title: "Gestionar TRD",    desc: "Dependencias, series y subseries",      color: "from-emerald-600 to-teal-600" },
            { href: "/admin/gd/expedientes",  icon: Archive,  title: "Expedientes",      desc: "Gestión de expedientes AGN",            color: "from-violet-600 to-purple-600" },
            { href: "/admin/gd/reportes",     icon: Download, title: "Exportar Reporte", desc: "CSV/Excel con filtros",                 color: "from-orange-600 to-red-600" },
          ].map(({ href, icon: Icon, title, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:border-white/20"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-blue-300 transition-colors text-sm">{title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 ml-auto transition-all" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
