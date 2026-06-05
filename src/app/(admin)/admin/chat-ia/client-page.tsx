'use client'

import { useState } from 'react'
import { RefreshCw, BarChart2, MessageSquare, Database } from 'lucide-react'

interface ConversacionResumen {
  id: string
  sessionId: string
  createdAt: string
  primeraPreguenta: string
}

interface Stats {
  totalChunks: number
  chunksPorFuente: Array<{ fuente: string; total: number }>
  totalConversaciones: number
  topPreguntas: Array<{ pregunta: string; veces: number }>
  conversacionesRecientes: ConversacionResumen[]
}

interface Props {
  totalChunksInicial: number
}

export default function ChatIaClientPage({ totalChunksInicial }: Props) {
  const [indexando, setIndexando] = useState(false)
  const [resultadoIndexacion, setResultadoIndexacion] = useState<{ indexados: number; errores: number } | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [cargandoStats, setCargandoStats] = useState(false)
  const [totalChunks, setTotalChunks] = useState(totalChunksInicial)

  const reindexar = async () => {
    if (!confirm('¿Confirmas la re-indexación completa del contenido del tenant? Este proceso puede tardar unos segundos.')) return
    setIndexando(true)
    setResultadoIndexacion(null)
    try {
      const res = await fetch('/api/admin/chat-ia/indexar', { method: 'POST' })
      const data = await res.json() as { indexados?: number; errores?: number; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Error al indexar')
      setResultadoIndexacion({ indexados: data.indexados ?? 0, errores: data.errores ?? 0 })
      setTotalChunks(data.indexados ?? 0)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al indexar')
    } finally {
      setIndexando(false)
    }
  }

  const cargarStats = async () => {
    setCargandoStats(true)
    try {
      const res = await fetch('/api/admin/chat-ia/stats')
      if (!res.ok) throw new Error('Error al cargar estadísticas')
      const data = await res.json() as Stats
      setStats(data)
      setTotalChunks(data.totalChunks)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al cargar estadísticas')
    } finally {
      setCargandoStats(false)
    }
  }

  const exportarCSV = () => {
    if (!stats?.conversacionesRecientes.length) return
    const filas = [
      ['Session ID', 'Primera pregunta', 'Fecha'],
      ...stats.conversacionesRecientes.map((c) => [
        c.sessionId,
        c.primeraPreguenta.replace(/,/g, ';'),
        new Date(c.createdAt).toLocaleString('es-CO'),
      ]),
    ]
    const csv = filas.map((f) => f.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversaciones-chat-ia-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Chat IA Ciudadano</h1>
          <p className="text-slate-500 text-sm mt-1">Panel de administración del asistente virtual RAG</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Chunks indexados</p>
            <p className="text-2xl font-bold text-slate-900">{totalChunks.toLocaleString('es-CO')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Conversaciones (30 días)</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalConversaciones ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <BarChart2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Fuentes indexadas</p>
            <p className="text-2xl font-bold text-slate-900">{stats?.chunksPorFuente.length ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">Acciones</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={reindexar}
            disabled={indexando}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${indexando ? 'animate-spin' : ''}`} />
            {indexando ? 'Indexando…' : 'Re-indexar contenido'}
          </button>
          <button
            onClick={cargarStats}
            disabled={cargandoStats}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            <BarChart2 className={`w-4 h-4 ${cargandoStats ? 'animate-spin' : ''}`} />
            {cargandoStats ? 'Cargando…' : 'Actualizar estadísticas'}
          </button>
        </div>

        {resultadoIndexacion && (
          <div className={`text-sm rounded-lg px-4 py-3 ${resultadoIndexacion.errores > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
            Indexación completada: <strong>{resultadoIndexacion.indexados}</strong> chunks creados.
            {resultadoIndexacion.errores > 0 && <> <strong>{resultadoIndexacion.errores}</strong> elementos con error.</>}
          </div>
        )}
      </div>

      {/* Chunks por fuente */}
      {stats?.chunksPorFuente && stats.chunksPorFuente.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Distribución por fuente</h2>
          <div className="space-y-2">
            {stats.chunksPorFuente.map((f) => (
              <div key={f.fuente} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-700">{f.fuente}</span>
                <span className="font-medium text-slate-900">{f.total.toLocaleString('es-CO')} chunks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top preguntas */}
      {stats?.topPreguntas && stats.topPreguntas.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Preguntas frecuentes (últimos 30 días)</h2>
          <ol className="space-y-2">
            {stats.topPreguntas.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1 text-slate-700 truncate">{p.pregunta}…</span>
                <span className="text-slate-400 text-xs">{p.veces}×</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Conversaciones recientes */}
      {stats?.conversacionesRecientes && stats.conversacionesRecientes.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">Conversaciones recientes</h2>
            <button
              onClick={exportarCSV}
              className="text-xs text-blue-600 hover:underline"
            >
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                  <th className="pb-2 pr-4 font-medium">Session ID</th>
                  <th className="pb-2 pr-4 font-medium">Primera pregunta</th>
                  <th className="pb-2 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.conversacionesRecientes.slice(0, 20).map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 pr-4 text-slate-400 font-mono text-xs">{c.sessionId.slice(0, 8)}…</td>
                    <td className="py-2 pr-4 text-slate-700 max-w-xs truncate">{c.primeraPreguenta}</td>
                    <td className="py-2 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
