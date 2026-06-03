"use client"

import { useState, useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AlmCategoria  = 'PAPELERIA_UTILES' | 'ASEO_CAFETERIA' | 'TONER_INSUMOS_TIC' | 'HERRAMIENTAS' | 'MEDICAMENTOS' | 'COMBUSTIBLE' | 'MATERIALES_OBRA' | 'OTRO'
type TipoEntrada   = 'COMPRA' | 'DONACION' | 'REINTEGRO' | 'AJUSTE_POSITIVO'

interface Articulo {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  unidad: string
  categoria: AlmCategoria
  marca: string | null
  stockMinimo: number
  stockActual: number
  ubicacionBodega: string | null
  activo: boolean
}

interface Entrada {
  id: string
  articuloId: string
  tipo: TipoEntrada
  cantidad: number
  fechaEntrada: string
  proveedor: string | null
  facturaNumero: string | null
  articulo: { codigo: string; nombre: string; unidad: string }
}

interface Salida {
  id: string
  articuloId: string
  cantidad: number
  fechaSalida: string
  dependenciaNombre: string | null
  funcionarioNombre: string | null
  actaNumero: string | null
  articulo: { codigo: string; nombre: string; unidad: string }
}

interface Kpis {
  totalArticulos: number
  enAlerta: number
  valorInventario: number
}

interface Props {
  articulos: Articulo[]
  entradasRecientes: Entrada[]
  salidasRecientes: Salida[]
  alertas: Articulo[]
  kpis: Kpis
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIA_LABEL: Record<AlmCategoria, string> = {
  PAPELERIA_UTILES:  'Papelería y útiles',
  ASEO_CAFETERIA:    'Aseo y cafetería',
  TONER_INSUMOS_TIC: 'TIC e insumos',
  HERRAMIENTAS:      'Herramientas',
  MEDICAMENTOS:      'Medicamentos',
  COMBUSTIBLE:       'Combustible',
  MATERIALES_OBRA:   'Materiales de obra',
  OTRO:              'Otro',
}

const TIPO_ENTRADA_LABEL: Record<TipoEntrada, string> = {
  COMPRA:           'Compra',
  DONACION:         'Donación',
  REINTEGRO:        'Reintegro',
  AJUSTE_POSITIVO:  'Ajuste positivo',
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AlmacenClient({ articulos: initialArticulos, entradasRecientes, salidasRecientes, alertas, kpis }: Props) {
  const [articulos, setArticulos] = useState<Articulo[]>(initialArticulos)
  const [tab, setTab]             = useState<'inventario' | 'entradas' | 'salidas' | 'alertas'>('inventario')
  const [q, setQ]                 = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')

  // Modals
  const [modalArticulo, setModalArticulo] = useState(false)
  const [modalEntrada, setModalEntrada]   = useState<Articulo | null>(null)
  const [modalSalida, setModalSalida]     = useState<Articulo | null>(null)
  const [saving, setSaving]               = useState(false)

  // Listas de movimientos (se actualizan optimísticamente)
  const [entradas, setEntradas] = useState<Entrada[]>(entradasRecientes)
  const [salidas, setSalidas]   = useState<Salida[]>(salidasRecientes)

  // Forms
  const [formArt, setFormArt] = useState({
    codigo: '', nombre: '', unidad: 'Unidad', categoria: 'PAPELERIA_UTILES' as AlmCategoria,
    descripcion: '', marca: '', stockMinimo: '0', ubicacionBodega: '',
  })
  const [formEntrada, setFormEntrada] = useState({
    tipo: 'COMPRA' as TipoEntrada, cantidad: '', valorUnitario: '',
    fechaEntrada: new Date().toISOString().slice(0, 10),
    proveedor: '', facturaNumero: '', ordenCompraNumero: '', observacion: '',
  })
  const [formSalida, setFormSalida] = useState({
    cantidad: '', fechaSalida: new Date().toISOString().slice(0, 10),
    dependenciaNombre: '', funcionarioNombre: '', actaNumero: '', observacion: '',
  })

  const filtered = useMemo(() => articulos.filter(a => {
    const matchQ = !q || [a.nombre, a.codigo, a.marca ?? ''].some(s => s.toLowerCase().includes(q.toLowerCase()))
    const matchC = filtroCategoria === 'todas' || a.categoria === filtroCategoria
    return matchQ && matchC
  }), [articulos, q, filtroCategoria])

  const articulosEnAlerta = useMemo(() => articulos.filter(a => a.stockMinimo > 0 && a.stockActual <= a.stockMinimo), [articulos])

  async function crearArticulo(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...formArt,
        stockMinimo: Number(formArt.stockMinimo) || 0,
      }
      const res = await fetch('/api/admin/alm/articulos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nuevo = await res.json()
      setArticulos(prev => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setModalArticulo(false)
      setFormArt({ codigo: '', nombre: '', unidad: 'Unidad', categoria: 'PAPELERIA_UTILES', descripcion: '', marca: '', stockMinimo: '0', ubicacionBodega: '' })
    } finally { setSaving(false) }
  }

  async function crearEntrada(e: React.FormEvent) {
    e.preventDefault()
    if (!modalEntrada) return
    setSaving(true)
    try {
      const body = {
        articuloId:        modalEntrada.id,
        tipo:              formEntrada.tipo,
        cantidad:          Number(formEntrada.cantidad),
        valorUnitario:     formEntrada.valorUnitario ? Number(formEntrada.valorUnitario) : undefined,
        fechaEntrada:      new Date(formEntrada.fechaEntrada).toISOString(),
        proveedor:         formEntrada.proveedor || undefined,
        facturaNumero:     formEntrada.facturaNumero || undefined,
        ordenCompraNumero: formEntrada.ordenCompraNumero || undefined,
        observacion:       formEntrada.observacion || undefined,
      }
      const res = await fetch('/api/admin/alm/entradas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nueva = await res.json()
      const cant = Number(formEntrada.cantidad)
      setArticulos(prev => prev.map(a => a.id === modalEntrada.id ? { ...a, stockActual: a.stockActual + cant } : a))
      setEntradas(prev => [{ ...nueva, articulo: { codigo: modalEntrada.codigo, nombre: modalEntrada.nombre, unidad: modalEntrada.unidad } }, ...prev])
      setModalEntrada(null)
      setFormEntrada({ tipo: 'COMPRA', cantidad: '', valorUnitario: '', fechaEntrada: new Date().toISOString().slice(0, 10), proveedor: '', facturaNumero: '', ordenCompraNumero: '', observacion: '' })
    } finally { setSaving(false) }
  }

  async function crearSalida(e: React.FormEvent) {
    e.preventDefault()
    if (!modalSalida) return
    const cant = Number(formSalida.cantidad)
    if (cant > modalSalida.stockActual) {
      alert(`Stock insuficiente. Disponible: ${modalSalida.stockActual} ${modalSalida.unidad}`)
      return
    }
    setSaving(true)
    try {
      const body = {
        articuloId:        modalSalida.id,
        cantidad:          cant,
        fechaSalida:       new Date(formSalida.fechaSalida).toISOString(),
        dependenciaNombre: formSalida.dependenciaNombre || undefined,
        funcionarioNombre: formSalida.funcionarioNombre || undefined,
        actaNumero:        formSalida.actaNumero || undefined,
        observacion:       formSalida.observacion || undefined,
      }
      const res = await fetch('/api/admin/alm/salidas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nueva = await res.json()
      setArticulos(prev => prev.map(a => a.id === modalSalida.id ? { ...a, stockActual: a.stockActual - cant } : a))
      setSalidas(prev => [{ ...nueva, articulo: { codigo: modalSalida.codigo, nombre: modalSalida.nombre, unidad: modalSalida.unidad } }, ...prev])
      setModalSalida(null)
      setFormSalida({ cantidad: '', fechaSalida: new Date().toISOString().slice(0, 10), dependenciaNombre: '', funcionarioNombre: '', actaNumero: '', observacion: '' })
    } finally { setSaving(false) }
  }

  const inputCls = "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-xs font-medium text-gray-700 mb-1"

  const stockBadge = (a: Articulo) => {
    if (a.stockMinimo > 0 && a.stockActual <= a.stockMinimo)
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{a.stockActual} ⚠</span>
    return <span className="text-sm font-semibold text-gray-800">{a.stockActual}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Almacén</h1>
          <p className="text-sm text-gray-500 mt-1">Inventario de suministros y elementos de consumo</p>
        </div>
        <button onClick={() => setModalArticulo(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Nuevo artículo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Artículos activos</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{kpis.totalArticulos}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">En alerta de stock</p>
          <p className={`text-2xl font-bold mt-1 ${articulosEnAlerta.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{articulosEnAlerta.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Total unidades en bodega</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{articulos.reduce((s, a) => s + a.stockActual, 0).toLocaleString('es-CO')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([
          { key: 'inventario', label: 'Inventario' },
          { key: 'entradas',   label: 'Entradas' },
          { key: 'salidas',    label: 'Salidas' },
          { key: 'alertas',    label: `Alertas${articulosEnAlerta.length > 0 ? ` (${articulosEnAlerta.length})` : ''}` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Inventario ─── */}
      {tab === 'inventario' && (
        <>
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, código..."
              className="border rounded px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="todas">Todas las categorías</option>
              {Object.entries(CATEGORIA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>{['Código', 'Nombre', 'Categoría', 'Unidad', 'Marca', 'Ubicación', 'Stock mín.', 'Stock actual', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-gray-400 py-12">Sin artículos registrados</td></tr>
                  ) : filtered.map(a => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.codigo}</td>
                      <td className="px-4 py-3 font-medium">{a.nombre}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{CATEGORIA_LABEL[a.categoria]}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.unidad}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.marca ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.ubicacionBodega ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{a.stockMinimo}</td>
                      <td className="px-4 py-3">{stockBadge(a)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setModalEntrada(a)} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">Entrada</button>
                          <button onClick={() => setModalSalida(a)} className="text-xs px-2 py-1 rounded bg-orange-50 text-orange-700 hover:bg-orange-100">Salida</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Tab: Entradas ─── */}
      {tab === 'entradas' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>{['Fecha', 'Artículo', 'Tipo', 'Cantidad', 'Proveedor', 'Factura'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {entradas.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-12">Sin entradas registradas</td></tr>
              ) : entradas.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(e.fechaEntrada).toLocaleDateString('es-CO')}</td>
                  <td className="px-4 py-3 font-medium">{e.articulo.nombre} <span className="text-gray-400 text-xs">({e.articulo.codigo})</span></td>
                  <td className="px-4 py-3 text-xs text-gray-600">{TIPO_ENTRADA_LABEL[e.tipo]}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">+{e.cantidad} {e.articulo.unidad}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.proveedor ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.facturaNumero ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Salidas ─── */}
      {tab === 'salidas' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>{['Fecha', 'Artículo', 'Cantidad', 'Dependencia', 'Funcionario', 'Acta'].map(h => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y">
              {salidas.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-12">Sin salidas registradas</td></tr>
              ) : salidas.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.fechaSalida).toLocaleDateString('es-CO')}</td>
                  <td className="px-4 py-3 font-medium">{s.articulo.nombre}</td>
                  <td className="px-4 py-3 font-semibold text-orange-700">-{s.cantidad} {s.articulo.unidad}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.dependenciaNombre ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.funcionarioNombre ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{s.actaNumero ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Alertas ─── */}
      {tab === 'alertas' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {articulosEnAlerta.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Todos los artículos tienen stock suficiente</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-red-50 text-left">
                <tr>{['Código', 'Artículo', 'Categoría', 'Unidad', 'Stock mín.', 'Stock actual', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-medium text-red-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y">
                {articulosEnAlerta.map(a => (
                  <tr key={a.id} className="hover:bg-red-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.codigo}</td>
                    <td className="px-4 py-3 font-medium text-red-800">{a.nombre}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{CATEGORIA_LABEL[a.categoria]}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{a.unidad}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{a.stockMinimo}</td>
                    <td className="px-4 py-3 font-bold text-red-700">{a.stockActual} ⚠</td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setModalEntrada(a); setTab('inventario') }}
                        className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">
                        Registrar entrada
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Modal: Nuevo artículo ─── */}
      {modalArticulo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Nuevo artículo de almacén</h2>
              <button onClick={() => setModalArticulo(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearArticulo} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Código *</label>
                  <input required value={formArt.codigo} onChange={e => setFormArt(p => ({...p, codigo: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nombre *</label>
                  <input required value={formArt.nombre} onChange={e => setFormArt(p => ({...p, nombre: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría *</label>
                  <select required value={formArt.categoria} onChange={e => setFormArt(p => ({...p, categoria: e.target.value as AlmCategoria}))} className={inputCls}>
                    {Object.entries(CATEGORIA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Unidad de medida *</label>
                  <input required value={formArt.unidad} onChange={e => setFormArt(p => ({...p, unidad: e.target.value}))} placeholder="Unidad, Resma, Litro..." className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Marca</label>
                  <input value={formArt.marca} onChange={e => setFormArt(p => ({...p, marca: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stock mínimo (alerta)</label>
                  <input type="number" min="0" value={formArt.stockMinimo} onChange={e => setFormArt(p => ({...p, stockMinimo: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Ubicación en bodega</label>
                <input value={formArt.ubicacionBodega} onChange={e => setFormArt(p => ({...p, ubicacionBodega: e.target.value}))} placeholder="Ej: Estante A, Posición 3" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={2} value={formArt.descripcion} onChange={e => setFormArt(p => ({...p, descripcion: e.target.value}))} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalArticulo(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Crear artículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Entrada ─── */}
      {modalEntrada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Entrada: <span className="text-green-600">{modalEntrada.nombre}</span></h2>
              <button onClick={() => setModalEntrada(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearEntrada} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tipo de entrada *</label>
                  <select required value={formEntrada.tipo} onChange={e => setFormEntrada(p => ({...p, tipo: e.target.value as TipoEntrada}))} className={inputCls}>
                    {Object.entries(TIPO_ENTRADA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Cantidad ({modalEntrada.unidad}) *</label>
                  <input required type="number" min="1" value={formEntrada.cantidad} onChange={e => setFormEntrada(p => ({...p, cantidad: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fecha *</label>
                  <input required type="date" value={formEntrada.fechaEntrada} onChange={e => setFormEntrada(p => ({...p, fechaEntrada: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Valor unitario (COP)</label>
                  <input type="number" min="0" value={formEntrada.valorUnitario} onChange={e => setFormEntrada(p => ({...p, valorUnitario: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Proveedor</label>
                  <input value={formEntrada.proveedor} onChange={e => setFormEntrada(p => ({...p, proveedor: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>N° Factura / Orden de compra</label>
                  <input value={formEntrada.facturaNumero} onChange={e => setFormEntrada(p => ({...p, facturaNumero: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Observación</label>
                <textarea rows={2} value={formEntrada.observacion} onChange={e => setFormEntrada(p => ({...p, observacion: e.target.value}))} className={inputCls} />
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700">
                Stock actual: <strong>{modalEntrada.stockActual}</strong> → después: <strong>{modalEntrada.stockActual + (Number(formEntrada.cantidad) || 0)}</strong> {modalEntrada.unidad}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalEntrada(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Salida ─── */}
      {modalSalida && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Salida: <span className="text-orange-600">{modalSalida.nombre}</span></h2>
              <button onClick={() => setModalSalida(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearSalida} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Cantidad ({modalSalida.unidad}) *</label>
                  <input required type="number" min="1" max={modalSalida.stockActual} value={formSalida.cantidad} onChange={e => setFormSalida(p => ({...p, cantidad: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha *</label>
                  <input required type="date" value={formSalida.fechaSalida} onChange={e => setFormSalida(p => ({...p, fechaSalida: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Dependencia destino</label>
                  <input value={formSalida.dependenciaNombre} onChange={e => setFormSalida(p => ({...p, dependenciaNombre: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Funcionario receptor</label>
                  <input value={formSalida.funcionarioNombre} onChange={e => setFormSalida(p => ({...p, funcionarioNombre: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>N° Acta de entrega</label>
                <input value={formSalida.actaNumero} onChange={e => setFormSalida(p => ({...p, actaNumero: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Observación</label>
                <textarea rows={2} value={formSalida.observacion} onChange={e => setFormSalida(p => ({...p, observacion: e.target.value}))} className={inputCls} />
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-sm text-orange-700">
                Stock actual: <strong>{modalSalida.stockActual}</strong> → después: <strong>{modalSalida.stockActual - (Number(formSalida.cantidad) || 0)}</strong> {modalSalida.unidad}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalSalida(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar salida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
