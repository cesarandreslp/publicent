"use client"

import { useState } from "react"
import type { InformeMensual, HallazgoTenant } from "@/lib/superadmin-ai"

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function nivelBadge(nivel: HallazgoTenant["nivel"]) {
  const map: Record<HallazgoTenant["nivel"], string> = {
    CRITICO:    "bg-red-500/20 text-red-400 border-red-500/30",
    ADVERTENCIA:"bg-amber-500/20 text-amber-400 border-amber-500/30",
    NORMAL:     "bg-slate-700/50 text-slate-400 border-slate-600",
    DESTACADO:  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  }
  return map[nivel] ?? map.NORMAL
}

function nivelLabel(nivel: HallazgoTenant["nivel"]) {
  return { CRITICO: "Crítico", ADVERTENCIA: "Advertencia", NORMAL: "Normal", DESTACADO: "Destacado" }[nivel]
}

function MetricaCard({ label, value, sub, color = "blue" }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  const colorMap: Record<string, string> = {
    blue:    "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400",
    emerald: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
    amber:   "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
    red:     "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400",
  }
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-5`}>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color].split(" ").pop()}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function InformesIAPage() {
  const now    = new Date()
  const defPer = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const [periodo,  setPeriodo]  = useState(defPer)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [informe,  setInforme]  = useState<InformeMensual | null>(null)

  async function generarInforme() {
    setLoading(true)
    setError(null)
    setInforme(null)

    try {
      const res = await fetch("/api/superadmin/ai/informe-mensual", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ periodo }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Error al generar el informe")
        return
      }

      setInforme(data.informe as InformeMensual)
    } catch {
      setError("Error de red. Verifica la conexión e intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Informes IA del SaaS</h1>
        <p className="text-sm text-slate-400 mt-1">
          Análisis mensual de todos los tenants generado con inteligencia artificial (Groq / Shipu z.ai).
        </p>
      </div>

      {/* Panel de generación */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Generar informe
        </h2>
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Período (mes)</label>
            <input
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              max={defPer}
              className="px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={generarInforme}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizando…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generar informe IA
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Usa la API key configurada en <code className="text-slate-400">SUPERADMIN_GROQ_API_KEY</code>.
          Si Groq no responde, usa <code className="text-slate-400">SUPERADMIN_SHIPU_API_KEY</code> automáticamente.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-sm text-red-400">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Resultado */}
      {informe && (
        <div className="space-y-6">

          {/* Encabezado del informe */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-white capitalize">{informe.periodo}</h2>
              <p className="text-xs text-slate-500">
                Generado el {new Date(informe.generadoEn).toLocaleString("es-CO")} ·{" "}
                Modelo: <span className="text-slate-400">{informe.modelo}</span> ({informe.proveedor}) ·{" "}
                {informe.tokensTotal.toLocaleString()} tokens
              </p>
            </div>
          </div>

          {/* Métricas globales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricaCard label="Tenants activos"   value={informe.metricasGlobales.tenantActivos}
              sub={`de ${informe.metricasGlobales.totalTenants} totales`} color="blue" />
            <MetricaCard label="Total radicados"   value={informe.metricasGlobales.totalRadicados.toLocaleString()}
              sub="en el período" color="emerald" />
            <MetricaCard label="Tasa de vencimiento" value={`${informe.metricasGlobales.tasaVencimiento}%`}
              sub="radicados vencidos" color={informe.metricasGlobales.tasaVencimiento > 15 ? "red" : "amber"} />
            <MetricaCard label="Tipo más frecuente" value={informe.metricasGlobales.tipoMasFrecuente}
              color="blue" />
          </div>

          {/* Resumen ejecutivo */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Resumen ejecutivo
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">{informe.resumenEjecutivo}</p>
          </div>

          {/* Alertas críticas */}
          {informe.alertasCriticas.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/30 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Alertas críticas
              </h3>
              <ul className="space-y-2">
                {informe.alertasCriticas.map((a, i) => (
                  <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hallazgos por tenant */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Hallazgos por tenant
              </h3>
            </div>
            <div className="divide-y divide-slate-800">
              {informe.hallazgosPorTenant.map((h, i) => (
                <div key={i} className="px-6 py-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-white">{h.tenant}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${nivelBadge(h.nivel)}`}>
                      {nivelLabel(h.nivel)}
                    </span>
                  </div>
                  {h.hallazgos.length > 0 && (
                    <ul className="space-y-1.5 mb-3">
                      {h.hallazgos.map((hh, j) => (
                        <li key={j} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                          {hh}
                        </li>
                      ))}
                    </ul>
                  )}
                  {h.recomendaciones.length > 0 && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">
                      <p className="text-xs font-medium text-blue-400 mb-1.5">Recomendaciones</p>
                      <ul className="space-y-1">
                        {h.recomendaciones.map((r, j) => (
                          <li key={j} className="text-xs text-blue-300/80 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Oportunidades de mejora del SaaS */}
          {informe.oportunidadesMejora.length > 0 && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Oportunidades de mejora del SaaS
              </h3>
              <ul className="space-y-3">
                {informe.oportunidadesMejora.map((o, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
