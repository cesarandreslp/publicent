"use client"

import { useState, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AccionAuditoria = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'DOWNLOAD' | 'UPLOAD' | 'PUBLISH' | 'ARCHIVE' | 'ASSIGN' | 'RESPOND' | 'EXPORT'

interface Usuario {
  id: string
  nombre: string | null
  apellido: string | null
  email: string
}

interface Registro {
  id: string
  accion: AccionAuditoria
  entidad: string
  entidadId: string | null
  descripcion: string | null
  ip: string | null
  userAgent: string | null
  createdAt: string
  usuario: Usuario | null
}

interface Stats {
  porAccion:  { accion: string; cantidad: number }[]
  porEntidad: { entidad: string; cantidad: number }[]
  total: number
  periodo: string
}

interface Props {
  registros: Registro[]
  total: number
  paginas: number
  stats: Stats
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCION_COLOR: Record<AccionAuditoria, string> = {
  CREATE:   'bg-green-100 text-green-800',
  UPDATE:   'bg-blue-100 text-blue-800',
  DELETE:   'bg-red-100 text-red-800',
  LOGIN:    'bg-purple-100 text-purple-800',
  LOGOUT:   'bg-gray-100 text-gray-600',
  VIEW:     'bg-gray-100 text-gray-600',
  DOWNLOAD: 'bg-cyan-100 text-cyan-800',
  UPLOAD:   'bg-teal-100 text-teal-800',
  PUBLISH:  'bg-yellow-100 text-yellow-800',
  ARCHIVE:  'bg-orange-100 text-orange-800',
  ASSIGN:   'bg-indigo-100 text-indigo-800',
  RESPOND:  'bg-pink-100 text-pink-800',
  EXPORT:   'bg-violet-100 text-violet-800',
}

const ACCIONES: AccionAuditoria[] = ['CREATE','UPDATE','DELETE','LOGIN','LOGOUT','VIEW','DOWNLOAD','UPLOAD','PUBLISH','ARCHIVE','ASSIGN','RESPOND','EXPORT']

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuditoriaClient({ registros: initialRegistros, total: initialTotal, paginas: initialPaginas, stats }: Props) {
  const [registros, setRegistros] = useState<Registro[]>(initialRegistros)
  const [total, setTotal]         = useState(initialTotal)
  const [paginas, setPaginas]     = useState(initialPaginas)
  const [pagina, setPagina]       = useState(1)
  const [loading, setLoading]     = useState(false)
  const [tab, setTab]             = useState<'logs' | 'stats'>('logs')
  const [detalle, setDetalle]     = useState<Registro | null>(null)

  // Filtros
  const [filtroAccion,   setFiltroAccion]   = useState('')
  const [filtroEntidad,  setFiltroEntidad]  = useState('')
  const [filtroDesde,    setFiltroDesde]    = useState('')
  const [filtroHasta,    setFiltroHasta]    = useState('')

  const buscar = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ pagina: String(pg), limite: '50' })
      if (filtroAccion)  params.set('accion',      filtroAccion)
      if (filtroEntidad) params.set('entidad',      filtroEntidad)
      if (filtroDesde)   params.set('fechaInicio',  new Date(filtroDesde).toISOString())
      if (filtroHasta)   params.set('fechaFin',     new Date(filtroHasta + 'T23:59:59').toISOString())

      const res = await fetch(`/api/admin/auditoria?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setRegistros(data.registros)
      setTotal(data.total)
      setPaginas(data.paginas)
      setPagina(pg)
    } finally { setLoading(false) }
  }, [filtroAccion, filtroEntidad, filtroDesde, filtroHasta])

  // Entidades únicas del set actual para el filtro
  const entidadesUnicas = [...new Set(initialRegistros.map(r => r.entidad))].sort()

  const nombreUsuario = (u: Usuario | null) => {
    if (!u) return 'Sistema'
    return [u.nombre, u.apellido].filter(Boolean).join(' ') || u.email
  }

  const topAcciones = [...stats.porAccion].sort((a, b) => b.cantidad - a.cantidad).slice(0, 8)
  const topEntidades = [...stats.porEntidad].sort((a, b) => b.cantidad - a.cantidad).slice(0, 8)
  const maxAccion = topAcciones[0]?.cantidad ?? 1
  const maxEntidad = topEntidades[0]?.cantidad ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Auditoría avanzada</h1>
        <p className="text-sm text-gray-500 mt-1">Trazabilidad completa de acciones del sistema — {stats.periodo}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Eventos (30 días)</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total.toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Acción más frecuente</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{topAcciones[0]?.accion ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Entidad más activa</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{topEntidades[0]?.entidad ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Total en base</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{total.toLocaleString('es-CO')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'logs',  label: 'Registro de eventos' },
          { key: 'stats', label: 'Estadísticas' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as never)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Estadísticas ─── */}
      {tab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Eventos por acción</h3>
            <div className="space-y-2">
              {topAcciones.map(a => (
                <div key={a.accion}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${ACCION_COLOR[a.accion as AccionAuditoria] ?? 'bg-gray-100 text-gray-700'}`}>{a.accion}</span>
                    <span className="text-gray-500 font-medium">{a.cantidad}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(a.cantidad / maxAccion) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Eventos por entidad</h3>
            <div className="space-y-2">
              {topEntidades.map(e => (
                <div key={e.entidad}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{e.entidad}</span>
                    <span className="text-gray-500">{e.cantidad}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(e.cantidad / maxEntidad) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Logs ─── */}
      {tab === 'logs' && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border items-end">
            <div>
              <p className="text-xs text-gray-500 mb-1">Acción</p>
              <select value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)} className="border rounded px-3 py-2 text-sm">
                <option value="">Todas</option>
                {ACCIONES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Entidad</p>
              <select value={filtroEntidad} onChange={e => setFiltroEntidad(e.target.value)} className="border rounded px-3 py-2 text-sm">
                <option value="">Todas</option>
                {entidadesUnicas.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Desde</p>
              <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className="border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Hasta</p>
              <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className="border rounded px-3 py-2 text-sm" />
            </div>
            <button onClick={() => buscar(1)} disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Buscando…' : 'Filtrar'}
            </button>
            <button onClick={() => { setFiltroAccion(''); setFiltroEntidad(''); setFiltroDesde(''); setFiltroHasta(''); buscar(1) }}
              className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 text-gray-600">
              Limpiar
            </button>
            <span className="ml-auto text-xs text-gray-400">{total.toLocaleString('es-CO')} registros</span>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>{['Fecha/Hora', 'Usuario', 'Acción', 'Entidad', 'ID entidad', 'IP', 'Descripción'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y">
                  {registros.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-gray-400 py-12">Sin registros para los filtros aplicados</td></tr>
                  ) : registros.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetalle(r)}>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">{nombreUsuario(r.usuario)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ACCION_COLOR[r.accion] ?? 'bg-gray-100 text-gray-700'}`}>
                          {r.accion}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 font-medium">{r.entidad}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.entidadId ? r.entidadId.slice(0, 12) + '…' : '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{r.ip ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.descripcion ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {paginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t text-sm">
                <span className="text-gray-500">Página {pagina} de {paginas}</span>
                <div className="flex gap-2">
                  <button disabled={pagina <= 1 || loading} onClick={() => buscar(pagina - 1)}
                    className="px-3 py-1 rounded border hover:bg-white disabled:opacity-40">← Anterior</button>
                  <button disabled={pagina >= paginas || loading} onClick={() => buscar(pagina + 1)}
                    className="px-3 py-1 rounded border hover:bg-white disabled:opacity-40">Siguiente →</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal: Detalle ─── */}
      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetalle(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ACCION_COLOR[detalle.accion] ?? 'bg-gray-100 text-gray-700'}`}>
                  {detalle.accion}
                </span>
                <span className="font-semibold text-gray-900">{detalle.entidad}</span>
              </div>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Usuario</p>
                  <p className="font-medium">{nombreUsuario(detalle.usuario)}</p>
                  {detalle.usuario && <p className="text-xs text-gray-400">{detalle.usuario.email}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Fecha y hora</p>
                  <p className="font-medium">{new Date(detalle.createdAt).toLocaleString('es-CO')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">IP</p>
                  <p className="font-mono text-xs">{detalle.ip ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">ID Entidad</p>
                  <p className="font-mono text-xs break-all">{detalle.entidadId ?? '—'}</p>
                </div>
              </div>
              {detalle.descripcion && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Descripción</p>
                  <p className="text-gray-700">{detalle.descripcion}</p>
                </div>
              )}
              {detalle.userAgent && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">User Agent</p>
                  <p className="text-xs text-gray-500 break-all">{detalle.userAgent}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
