"use client"

import { useState, useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type RenTipoConcepto    = 'PREDIAL_UNIFICADO' | 'INDUSTRIA_COMERCIO' | 'SOBRETASA_GASOLINA' | 'ESTAMPILLA' | 'DELINEACION_URBANA' | 'AVISOS_TABLEROS' | 'PLUSVALIA' | 'ALUMBRADO_PUBLICO' | 'OTRO'
type RenPeriodicidad    = 'ANUAL' | 'SEMESTRAL' | 'TRIMESTRAL' | 'MENSUAL' | 'UNICA'
type RenEstadoLiquidacion = 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA' | 'EN_ACUERDO_PAGO' | 'ANULADA'
type RenMedioPago       = 'EFECTIVO' | 'TRANSFERENCIA' | 'PSE' | 'CHEQUE' | 'DATAFONO' | 'OTRO'

interface Concepto {
  id: string; codigo: string; nombre: string; tipo: RenTipoConcepto
  periodicidad: RenPeriodicidad; tasaBase: number | null
  _count: { liquidaciones: number }
}
interface Contribuyente {
  id: string; documento: string; tipoDoc: string
  nombre: string; razonSocial: string | null
  _count?: { liquidaciones: number }
}
interface Liquidacion {
  id: string; numero: string; vigencia: number; periodo: string | null
  estado: RenEstadoLiquidacion
  baseGravable: number; tarifa: number; impuesto: number
  intereses: number; descuentos: number; totalACobrar: number
  totalPagado: number; saldo: number
  fechaVencimiento: string | null
  concepto:      { nombre: string; tipo: string }
  contribuyente: { nombre: string; documento: string; razonSocial: string | null }
  _count: { pagos: number }
}
interface Kpis { totalCobrar: number; totalRecaudado: number; totalSaldo: number; pendientes: number; vencidas: number }
interface Props { conceptos: Concepto[]; contribuyentes: Contribuyente[]; liquidaciones: Liquidacion[]; vigencia: number; kpis: Kpis }

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<RenTipoConcepto, string> = {
  PREDIAL_UNIFICADO: 'Predial unificado', INDUSTRIA_COMERCIO: 'Industria y comercio',
  SOBRETASA_GASOLINA: 'Sobretasa gasolina', ESTAMPILLA: 'Estampilla',
  DELINEACION_URBANA: 'Delineación urbana', AVISOS_TABLEROS: 'Avisos y tableros',
  PLUSVALIA: 'Plusvalía', ALUMBRADO_PUBLICO: 'Alumbrado público', OTRO: 'Otro',
}
const PER_LABEL: Record<RenPeriodicidad, string> = {
  ANUAL: 'Anual', SEMESTRAL: 'Semestral', TRIMESTRAL: 'Trimestral', MENSUAL: 'Mensual', UNICA: 'Única vez',
}
const ESTADO_COLOR: Record<RenEstadoLiquidacion, string> = {
  PENDIENTE:       'bg-yellow-100 text-yellow-800',
  PARCIAL:         'bg-blue-100 text-blue-800',
  PAGADA:          'bg-green-100 text-green-800',
  VENCIDA:         'bg-red-100 text-red-800',
  EN_ACUERDO_PAGO: 'bg-purple-100 text-purple-800',
  ANULADA:         'bg-gray-100 text-gray-500',
}
const ESTADO_LABEL: Record<RenEstadoLiquidacion, string> = {
  PENDIENTE: 'Pendiente', PARCIAL: 'Parcial', PAGADA: 'Pagada',
  VENCIDA: 'Vencida', EN_ACUERDO_PAGO: 'Acuerdo pago', ANULADA: 'Anulada',
}

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

// ─── Main component ───────────────────────────────────────────────────────────

export default function RentasClient({ conceptos: initConceptos, contribuyentes: initContribs, liquidaciones: initLiqs, vigencia, kpis }: Props) {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>(initLiqs)
  const [tab, setTab] = useState<'liquidaciones' | 'conceptos' | 'contribuyentes'>('liquidaciones')
  const [filtroEstado, setFiltroEstado]   = useState<string>('todos')
  const [filtroConcepto, setFiltroConcepto] = useState<string>('todos')
  const [q, setQ]                         = useState('')

  const [modalLiq,    setModalLiq]    = useState(false)
  const [modalPago,   setModalPago]   = useState<Liquidacion | null>(null)
  const [modalContr,  setModalContr]  = useState(false)
  const [saving, setSaving]           = useState(false)

  const [conceptos,     setConceptos]     = useState<Concepto[]>(initConceptos)
  const [contribuyentes, setContribuyentes] = useState<Contribuyente[]>(initContribs)

  const [formLiq, setFormLiq] = useState({
    numero: '', conceptoId: '', contribuyenteId: '', vigencia: String(vigencia),
    periodo: '', baseGravable: '', tarifa: '', intereses: '0', descuentos: '0',
    fechaVencimiento: '', observacion: '',
  })
  const [formPago, setFormPago] = useState({
    valor: '', fecha: new Date().toISOString().slice(0, 10),
    medioPago: 'EFECTIVO' as RenMedioPago, referencia: '', observacion: '',
  })
  const [formContr, setFormContr] = useState({
    documento: '', tipoDoc: 'CC', nombre: '', razonSocial: '', direccion: '', telefono: '', email: '',
  })

  const filtered = useMemo(() => liquidaciones.filter(l => {
    const matchE = filtroEstado   === 'todos' || l.estado     === filtroEstado
    const matchC = filtroConcepto === 'todos' || l.concepto.nombre === filtroConcepto
    const matchQ = !q || [l.numero, l.contribuyente.nombre, l.contribuyente.documento].some(s => s.toLowerCase().includes(q.toLowerCase()))
    return matchE && matchC && matchQ
  }), [liquidaciones, filtroEstado, filtroConcepto, q])

  // Calcular impuesto en tiempo real para el form
  const impuestoPreview = useMemo(() => {
    const base = parseFloat(formLiq.baseGravable) || 0
    const tarifa = parseFloat(formLiq.tarifa) || 0
    const int = parseFloat(formLiq.intereses) || 0
    const desc = parseFloat(formLiq.descuentos) || 0
    const imp = base * tarifa
    return { impuesto: imp, total: imp + int - desc }
  }, [formLiq.baseGravable, formLiq.tarifa, formLiq.intereses, formLiq.descuentos])

  async function crearLiquidacion(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        numero: formLiq.numero, conceptoId: formLiq.conceptoId, contribuyenteId: formLiq.contribuyenteId,
        vigencia: Number(formLiq.vigencia), periodo: formLiq.periodo || undefined,
        baseGravable: Number(formLiq.baseGravable), tarifa: Number(formLiq.tarifa),
        intereses: Number(formLiq.intereses) || 0, descuentos: Number(formLiq.descuentos) || 0,
        fechaVencimiento: formLiq.fechaVencimiento ? new Date(formLiq.fechaVencimiento).toISOString() : undefined,
        observacion: formLiq.observacion || undefined,
      }
      const res = await fetch('/api/admin/ren/liquidaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nueva = await res.json()
      setLiquidaciones(prev => [nueva, ...prev])
      setModalLiq(false)
      setFormLiq({ numero: '', conceptoId: '', contribuyenteId: '', vigencia: String(vigencia), periodo: '', baseGravable: '', tarifa: '', intereses: '0', descuentos: '0', fechaVencimiento: '', observacion: '' })
    } finally { setSaving(false) }
  }

  async function registrarPago(e: React.FormEvent) {
    e.preventDefault()
    if (!modalPago) return
    setSaving(true)
    try {
      const body = {
        liquidacionId: modalPago.id, valor: Number(formPago.valor),
        fecha: new Date(formPago.fecha).toISOString(),
        medioPago: formPago.medioPago,
        referencia: formPago.referencia || undefined,
        observacion: formPago.observacion || undefined,
      }
      const res = await fetch('/api/admin/ren/pagos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const val = Number(formPago.valor)
      setLiquidaciones(prev => prev.map(l => {
        if (l.id !== modalPago.id) return l
        const nuevoTotalPagado = l.totalPagado + val
        const nuevoSaldo = Math.max(0, l.totalACobrar - nuevoTotalPagado)
        const nuevoEstado: RenEstadoLiquidacion = nuevoSaldo <= 0.01 ? 'PAGADA' : nuevoTotalPagado > 0 ? 'PARCIAL' : l.estado
        return { ...l, totalPagado: nuevoTotalPagado, saldo: nuevoSaldo, estado: nuevoEstado, _count: { pagos: l._count.pagos + 1 } }
      }))
      setModalPago(null)
      setFormPago({ valor: '', fecha: new Date().toISOString().slice(0, 10), medioPago: 'EFECTIVO', referencia: '', observacion: '' })
    } finally { setSaving(false) }
  }

  async function crearContribuyente(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/ren/contribuyentes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formContr) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nuevo = await res.json()
      setContribuyentes(prev => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setModalContr(false)
      setFormContr({ documento: '', tipoDoc: 'CC', nombre: '', razonSocial: '', direccion: '', telefono: '', email: '' })
    } finally { setSaving(false) }
  }

  const inputCls = "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-xs font-medium text-gray-700 mb-1"
  const conceptosUnicos = [...new Set(liquidaciones.map(l => l.concepto.nombre))].sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rentas locales</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión tributaria municipal — vigencia {vigencia}</p>
        </div>
        <button onClick={() => setModalLiq(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Nueva liquidación
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total a cobrar',   value: fmt.format(kpis.totalCobrar),    color: 'blue' },
          { label: 'Recaudado',        value: fmt.format(kpis.totalRecaudado),  color: 'green' },
          { label: 'Saldo cartera',    value: fmt.format(kpis.totalSaldo),      color: 'orange' },
          { label: 'Pendientes',       value: liquidaciones.filter(l => l.estado === 'PENDIENTE').length, color: 'yellow' },
          { label: 'Vencidas',         value: liquidaciones.filter(l => l.estado === 'VENCIDA').length,   color: 'red' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-xl font-bold text-${k.color}-600 mt-1`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'liquidaciones',  label: `Liquidaciones (${liquidaciones.length})` },
          { key: 'contribuyentes', label: `Contribuyentes (${contribuyentes.length})` },
          { key: 'conceptos',      label: `Conceptos (${conceptos.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as never)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Liquidaciones ─── */}
      {tab === 'liquidaciones' && (
        <>
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="N° liquidación, contribuyente, documento..."
              className="border rounded px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="todos">Todos los estados</option>
              {Object.entries(ESTADO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filtroConcepto} onChange={e => setFiltroConcepto(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="todos">Todos los conceptos</option>
              {conceptosUnicos.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>{['N° Liquidación', 'Contribuyente', 'Concepto', 'Base gravable', 'Total a cobrar', 'Pagado', 'Saldo', 'Estado', 'Vencimiento', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} className="text-center text-gray-400 py-12">Sin liquidaciones para los filtros aplicados</td></tr>
                  ) : filtered.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{l.numero}</td>
                      <td className="px-4 py-3 max-w-40 truncate">
                        <p className="font-medium text-xs">{l.contribuyente.razonSocial ?? l.contribuyente.nombre}</p>
                        <p className="text-gray-400 text-xs">{l.contribuyente.documento}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{l.concepto.nombre}</td>
                      <td className="px-4 py-3 text-xs text-right">{fmt.format(l.baseGravable)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-right">{fmt.format(l.totalACobrar)}</td>
                      <td className="px-4 py-3 text-xs text-green-700 text-right">{fmt.format(l.totalPagado)}</td>
                      <td className="px-4 py-3 text-xs font-bold text-right">{fmt.format(l.saldo)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[l.estado]}`}>
                          {ESTADO_LABEL[l.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {l.fechaVencimiento ? new Date(l.fechaVencimiento).toLocaleDateString('es-CO') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {l.estado !== 'PAGADA' && l.estado !== 'ANULADA' && (
                          <button onClick={() => setModalPago(l)} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium whitespace-nowrap">
                            Registrar pago
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
                {filtered.length} de {liquidaciones.length} · Saldo total filtrado: <strong>{fmt.format(filtered.reduce((s, l) => s + l.saldo, 0))}</strong>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Tab: Contribuyentes ─── */}
      {tab === 'contribuyentes' && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setModalContr(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              + Nuevo contribuyente
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>{['Documento', 'Nombre / Razón social', 'Dirección', 'Teléfono', 'Email'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {contribuyentes.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 py-12">Sin contribuyentes registrados</td></tr>
                ) : contribuyentes.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{c.tipoDoc} {c.documento}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.nombre}</p>
                      {c.razonSocial && <p className="text-xs text-gray-400">{c.razonSocial}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(c as unknown as Record<string, unknown>).direccion as string ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(c as unknown as Record<string, unknown>).telefono as string ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(c as unknown as Record<string, unknown>).email as string ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Tab: Conceptos ─── */}
      {tab === 'conceptos' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>{['Código', 'Nombre', 'Tipo', 'Periodicidad', 'Tasa base', 'Liquidaciones'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {conceptos.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-12">Sin conceptos configurados</td></tr>
              ) : conceptos.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{c.codigo}</td>
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{TIPO_LABEL[c.tipo]}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{PER_LABEL[c.periodicidad]}</td>
                  <td className="px-4 py-3 text-xs">{c.tasaBase != null ? `${(Number(c.tasaBase) * 100).toFixed(4)}%` : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c._count.liquidaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Nueva liquidación ─── */}
      {modalLiq && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Nueva liquidación</h2>
              <button onClick={() => setModalLiq(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearLiquidacion} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>N° Liquidación *</label>
                  <input required value={formLiq.numero} onChange={e => setFormLiq(p => ({...p, numero: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vigencia *</label>
                  <input required type="number" value={formLiq.vigencia} onChange={e => setFormLiq(p => ({...p, vigencia: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Concepto tributario *</label>
                  <select required value={formLiq.conceptoId} onChange={e => setFormLiq(p => ({...p, conceptoId: e.target.value}))} className={inputCls}>
                    <option value="">Seleccionar…</option>
                    {conceptos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Contribuyente *</label>
                  <select required value={formLiq.contribuyenteId} onChange={e => setFormLiq(p => ({...p, contribuyenteId: e.target.value}))} className={inputCls}>
                    <option value="">Seleccionar…</option>
                    {contribuyentes.map(c => <option key={c.id} value={c.id}>{c.razonSocial ?? c.nombre} ({c.documento})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Base gravable (COP) *</label>
                  <input required type="number" min="0" step="any" value={formLiq.baseGravable} onChange={e => setFormLiq(p => ({...p, baseGravable: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tarifa (ej: 0.005 = 0.5%) *</label>
                  <input required type="number" min="0" step="any" value={formLiq.tarifa} onChange={e => setFormLiq(p => ({...p, tarifa: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Intereses (COP)</label>
                  <input type="number" min="0" value={formLiq.intereses} onChange={e => setFormLiq(p => ({...p, intereses: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Descuentos (COP)</label>
                  <input type="number" min="0" value={formLiq.descuentos} onChange={e => setFormLiq(p => ({...p, descuentos: e.target.value}))} className={inputCls} />
                </div>
              </div>
              {(formLiq.baseGravable && formLiq.tarifa) && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-blue-500">Impuesto</p><p className="font-bold">{fmt.format(impuestoPreview.impuesto)}</p></div>
                  <div><p className="text-xs text-blue-500">+Int −Desc</p><p className="font-bold">{fmt.format((parseFloat(formLiq.intereses)||0) - (parseFloat(formLiq.descuentos)||0))}</p></div>
                  <div><p className="text-xs text-blue-500">Total a cobrar</p><p className="font-bold text-blue-700">{fmt.format(impuestoPreview.total)}</p></div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Período</label>
                  <input value={formLiq.periodo} onChange={e => setFormLiq(p => ({...p, periodo: e.target.value}))} placeholder="T1, 03, S1…" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha de vencimiento</label>
                  <input type="date" value={formLiq.fechaVencimiento} onChange={e => setFormLiq(p => ({...p, fechaVencimiento: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalLiq(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Crear liquidación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Registrar pago ─── */}
      {modalPago && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-semibold text-gray-900">Registrar pago</h2>
                <p className="text-xs text-gray-400">{modalPago.numero} · Saldo: <strong>{fmt.format(modalPago.saldo)}</strong></p>
              </div>
              <button onClick={() => setModalPago(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={registrarPago} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Valor (COP) *</label>
                  <input required type="number" min="1" max={modalPago.saldo} step="any"
                    value={formPago.valor} onChange={e => setFormPago(p => ({...p, valor: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha *</label>
                  <input required type="date" value={formPago.fecha} onChange={e => setFormPago(p => ({...p, fecha: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Medio de pago *</label>
                <select required value={formPago.medioPago} onChange={e => setFormPago(p => ({...p, medioPago: e.target.value as RenMedioPago}))} className={inputCls}>
                  {(['EFECTIVO','TRANSFERENCIA','PSE','CHEQUE','DATAFONO','OTRO'] as const).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>N° Referencia / Recibo</label>
                <input value={formPago.referencia} onChange={e => setFormPago(p => ({...p, referencia: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Observación</label>
                <textarea rows={2} value={formPago.observacion} onChange={e => setFormPago(p => ({...p, observacion: e.target.value}))} className={inputCls} />
              </div>
              {formPago.valor && (
                <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                  Saldo después del pago: <strong>{fmt.format(Math.max(0, modalPago.saldo - (parseFloat(formPago.valor) || 0)))}</strong>
                  {parseFloat(formPago.valor) >= modalPago.saldo && <span className="ml-2 font-bold text-green-700">→ PAGADA</span>}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalPago(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Nuevo contribuyente ─── */}
      {modalContr && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Nuevo contribuyente</h2>
              <button onClick={() => setModalContr(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearContribuyente} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tipo documento</label>
                  <select value={formContr.tipoDoc} onChange={e => setFormContr(p => ({...p, tipoDoc: e.target.value}))} className={inputCls}>
                    {['CC','NIT','CE','PASAPORTE'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Número documento *</label>
                  <input required value={formContr.documento} onChange={e => setFormContr(p => ({...p, documento: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Nombre completo *</label>
                <input required value={formContr.nombre} onChange={e => setFormContr(p => ({...p, nombre: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Razón social (empresas)</label>
                <input value={formContr.razonSocial} onChange={e => setFormContr(p => ({...p, razonSocial: e.target.value}))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Dirección</label>
                  <input value={formContr.direccion} onChange={e => setFormContr(p => ({...p, direccion: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input value={formContr.telefono} onChange={e => setFormContr(p => ({...p, telefono: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={formContr.email} onChange={e => setFormContr(p => ({...p, email: e.target.value}))} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalContr(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Crear contribuyente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
