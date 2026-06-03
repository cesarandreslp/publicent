"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft, Download, Loader2, Calendar,
  CheckCircle, Clock, AlertTriangle, BarChart2,
  TrendingUp, Users, Flame
} from "lucide-react"

interface Metricas {
  periodo: { desde: string; hasta: string }
  totalRadicados: number
  porcentajeEnTermino: number
  respondidosTotal: number
  enTermino: number
  tiempoPromedioRespuesta: { tipo: string; promedioDias: number; totalRespondidos: number }[]
  vobo: { aprobados: number; rechazados: number; pendientes: number }
  volumenMensual: { mes: string; cantidad: number }[]
  heatMap: { hora: number; cantidad: number }[]
  rankingDependencias: { codigo: string; nombre: string; totalRadicados: number }[]
  porEstado: { estado: string; count: number }[]
}

export default function BiDashboardClient() {
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState(false)
  const [desde, setDesde] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 6)
    return d.toISOString().split("T")[0]
  })
  const [hasta, setHasta] = useState(() => new Date().toISOString().split("T")[0])

  useEffect(() => { cargarMetricas() }, [desde, hasta])

  async function cargarMetricas() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/gd/bi/metricas?desde=${desde}&hasta=${hasta}`)
      if (res.ok) setMetricas(await res.json())
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function descargarFurag() {
    try {
      setDescargando(true)
      const res = await fetch("/api/admin/gd/bi/furag")
      if (!res.ok) throw new Error("Error generando reporte")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `FURAG-${new Date().getFullYear()}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error descarga FURAG:", err instanceof Error ? err.message : String(err))
    } finally {
      setDescargando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!metricas) return null

  const voboTotal = metricas.vobo.aprobados + metricas.vobo.rechazados + metricas.vobo.pendientes
  const maxHeat = Math.max(...metricas.heatMap.map(h => h.cantidad), 1)
  const maxMensual = Math.max(...metricas.volumenMensual.map(v => v.cantidad), 1)

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dashboard BI — FURAG
              </h1>
              <p className="text-slate-400 text-sm">{metricas.totalRadicados.toLocaleString()} radicados en período</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm text-white" />
            <span className="text-slate-500">→</span>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-sm text-white" />
            <button
              onClick={descargarFurag}
              disabled={descargando}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors"
            >
              {descargando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              FURAG .xlsx
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Tarjetas KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
            label="Respondidos en Término"
            value={`${metricas.porcentajeEnTermino}%`}
            sub={`${metricas.enTermino} de ${metricas.respondidosTotal}`}
            color={metricas.porcentajeEnTermino >= 80 ? "emerald" : metricas.porcentajeEnTermino >= 60 ? "yellow" : "red"}
          />
          <KpiCard
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            label="Tiempo Prom. Respuesta"
            value={`${metricas.tiempoPromedioRespuesta[0]?.promedioDias ?? "—"} días`}
            sub={`${metricas.tiempoPromedioRespuesta.length} tipos documentales`}
            color="blue"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
            label="Tasa VoBo"
            value={voboTotal > 0 ? `${Math.round((metricas.vobo.aprobados / voboTotal) * 100)}%` : "—"}
            sub={`${metricas.vobo.aprobados} aprobados / ${metricas.vobo.rechazados} rechazados`}
            color="purple"
          />
          <KpiCard
            icon={<BarChart2 className="w-5 h-5 text-orange-400" />}
            label="Volumen Mensual Prom."
            value={metricas.volumenMensual.length > 0
              ? `${Math.round(metricas.volumenMensual.reduce((a, v) => a + v.cantidad, 0) / metricas.volumenMensual.length)}`
              : "0"}
            sub="radicados/mes"
            color="orange"
          />
        </div>

        {/* Volumen mensual */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" /> Volumen Mensual (12 meses)
          </h3>
          <div className="flex items-end gap-1 h-48">
            {metricas.volumenMensual.map(({ mes, cantidad }) => (
              <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">{cantidad}</span>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all"
                  style={{ height: `${(cantidad / maxMensual) * 100}%`, minHeight: 4 }}
                />
                <span className="text-[9px] text-slate-500 -rotate-45">{mes.split("-")[1]}/{mes.split("-")[0].slice(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Heat map hora */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Carga por Hora del Día
            </h3>
            <div className="grid grid-cols-12 gap-1">
              {metricas.heatMap.map(({ hora, cantidad }) => {
                const intensity = cantidad / maxHeat
                const bg = intensity > 0.7 ? "bg-red-500" : intensity > 0.4 ? "bg-orange-500" : intensity > 0.1 ? "bg-yellow-500" : "bg-white/5"
                return (
                  <div key={hora} className="flex flex-col items-center gap-0.5" title={`${hora}:00 — ${cantidad} radicados`}>
                    <div className={`w-full aspect-square rounded ${bg} transition-all`} style={{ opacity: Math.max(0.2, intensity) }} />
                    <span className="text-[9px] text-slate-600">{hora}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ranking dependencias */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Ranking Dependencias
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {metricas.rankingDependencias.map((dep, i) => (
                <div key={dep.codigo} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-5 text-right">{i + 1}</span>
                  <span className="text-xs text-slate-400 w-20 truncate font-mono">{dep.codigo}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-4 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(dep.totalRadicados / (metricas.rankingDependencias[0]?.totalRadicados || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-10 text-right">{dep.totalRadicados}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tiempo promedio por tipo */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Tiempo Promedio de Respuesta por Tipo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metricas.tiempoPromedioRespuesta.map(t => (
              <div key={t.tipo} className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 uppercase">{t.tipo}</p>
                <p className="text-2xl font-bold text-white mt-1">{t.promedioDias}</p>
                <p className="text-[11px] text-slate-500">días · {t.totalRespondidos} respondidos</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string
}) {
  const borderColor: Record<string, string> = {
    emerald: "border-emerald-500/30", blue: "border-blue-500/30",
    purple: "border-purple-500/30", orange: "border-orange-500/30",
    yellow: "border-yellow-500/30", red: "border-red-500/30",
  }

  return (
    <div className={`bg-white/5 border ${borderColor[color] ?? "border-white/10"} rounded-2xl p-5`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs text-slate-400 uppercase">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </div>
  )
}
