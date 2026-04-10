"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Download, FileText, BarChart2, Filter,
  Calendar, ArrowLeft, Loader2, PieChart
} from "lucide-react"

interface Props {
  dependencias: { id: string; codigo: string; nombre: string }[]
  stats: {
    total: number
    porTipo: { tipo: string; count: number }[]
    porEstado: { estado: string; count: number }[]
  }
}

const TIPO_COLOR: Record<string, string> = {
  ENTRADA: "bg-blue-500", SALIDA: "bg-purple-500", INTERNO: "bg-slate-500",
  PQRS: "bg-orange-500", RESOLUCION: "bg-green-500", COMUNICADO: "bg-teal-500",
}

const ESTADO_COLOR: Record<string, string> = {
  EN_TRAMITE: "bg-yellow-500", PENDIENTE_VOBO: "bg-cyan-500", PENDIENTE_FIRMA: "bg-orange-500",
  RESPONDIDO: "bg-emerald-500", ARCHIVADO: "bg-slate-500", ANULADO: "bg-red-500",
  RADICADO: "bg-blue-500", RESUELTO: "bg-green-500", DEVUELTO: "bg-red-400",
}

export default function ReportesClient({ dependencias, stats }: Props) {
  const [filtros, setFiltros] = useState({
    tipo: "", estado: "", desde: "", hasta: "", dependenciaId: "",
  })
  const [descargando, setDescargando] = useState(false)

  const descargarCSV = async () => {
    setDescargando(true)
    try {
      const params = new URLSearchParams({ formato: "csv" })
      if (filtros.tipo) params.set("tipo", filtros.tipo)
      if (filtros.estado) params.set("estado", filtros.estado)
      if (filtros.desde) params.set("desde", filtros.desde)
      if (filtros.hasta) params.set("hasta", filtros.hasta)
      if (filtros.dependenciaId) params.set("dependenciaId", filtros.dependenciaId)

      const res = await fetch(`/api/admin/gd/reportes?${params}`)
      if (!res.ok) throw new Error("Error al generar reporte")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `radicados_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert("Error al descargar reporte")
    } finally {
      setDescargando(false)
    }
  }

  const maxTipo = Math.max(...stats.porTipo.map(t => t.count), 1)
  const maxEstado = Math.max(...stats.porEstado.map(e => e.count), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/gd" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Reportes y Exportación
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                {stats.total.toLocaleString()} radicados totales en el sistema
              </p>
            </div>
          </div>
          <button
            onClick={descargarCSV}
            disabled={descargando}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl font-semibold transition-all shadow-lg shadow-orange-900/30 text-sm disabled:opacity-50"
          >
            {descargando
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Por Tipo */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-400" /> Por Tipo de Radicado
            </h3>
            <div className="space-y-3">
              {stats.porTipo.map(({ tipo, count }) => (
                <div key={tipo} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 truncate">{tipo}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${TIPO_COLOR[tipo] ?? "bg-gray-500"} transition-all`}
                      style={{ width: `${(count / maxTipo) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Por Estado */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" /> Por Estado
            </h3>
            <div className="space-y-3">
              {stats.porEstado.map(({ estado, count }) => (
                <div key={estado} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-32 truncate">{estado.replace(/_/g, " ")}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ESTADO_COLOR[estado] ?? "bg-gray-500"} transition-all`}
                      style={{ width: `${(count / maxEstado) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-12 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros de exportación */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-400" /> Filtros de Exportación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">Todos</option>
                {["ENTRADA", "SALIDA", "INTERNO", "PQRS", "RESOLUCION", "COMUNICADO"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Estado</label>
              <select
                value={filtros.estado}
                onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">Todos</option>
                {["EN_TRAMITE", "PENDIENTE_VOBO", "PENDIENTE_FIRMA", "RESPONDIDO", "ARCHIVADO", "ANULADO"].map(e => (
                  <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block">Dependencia</label>
              <select
                value={filtros.dependenciaId}
                onChange={e => setFiltros({ ...filtros, dependenciaId: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">Todas</option>
                {dependencias.map(d => (
                  <option key={d.id} value={d.id}>{d.codigo} — {d.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Desde
              </label>
              <input
                type="date"
                value={filtros.desde}
                onChange={e => setFiltros({ ...filtros, desde: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Hasta
              </label>
              <input
                type="date"
                value={filtros.hasta}
                onChange={e => setFiltros({ ...filtros, hasta: e.target.value })}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Los filtros se aplican a la exportación CSV. Máximo 10,000 registros por descarga.
            </p>
            <button
              onClick={() => setFiltros({ tipo: "", estado: "", desde: "", hasta: "", dependenciaId: "" })}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
