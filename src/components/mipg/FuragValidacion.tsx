'use client'

/**
 * FuragValidacion — Widget de validación automática de indicadores FURAG.
 *
 * Consume GET /api/admin/mipg/validar-furag?anioVigencia=YYYY
 * y muestra:
 *  - Resumen con IDI FURAG sugerido
 *  - Tabla de indicadores con estado semáforo
 *  - Brecha entre puntaje declarado y puntaje calculado
 */

import { useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, AlertOctagon, RefreshCw, Info, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import type { ResultadoValidacion, IndicadorValidado, EstadoValidacion } from '@/lib/furag-validator'

interface Props {
  anioVigencia: number
}

// ─── Semáforo visual ─────────────────────────────────────────────────────────

const ESTADO_CONFIG: Record<EstadoValidacion, {
  icon: React.ReactNode; badge: string; label: string
}> = {
  CONSISTENTE:   {
    icon:  <CheckCircle className="w-4 h-4 text-emerald-400" />,
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    label: 'Consistente',
  },
  ALERTA: {
    icon:  <AlertTriangle className="w-4 h-4 text-yellow-400" />,
    badge: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    label: 'Alerta',
  },
  INCONSISTENTE: {
    icon:  <AlertOctagon className="w-4 h-4 text-red-400" />,
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    label: 'Inconsistente',
  },
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FuragValidacion({ anioVigencia }: Props) {
  const [resultado, setResultado]       = useState<ResultadoValidacion | null>(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [expandido, setExpandido]       = useState<Set<string>>(new Set())
  const [yaEjecutado, setYaEjecutado]   = useState(false)

  const ejecutarValidacion = useCallback(async (forzar = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/mipg/validar-furag?anioVigencia=${anioVigencia}${forzar ? '&forzar=true' : ''}`
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Error ${res.status}`)
      }
      const data: ResultadoValidacion = await res.json()
      setResultado(data)
      setYaEjecutado(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al ejecutar validación')
    } finally {
      setLoading(false)
    }
  }, [anioVigencia])

  const toggleExpandido = (codigo: string) => {
    setExpandido(prev => {
      const s = new Set(prev)
      if (s.has(codigo)) s.delete(codigo)
      else s.add(codigo)
      return s
    })
  }

  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <div>
            <h2 className="text-sm font-bold text-white">Validación automática de indicadores FURAG</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cruza datos reales del sistema con los puntajes declarados — Vigencia {anioVigencia}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {yaEjecutado && (
            <button
              onClick={() => ejecutarValidacion(true)}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Recalcular
            </button>
          )}
          {!yaEjecutado && (
            <button
              onClick={() => ejecutarValidacion(false)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gov-blue hover:bg-gov-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando…</>
                : 'Ejecutar validación'
              }
            </button>
          )}
        </div>
      </div>

      {/* Estado inicial */}
      {!yaEjecutado && !loading && !error && (
        <div className="px-5 py-10 text-center text-slate-500">
          <Info className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">
            Ejecuta la validación para cruzar los datos operativos del sistema
            con los puntajes FURAG declarados y detectar inconsistencias.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          <span className="ml-3 text-sm text-slate-400">Cruzando datos con indicadores FURAG…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-5 py-4">
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-3 py-2">
            {error}
          </p>
        </div>
      )}

      {/* Resultados */}
      {resultado && !loading && (
        <div className="divide-y divide-slate-800">

          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 divide-x divide-slate-800">
            <ResumenCard label="IDI Sugerido" value={`${resultado.resumen.idiFuragSugerido}`} sub="puntaje promedio" color="text-sky-400" />
            <ResumenCard label="Consistentes" value={String(resultado.resumen.consistentes)} sub="indicadores" color="text-emerald-400" />
            <ResumenCard label="Alertas" value={String(resultado.resumen.alertas)} sub="indicadores" color="text-yellow-400" />
            <ResumenCard label="Inconsistentes" value={String(resultado.resumen.inconsistentes)} sub="indicadores" color="text-red-400" />
            <ResumenCard label="Sin evaluación" value={String(resultado.resumen.sinEvaluacion)} sub="sin puntaje declarado" color="text-slate-400" />
          </div>

          {/* Indicadores */}
          <div>
            {resultado.indicadores.map(ind => {
              const cfg = ESTADO_CONFIG[ind.estado]
              const abierto = expandido.has(ind.codigo)
              return (
                <div key={ind.codigo} className="border-b border-slate-800 last:border-0">
                  {/* Fila principal */}
                  <button
                    onClick={() => toggleExpandido(ind.codigo)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors text-left"
                  >
                    {abierto
                      ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-slate-500">{ind.politica}</span>
                        <span className="text-sm font-medium text-slate-200 truncate">{ind.nombre}</span>
                      </div>
                    </div>
                    {/* Estado */}
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${cfg.badge}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                    {/* Puntajes */}
                    <div className="flex items-center gap-4 shrink-0 ml-2 text-xs text-right">
                      <div>
                        <p className="text-slate-500">Declarado</p>
                        <p className="font-semibold text-slate-200">
                          {ind.puntajeDeclarado !== null ? ind.puntajeDeclarado : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Sugerido</p>
                        <p className="font-semibold text-sky-400">{ind.puntajeSugerido}</p>
                      </div>
                      {ind.brecha !== null && (
                        <div>
                          <p className="text-slate-500">Brecha</p>
                          <p className={`font-semibold ${ind.brecha > 20 ? 'text-red-400' : ind.brecha > 10 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                            {ind.brecha > 0 ? `±${ind.brecha}` : '0'}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Detalle expandido */}
                  {abierto && (
                    <div className="px-12 pb-4 space-y-3">
                      {/* Evidencia */}
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-400 mb-2">Datos del sistema</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(ind.evidencia).map(([k, v]) => (
                            <div key={k}>
                              <p className="text-[10px] text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                              <p className="text-xs font-semibold text-slate-200">{String(v)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Recomendación */}
                      <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs border ${
                        ind.estado === 'INCONSISTENTE' ? 'bg-red-900/10 border-red-700/30 text-red-300'
                        : ind.estado === 'ALERTA' ? 'bg-yellow-900/10 border-yellow-700/30 text-yellow-300'
                        : 'bg-emerald-900/10 border-emerald-700/30 text-emerald-300'
                      }`}>
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {ind.recomendacion}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-2 text-right">
            <p className="text-[10px] text-slate-600">
              Calculado: {resultado.indicadores[0]?.calculadoEn
                ? new Date(resultado.indicadores[0].calculadoEn).toLocaleString('es-CO')
                : '—'
              } · Los valores son aproximaciones. La evaluación oficial es responsabilidad del funcionario MIPG.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

// ─── Tarjeta de resumen ────────────────────────────────────────────────────────

function ResumenCard({
  label, value, sub, color,
}: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-4 text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
    </div>
  )
}
