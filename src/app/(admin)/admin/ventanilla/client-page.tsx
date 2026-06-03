'use client'

/**
 * VentanillaClientPage — Bandeja de radicados PQRSD para funcionarios.
 *
 * Funcionalidades:
 *  - Métricas: pendientes / vencidos / urgentes / mis radicados
 *  - Filtros: tipo, estado, semáforo, prioridad, funcionario asignado, solo míos
 *  - Búsqueda full-text por radicado / asunto / solicitante
 *  - Paginación cliente-side (fetch a /api/admin/ventanilla)
 *  - Semáforo visual con indicador de color
 *  - Columna de mensajes no leídos
 */

import { useState, useCallback, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  Search, RefreshCw, Filter, Inbox, AlertTriangle,
  Clock, CheckCircle, User, MessageSquare, ChevronLeft,
  ChevronRight, AlertOctagon, Circle, Loader2, SlidersHorizontal,
  X, Bell,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RadicadoItem {
  id: string
  radicado: string
  tipo: string
  estado: string
  prioridad: string
  asunto: string
  nombreSolicitante: string
  anonimo: boolean
  fechaRadicacion: string
  fechaVencimiento: string | null
  colorSemaforo: string | null
  dependencia: string | null
  asignado: { id: string; nombre: string; cargo: string | null } | null
  mensajesNoLeidos: number
}

interface Metricas {
  totalPendientes: number
  totalVencidos: number
  totalUrgentes: number
  totalMios: number
}

interface Funcionario {
  id: string
  nombre: string
  apellido: string
  cargo: string | null
}

interface Props {
  userId: string
  userRole: string
  funcionarios: Funcionario[]
  metricasIniciales: Metricas
}

// ─── Configuración de semáforo ─────────────────────────────────────────────

const SEMAFORO: Record<string, { label: string; dot: string; badge: string }> = {
  VERDE:    { label: 'En tiempo',    dot: 'bg-emerald-500', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  AMARILLO: { label: 'Por vencer',   dot: 'bg-yellow-400',  badge: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/30' },
  ROJO:     { label: 'Urgente',      dot: 'bg-red-500',     badge: 'bg-red-500/15 text-red-400 border-red-500/30' },
  NEGRO:    { label: 'Vencido',      dot: 'bg-gray-800 ring-2 ring-red-600', badge: 'bg-red-900/30 text-red-300 border-red-700/50' },
}

const TIPO_LABEL: Record<string, string> = {
  PETICION: 'Petición', QUEJA: 'Queja', RECLAMO: 'Reclamo',
  SUGERENCIA: 'Sugerencia', DENUNCIA: 'Denuncia',
  FELICITACION: 'Felicitación', CONSULTA: 'Consulta',
}

const TIPO_BADGE: Record<string, string> = {
  PETICION:    'bg-blue-500/15 text-blue-300 border-blue-500/30',
  QUEJA:       'bg-orange-500/15 text-orange-300 border-orange-500/30',
  RECLAMO:     'bg-red-500/15 text-red-400 border-red-500/30',
  SUGERENCIA:  'bg-teal-500/15 text-teal-300 border-teal-500/30',
  DENUNCIA:    'bg-purple-500/15 text-purple-300 border-purple-500/30',
  FELICITACION:'bg-pink-500/15 text-pink-300 border-pink-500/30',
  CONSULTA:    'bg-slate-500/15 text-slate-300 border-slate-500/30',
}

const ESTADO_BADGE: Record<string, string> = {
  RADICADA:    'bg-sky-500/15 text-sky-300',
  EN_TRAMITE:  'bg-yellow-500/15 text-yellow-300',
  RESPONDIDA:  'bg-emerald-500/15 text-emerald-300',
  CERRADA:     'bg-slate-500/15 text-slate-400',
  ANULADA:     'bg-gray-700/30 text-gray-400',
}

const PRIORIDAD_BADGE: Record<string, string> = {
  ALTA:   'bg-red-500/20 text-red-400',
  MEDIA:  'bg-yellow-500/20 text-yellow-300',
  BAJA:   'bg-slate-500/20 text-slate-400',
  NORMAL: '',
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function VentanillaClientPage({ userId, userRole, funcionarios, metricasIniciales }: Props) {
  const [items, setItems]         = useState<RadicadoItem[]>([])
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage]           = useState(1)
  const [metricas, setMetricas]   = useState<Metricas>(metricasIniciales)
  const [loading, setLoading]     = useState(true)
  const [, startTransition]       = useTransition()

  // Filtros
  const [search, setSearch]       = useState('')
  const [tipo, setTipo]           = useState('')
  const [estado, setEstado]       = useState('')
  const [semaforo, setSemaforo]   = useState('')
  const [prioridad, setPrioridad] = useState('')
  const [asignadoId, setAsignadoId] = useState('')
  const [soloMios, setSoloMios]   = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const fetchItems = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page:     String(pg),
        limit:    '20',
        ...(search    && { search }),
        ...(tipo      && { tipo }),
        ...(estado    && { estado }),
        ...(semaforo  && { semaforo }),
        ...(prioridad && { prioridad }),
        ...(asignadoId && { asignadoId }),
        ...(soloMios  && { soloMios: 'true' }),
      })
      const res = await fetch(`/api/admin/ventanilla?${params}`)
      if (!res.ok) throw new Error('Error al cargar radicados')
      const data = await res.json()
      setItems(data.items)
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setMetricas(m => ({ ...m, ...data.metricas }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, tipo, estado, semaforo, prioridad, asignadoId, soloMios])

  useEffect(() => {
    startTransition(() => {
      setPage(1)
      fetchItems(1)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, estado, semaforo, prioridad, asignadoId, soloMios])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      fetchItems(1)
    }, 350)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handlePage = (pg: number) => {
    setPage(pg)
    fetchItems(pg)
  }

  const activeFilters = [tipo, estado, semaforo, prioridad, asignadoId].filter(Boolean).length + (soloMios ? 1 : 0)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900/70 backdrop-blur px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Inbox className="w-5 h-5 text-gov-blue" />
              Ventanilla Única
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Bandeja de radicados PQRSD</p>
          </div>
          <button
            onClick={() => fetchItems(page)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">

        {/* ── Métricas ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={<Inbox className="w-4 h-4" />}
            label="Pendientes"
            value={metricas.totalPendientes}
            color="text-sky-400"
            onClick={() => { setEstado(''); setSoloMios(false); fetchItems(1) }}
          />
          <MetricCard
            icon={<AlertOctagon className="w-4 h-4" />}
            label="Vencidos"
            value={metricas.totalVencidos}
            color="text-red-400"
            onClick={() => { setSemaforo('NEGRO'); setPage(1); fetchItems(1) }}
          />
          <MetricCard
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Urgentes"
            value={metricas.totalUrgentes}
            color="text-orange-400"
            onClick={() => { setSemaforo('ROJO'); setPage(1); fetchItems(1) }}
          />
          <MetricCard
            icon={<User className="w-4 h-4" />}
            label="Mis radicados"
            value={metricas.totalMios}
            color="text-indigo-400"
            onClick={() => { setSoloMios(true); setPage(1); fetchItems(1) }}
          />
        </div>

        {/* ── Búsqueda y filtros ───────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por radicado, asunto o solicitante..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gov-blue"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
              showFilters || activeFilters > 0
                ? 'bg-gov-blue border-gov-blue text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFilters > 0 && (
              <span className="bg-white text-gov-blue text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
          {soloMios && (
            <button
              onClick={() => setSoloMios(false)}
              className="flex items-center gap-1 px-3 py-2 text-xs bg-indigo-600/20 border border-indigo-600/40 text-indigo-300 rounded-lg hover:bg-indigo-600/30"
            >
              Solo míos <X className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>

        {/* Panel de filtros desplegable */}
        {showFilters && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-gov-blue"
              >
                <option value="">Todos</option>
                {Object.entries(TIPO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Estado</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-gov-blue"
              >
                <option value="">Todos</option>
                <option value="RADICADA">Radicada</option>
                <option value="EN_TRAMITE">En trámite</option>
                <option value="RESPONDIDA">Respondida</option>
                <option value="CERRADA">Cerrada</option>
                <option value="ANULADA">Anulada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Semáforo</label>
              <select
                value={semaforo}
                onChange={e => setSemaforo(e.target.value)}
                className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-gov-blue"
              >
                <option value="">Todos</option>
                <option value="VERDE">🟢 En tiempo</option>
                <option value="AMARILLO">🟡 Por vencer</option>
                <option value="ROJO">🔴 Urgente</option>
                <option value="NEGRO">⚫ Vencido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Prioridad</label>
              <select
                value={prioridad}
                onChange={e => setPrioridad(e.target.value)}
                className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-gov-blue"
              >
                <option value="">Todas</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Asignado a</label>
              <select
                value={asignadoId}
                onChange={e => setAsignadoId(e.target.value)}
                className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-gov-blue"
              >
                <option value="">Todos</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nombre} {f.apellido}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end col-span-2 md:col-span-1">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloMios}
                  onChange={e => setSoloMios(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 text-gov-blue focus:ring-gov-blue"
                />
                Solo mis radicados
              </label>
            </div>
            {activeFilters > 0 && (
              <div className="col-span-full flex justify-end">
                <button
                  onClick={() => {
                    setTipo(''); setEstado(''); setSemaforo(''); setPrioridad(''); setAsignadoId(''); setSoloMios(false)
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tabla de radicados ───────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Contador */}
          <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {loading ? 'Cargando...' : `${total.toLocaleString('es-CO')} radicado${total !== 1 ? 's' : ''}`}
            </span>
          </div>

          {loading && items.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No se encontraron radicados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
                    <th className="px-4 py-2.5 font-medium w-8"></th>
                    <th className="px-4 py-2.5 font-medium">Radicado</th>
                    <th className="px-4 py-2.5 font-medium">Tipo</th>
                    <th className="px-4 py-2.5 font-medium hidden md:table-cell">Asunto</th>
                    <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Solicitante</th>
                    <th className="px-4 py-2.5 font-medium">Estado</th>
                    <th className="px-4 py-2.5 font-medium hidden md:table-cell">Asignado</th>
                    <th className="px-4 py-2.5 font-medium hidden lg:table-cell">Vence</th>
                    <th className="px-4 py-2.5 font-medium text-center">Chat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map(item => {
                    const sem = item.colorSemaforo ? SEMAFORO[item.colorSemaforo] : null
                    const terminado = ['RESPONDIDA', 'CERRADA', 'ANULADA'].includes(item.estado)
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Semáforo */}
                        <td className="px-4 py-3">
                          {sem && !terminado ? (
                            <span
                              className={`block w-2.5 h-2.5 rounded-full mx-auto ${sem.dot}`}
                              title={sem.label}
                            />
                          ) : (
                            <span className="block w-2.5 h-2.5 rounded-full mx-auto bg-slate-700" />
                          )}
                        </td>

                        {/* Radicado */}
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/ventanilla/${item.id}`}
                            className="font-mono text-xs font-semibold text-gov-blue hover:underline"
                          >
                            {item.radicado}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">{item.fechaRadicacion}</p>
                          {item.prioridad !== 'NORMAL' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold mt-1 inline-block ${PRIORIDAD_BADGE[item.prioridad] ?? ''}`}>
                              {item.prioridad}
                            </span>
                          )}
                        </td>

                        {/* Tipo */}
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIPO_BADGE[item.tipo] ?? 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                            {TIPO_LABEL[item.tipo] ?? item.tipo}
                          </span>
                        </td>

                        {/* Asunto */}
                        <td className="px-4 py-3 hidden md:table-cell max-w-[200px]">
                          <Link href={`/admin/ventanilla/${item.id}`} className="hover:text-white truncate block text-slate-300 text-xs" title={item.asunto}>
                            {item.asunto}
                          </Link>
                        </td>

                        {/* Solicitante */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-xs text-slate-400">
                            {item.anonimo ? <span className="italic text-slate-600">Anónimo</span> : item.nombreSolicitante}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[item.estado] ?? 'bg-slate-700/40 text-slate-400'}`}>
                            {item.estado.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Asignado */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          {item.asignado ? (
                            <span className="text-xs text-slate-400">
                              {item.asignado.id === userId
                                ? <span className="text-indigo-400 font-medium">Yo</span>
                                : item.asignado.nombre
                              }
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600 italic">Sin asignar</span>
                          )}
                        </td>

                        {/* Vencimiento */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {item.fechaVencimiento ? (
                            <span className={`text-xs ${
                              item.colorSemaforo === 'NEGRO' ? 'text-red-400 font-semibold'
                              : item.colorSemaforo === 'ROJO' ? 'text-orange-400'
                              : item.colorSemaforo === 'AMARILLO' ? 'text-yellow-400'
                              : 'text-slate-400'
                            }`}>
                              {item.fechaVencimiento}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>

                        {/* Mensajes no leídos */}
                        <td className="px-4 py-3 text-center">
                          {item.mensajesNoLeidos > 0 ? (
                            <Link href={`/admin/ventanilla/${item.id}#chat`}>
                              <span className="inline-flex items-center gap-1 bg-red-600/20 text-red-400 border border-red-600/30 text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                <Bell className="w-2.5 h-2.5" />
                                {item.mensajesNoLeidos}
                              </span>
                            </Link>
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5 text-slate-700 mx-auto" />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Paginación ───────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <span className="text-slate-500 text-xs">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Componente métrica ───────────────────────────────────────────────────────

function MetricCard({
  icon, label, value, color, onClick,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-left hover:border-slate-600 transition-colors group"
    >
      <div className={`flex items-center gap-1.5 text-xs font-medium mb-1 ${color} opacity-80 group-hover:opacity-100`}>
        {icon}
        {label}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString('es-CO')}</p>
    </button>
  )
}
