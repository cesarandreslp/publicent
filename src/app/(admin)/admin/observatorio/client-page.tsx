"use client"

import { useState, useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ObsCategoria    = 'GESTION_INTERNA' | 'ATENCION_CIUDADANA' | 'FINANCIERO' | 'CONTRATACION' | 'GESTION_DOCUMENTAL' | 'TALENTO_HUMANO' | 'MIPG' | 'OTRO'
type ObsPeriodicidad = 'DIARIA' | 'SEMANAL' | 'MENSUAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'
type ObsMetaTipo     = 'MAYOR_ES_MEJOR' | 'MENOR_ES_MEJOR' | 'EXACTO'

interface Medicion {
  id: string
  valor: number
  fecha: string
  periodo: string
  fuente: string | null
  observacion: string | null
}

interface Indicador {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  unidad: string
  categoria: ObsCategoria
  periodicidad: ObsPeriodicidad
  meta: number
  metaTipo: ObsMetaTipo
  dependenciaNombre: string | null
  responsableNombre: string | null
  publicado: boolean
  orden: number
  valorActual: number | null
  fechaUltimaMedicion: string | null
  mediciones: Medicion[]
  _count: { mediciones: number }
}

interface Kpis { total: number; publicados: number; enMeta: number }
interface Props { indicadores: Indicador[]; kpis: Kpis }

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_LABEL: Record<ObsCategoria, string> = {
  GESTION_INTERNA:    'Gestión interna',
  ATENCION_CIUDADANA: 'Atención ciudadana',
  FINANCIERO:         'Financiero',
  CONTRATACION:       'Contratación',
  GESTION_DOCUMENTAL: 'Gestión documental',
  TALENTO_HUMANO:     'Talento humano',
  MIPG:               'MIPG / FURAG',
  OTRO:               'Otro',
}

const PER_LABEL: Record<ObsPeriodicidad, string> = {
  DIARIA: 'Diaria', SEMANAL: 'Semanal', MENSUAL: 'Mensual',
  TRIMESTRAL: 'Trimestral', SEMESTRAL: 'Semestral', ANUAL: 'Anual',
}

function cumpleMeta(ind: Indicador): boolean | null {
  if (ind.valorActual == null) return null
  const v = Number(ind.valorActual), m = Number(ind.meta)
  if (ind.metaTipo === 'MAYOR_ES_MEJOR') return v >= m
  if (ind.metaTipo === 'MENOR_ES_MEJOR') return v <= m
  return Math.abs(v - m) / Math.max(Math.abs(m), 1) <= 0.05
}

function porcentajeMeta(ind: Indicador): number {
  if (ind.valorActual == null || ind.meta === 0) return 0
  const v = Number(ind.valorActual), m = Number(ind.meta)
  if (ind.metaTipo === 'MENOR_ES_MEJOR') {
    if (v === 0) return 100
    return Math.min(100, Math.round((m / v) * 100))
  }
  return Math.min(100, Math.round((v / m) * 100))
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ObservatorioClient({ indicadores: initialIndicadores, kpis }: Props) {
  const [indicadores, setIndicadores] = useState<Indicador[]>(initialIndicadores)
  const [tab, setTab]                 = useState<'indicadores' | 'nuevo'>('indicadores')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [modalMedicion, setModalMedicion]     = useState<Indicador | null>(null)
  const [modalEditar, setModalEditar]         = useState<Indicador | null>(null)
  const [saving, setSaving]                   = useState(false)

  const [formInd, setFormInd] = useState({
    codigo: '', nombre: '', descripcion: '', unidad: '%',
    categoria: 'GESTION_INTERNA' as ObsCategoria,
    periodicidad: 'MENSUAL' as ObsPeriodicidad,
    meta: '', metaTipo: 'MAYOR_ES_MEJOR' as ObsMetaTipo,
    dependenciaNombre: '', responsableNombre: '', publicado: true, orden: '0',
  })

  const [formMed, setFormMed] = useState({
    valor: '', fecha: new Date().toISOString().slice(0, 10),
    periodo: '', fuente: '', observacion: '',
  })

  const filtered = useMemo(() => indicadores.filter(i =>
    filtroCategoria === 'todas' || i.categoria === filtroCategoria
  ), [indicadores, filtroCategoria])

  async function crearIndicador(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { ...formInd, meta: Number(formInd.meta), orden: Number(formInd.orden) }
      const res = await fetch('/api/admin/obs/indicadores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nuevo = await res.json()
      setIndicadores(prev => [...prev, { ...nuevo, mediciones: [], _count: { mediciones: 0 } }])
      setTab('indicadores')
      setFormInd({ codigo: '', nombre: '', descripcion: '', unidad: '%', categoria: 'GESTION_INTERNA', periodicidad: 'MENSUAL', meta: '', metaTipo: 'MAYOR_ES_MEJOR', dependenciaNombre: '', responsableNombre: '', publicado: true, orden: '0' })
    } finally { setSaving(false) }
  }

  async function registrarMedicion(e: React.FormEvent) {
    e.preventDefault()
    if (!modalMedicion) return
    setSaving(true)
    try {
      const body = {
        indicadorId: modalMedicion.id,
        valor: Number(formMed.valor),
        fecha: new Date(formMed.fecha).toISOString(),
        periodo: formMed.periodo,
        fuente: formMed.fuente || undefined,
        observacion: formMed.observacion || undefined,
      }
      const res = await fetch('/api/admin/obs/mediciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nueva = await res.json()
      setIndicadores(prev => prev.map(i => i.id === modalMedicion.id ? {
        ...i,
        valorActual: Number(formMed.valor),
        fechaUltimaMedicion: new Date(formMed.fecha).toISOString(),
        mediciones: [nueva, ...i.mediciones].slice(0, 24),
        _count: { mediciones: i._count.mediciones + 1 },
      } : i))
      setModalMedicion(null)
      setFormMed({ valor: '', fecha: new Date().toISOString().slice(0, 10), periodo: '', fuente: '', observacion: '' })
    } finally { setSaving(false) }
  }

  async function togglePublicado(ind: Indicador) {
    const res = await fetch(`/api/admin/obs/indicadores/${ind.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicado: !ind.publicado }),
    })
    if (!res.ok) return
    setIndicadores(prev => prev.map(i => i.id === ind.id ? { ...i, publicado: !ind.publicado } : i))
  }

  async function eliminarIndicador(ind: Indicador) {
    if (!confirm(`¿Eliminar "${ind.nombre}"? Se borrarán todas sus mediciones.`)) return
    const res = await fetch(`/api/admin/obs/indicadores/${ind.id}`, { method: 'DELETE' })
    if (!res.ok) return
    setIndicadores(prev => prev.filter(i => i.id !== ind.id))
  }

  const inputCls = "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-xs font-medium text-gray-700 mb-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Observatorio de indicadores</h1>
          <p className="text-sm text-gray-500 mt-1">Indicadores de gestión institucional — visibles en el portal público</p>
        </div>
        <a href="/observatorio" target="_blank" className="text-sm text-blue-600 hover:underline">
          Ver portal público →
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Total indicadores</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{kpis.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Publicados</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{indicadores.filter(i => i.publicado).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Cumpliendo meta</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {indicadores.filter(i => cumpleMeta(i) === true).length} / {indicadores.filter(i => i.valorActual != null).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'indicadores', label: 'Indicadores' },
          { key: 'nuevo',       label: '+ Nuevo indicador' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as never)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Nuevo indicador ─── */}
      {tab === 'nuevo' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
          <form onSubmit={crearIndicador} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Código *</label>
                <input required value={formInd.codigo} onChange={e => setFormInd(p => ({...p, codigo: e.target.value}))} placeholder="IND-001" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nombre *</label>
                <input required value={formInd.nombre} onChange={e => setFormInd(p => ({...p, nombre: e.target.value}))} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea rows={2} value={formInd.descripcion} onChange={e => setFormInd(p => ({...p, descripcion: e.target.value}))} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Categoría *</label>
                <select required value={formInd.categoria} onChange={e => setFormInd(p => ({...p, categoria: e.target.value as ObsCategoria}))} className={inputCls}>
                  {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Periodicidad *</label>
                <select required value={formInd.periodicidad} onChange={e => setFormInd(p => ({...p, periodicidad: e.target.value as ObsPeriodicidad}))} className={inputCls}>
                  {Object.entries(PER_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Unidad *</label>
                <input required value={formInd.unidad} onChange={e => setFormInd(p => ({...p, unidad: e.target.value}))} placeholder="%, Días, Casos..." className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Meta *</label>
                <input required type="number" step="any" value={formInd.meta} onChange={e => setFormInd(p => ({...p, meta: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Tipo de meta *</label>
                <select value={formInd.metaTipo} onChange={e => setFormInd(p => ({...p, metaTipo: e.target.value as ObsMetaTipo}))} className={inputCls}>
                  <option value="MAYOR_ES_MEJOR">Mayor es mejor</option>
                  <option value="MENOR_ES_MEJOR">Menor es mejor</option>
                  <option value="EXACTO">Valor exacto</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Orden (visualización)</label>
                <input type="number" min="0" value={formInd.orden} onChange={e => setFormInd(p => ({...p, orden: e.target.value}))} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Dependencia responsable</label>
                <input value={formInd.dependenciaNombre} onChange={e => setFormInd(p => ({...p, dependenciaNombre: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Responsable</label>
                <input value={formInd.responsableNombre} onChange={e => setFormInd(p => ({...p, responsableNombre: e.target.value}))} className={inputCls} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pub" checked={formInd.publicado} onChange={e => setFormInd(p => ({...p, publicado: e.target.checked}))} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
              <label htmlFor="pub" className="text-sm text-gray-700">Publicar en portal ciudadano</label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setTab('indicadores')} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Guardando…' : 'Crear indicador'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Tab: Lista de indicadores ─── */}
      {tab === 'indicadores' && (
        <>
          <div className="flex gap-3">
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="todas">Todas las categorías</option>
              {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0 && (
              <div className="col-span-3 text-center text-gray-400 py-16">
                Sin indicadores creados.{' '}
                <button className="text-blue-600 hover:underline" onClick={() => setTab('nuevo')}>Crear el primero</button>
              </div>
            )}
            {filtered.map(ind => {
              const pct    = porcentajeMeta(ind)
              const cumple = cumpleMeta(ind)
              const barColor = cumple === true ? 'bg-green-500' : cumple === false ? 'bg-red-400' : 'bg-gray-300'
              return (
                <div key={ind.id} className="bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-400">{ind.codigo}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{CAT_LABEL[ind.categoria]}</span>
                        {!ind.publicado && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Oculto</span>}
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1 leading-tight">{ind.nombre}</h3>
                    </div>
                  </div>

                  {/* Valor actual vs meta */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-gray-800">
                        {ind.valorActual != null ? `${Number(ind.valorActual).toLocaleString('es-CO')} ${ind.unidad}` : '—'}
                      </span>
                      <span className="text-gray-400 text-xs">Meta: {Number(ind.meta).toLocaleString('es-CO')} {ind.unidad}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs font-medium ${cumple === true ? 'text-green-600' : cumple === false ? 'text-red-500' : 'text-gray-400'}`}>
                        {cumple === true ? '✓ Cumple meta' : cumple === false ? '✗ Sin cumplir' : 'Sin medición'}
                      </span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t">
                    <span>{PER_LABEL[ind.periodicidad]} · {ind._count.mediciones} mediciones</span>
                    {ind.fechaUltimaMedicion && (
                      <span>{new Date(ind.fechaUltimaMedicion).toLocaleDateString('es-CO')}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setModalMedicion(ind)} className="flex-1 text-xs px-2 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">
                      + Medición
                    </button>
                    <button onClick={() => togglePublicado(ind)} className="text-xs px-2 py-1.5 rounded bg-gray-50 text-gray-600 hover:bg-gray-100">
                      {ind.publicado ? 'Ocultar' : 'Publicar'}
                    </button>
                    <button onClick={() => eliminarIndicador(ind)} className="text-xs px-2 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100">
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── Modal: Registrar medición ─── */}
      {modalMedicion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Medición: <span className="text-blue-600">{modalMedicion.nombre}</span></h2>
              <button onClick={() => setModalMedicion(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={registrarMedicion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Valor ({modalMedicion.unidad}) *</label>
                  <input required type="number" step="any" value={formMed.valor} onChange={e => setFormMed(p => ({...p, valor: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha *</label>
                  <input required type="date" value={formMed.fecha} onChange={e => setFormMed(p => ({...p, fecha: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Período (ej: 2025-T1, 2025-03) *</label>
                <input required value={formMed.periodo} onChange={e => setFormMed(p => ({...p, periodo: e.target.value}))}
                  placeholder={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Fuente</label>
                <input value={formMed.fuente} onChange={e => setFormMed(p => ({...p, fuente: e.target.value}))} placeholder="FURAG, Informe gestión..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Observación</label>
                <textarea rows={2} value={formMed.observacion} onChange={e => setFormMed(p => ({...p, observacion: e.target.value}))} className={inputCls} />
              </div>
              {/* Preview vs meta */}
              {formMed.valor && (
                <div className="p-3 rounded-lg bg-gray-50 text-xs text-gray-600">
                  Meta: <strong>{Number(modalMedicion.meta).toLocaleString('es-CO')} {modalMedicion.unidad}</strong> ·
                  Nuevo valor: <strong>{Number(formMed.valor).toLocaleString('es-CO')} {modalMedicion.unidad}</strong> ·{' '}
                  {(() => {
                    const v = Number(formMed.valor), m = Number(modalMedicion.meta)
                    const ok = modalMedicion.metaTipo === 'MAYOR_ES_MEJOR' ? v >= m : modalMedicion.metaTipo === 'MENOR_ES_MEJOR' ? v <= m : Math.abs(v - m) / Math.max(Math.abs(m), 1) <= 0.05
                    return <span className={ok ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>{ok ? '✓ Cumple meta' : '✗ No cumple meta'}</span>
                  })()}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalMedicion(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
