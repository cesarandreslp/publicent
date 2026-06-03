"use client"

import { useState, useMemo } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivoEstado    = 'EN_SERVICIO' | 'EN_MANTENIMIENTO' | 'EN_BODEGA' | 'DADO_DE_BAJA' | 'EXTRAVIADO'
type ActivoCategoria = 'MUEBLE_ENSERE' | 'EQUIPO_COMPUTO' | 'EQUIPO_COMUNICACION' | 'EQUIPO_AUDIOVISUAL' | 'MAQUINARIA_EQUIPO' | 'VEHICULO' | 'INMUEBLE' | 'SEMOVIENTE' | 'INTANGIBLE' | 'OTRO'
type TipoMov = 'INGRESO' | 'ASIGNACION' | 'TRASLADO' | 'DEVOLUCION' | 'BAJA' | 'REINTEGRO'
type TipoMnt = 'PREVENTIVO' | 'CORRECTIVO' | 'GARANTIA'

interface Bien {
  id: string
  codigo: string
  nombre: string
  categoria: ActivoCategoria
  tipo: string | null
  marca: string | null
  modelo: string | null
  serial: string | null
  estado: ActivoEstado
  ubicacion: string | null
  responsableNombre: string | null
  valorAdquisicion: number | null
  fechaAdquisicion: string | null
  _count: { asignaciones: number; mantenimientos: number }
}

interface ProxMnt {
  id: string
  proximoMantenimiento: string | null
  activo: { codigo: string; nombre: string }
}

interface Kpis {
  total: number
  enServicio: number
  enMantenimiento: number
  dadosDeBaja: number
  valorTotal: number
}

interface Props {
  bienes: Bien[]
  proximosMantenimientos: ProxMnt[]
  kpis: Kpis
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIA_LABEL: Record<ActivoCategoria, string> = {
  MUEBLE_ENSERE:       'Muebles y enseres',
  EQUIPO_COMPUTO:      'Equipos de cómputo',
  EQUIPO_COMUNICACION: 'Comunicaciones',
  EQUIPO_AUDIOVISUAL:  'Audiovisual',
  MAQUINARIA_EQUIPO:   'Maquinaria',
  VEHICULO:            'Vehículos',
  INMUEBLE:            'Inmuebles',
  SEMOVIENTE:          'Semovientes',
  INTANGIBLE:          'Intangibles',
  OTRO:                'Otro',
}

const ESTADO_COLOR: Record<ActivoEstado, string> = {
  EN_SERVICIO:       'bg-green-100 text-green-800',
  EN_MANTENIMIENTO:  'bg-yellow-100 text-yellow-800',
  EN_BODEGA:         'bg-blue-100 text-blue-800',
  DADO_DE_BAJA:      'bg-red-100 text-red-800',
  EXTRAVIADO:        'bg-gray-100 text-gray-800',
}

const ESTADO_LABEL: Record<ActivoEstado, string> = {
  EN_SERVICIO:      'En servicio',
  EN_MANTENIMIENTO: 'En mantenimiento',
  EN_BODEGA:        'En bodega',
  DADO_DE_BAJA:     'Dado de baja',
  EXTRAVIADO:       'Extraviado',
}

const fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

// ─── Main component ───────────────────────────────────────────────────────────

export default function ActivosClient({ bienes: initialBienes, proximosMantenimientos, kpis }: Props) {
  const [bienes, setBienes]         = useState<Bien[]>(initialBienes)
  const [q, setQ]                   = useState('')
  const [filtroEstado, setFiltroEstado]       = useState<string>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas')
  const [tab, setTab]               = useState<'inventario' | 'alertas'>('inventario')

  // Modals
  const [modalBien, setModalBien]           = useState(false)
  const [modalAsig, setModalAsig]           = useState<Bien | null>(null)
  const [modalMnt, setModalMnt]             = useState<Bien | null>(null)
  const [modalMov, setModalMov]             = useState<Bien | null>(null)
  const [saving, setSaving]                 = useState(false)

  // Form states
  const [formBien, setFormBien] = useState({
    codigo: '', nombre: '', categoria: 'EQUIPO_COMPUTO' as ActivoCategoria,
    tipo: '', marca: '', modelo: '', serial: '', color: '',
    valorAdquisicion: '', fechaAdquisicion: '', vidaUtilAnios: '',
    dependenciaNombre: '', responsableNombre: '', ubicacion: '', observaciones: '',
  })
  const [formAsig, setFormAsig] = useState({
    funcionarioNombre: '', dependenciaNombre: '', fechaInicio: '', actaNumero: '', observacion: '',
  })
  const [formMnt, setFormMnt] = useState({
    tipo: 'PREVENTIVO' as TipoMnt, fecha: '', descripcion: '', proveedor: '', costo: '', proximoMantenimiento: '',
  })
  const [formMov, setFormMov] = useState({
    tipo: 'TRASLADO' as TipoMov, fecha: '', descripcion: '', origenDependencia: '', destinoDependencia: '', actaNumero: '',
  })

  // Filter
  const filtered = useMemo(() => bienes.filter(b => {
    const matchQ = !q || [b.nombre, b.codigo, b.serial ?? '', b.marca ?? '', b.ubicacion ?? ''].some(s => s.toLowerCase().includes(q.toLowerCase()))
    const matchE = filtroEstado === 'todos' || b.estado === filtroEstado
    const matchC = filtroCategoria === 'todas' || b.categoria === filtroCategoria
    return matchQ && matchE && matchC
  }), [bienes, q, filtroEstado, filtroCategoria])

  async function crearBien(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...formBien,
        valorAdquisicion:  formBien.valorAdquisicion  ? Number(formBien.valorAdquisicion)  : undefined,
        vidaUtilAnios:     formBien.vidaUtilAnios     ? Number(formBien.vidaUtilAnios)     : undefined,
        fechaAdquisicion:  formBien.fechaAdquisicion  ? new Date(formBien.fechaAdquisicion).toISOString() : undefined,
      }
      const res = await fetch('/api/admin/activos/bienes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      const nuevo = await res.json()
      setBienes(prev => [{ ...nuevo, _count: { asignaciones: 0, mantenimientos: 0 } }, ...prev])
      setModalBien(false)
      setFormBien({ codigo: '', nombre: '', categoria: 'EQUIPO_COMPUTO', tipo: '', marca: '', modelo: '', serial: '', color: '', valorAdquisicion: '', fechaAdquisicion: '', vidaUtilAnios: '', dependenciaNombre: '', responsableNombre: '', ubicacion: '', observaciones: '' })
    } finally { setSaving(false) }
  }

  async function crearAsignacion(e: React.FormEvent) {
    e.preventDefault()
    if (!modalAsig) return
    setSaving(true)
    try {
      const body = {
        activoId: modalAsig.id,
        funcionarioNombre: formAsig.funcionarioNombre,
        dependenciaNombre: formAsig.dependenciaNombre || undefined,
        fechaInicio: new Date(formAsig.fechaInicio).toISOString(),
        actaNumero: formAsig.actaNumero || undefined,
        observacion: formAsig.observacion || undefined,
      }
      const res = await fetch('/api/admin/activos/asignaciones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      setBienes(prev => prev.map(b => b.id === modalAsig.id ? { ...b, responsableNombre: formAsig.funcionarioNombre, estado: 'EN_SERVICIO' as ActivoEstado } : b))
      setModalAsig(null)
      setFormAsig({ funcionarioNombre: '', dependenciaNombre: '', fechaInicio: '', actaNumero: '', observacion: '' })
    } finally { setSaving(false) }
  }

  async function crearMantenimiento(e: React.FormEvent) {
    e.preventDefault()
    if (!modalMnt) return
    setSaving(true)
    try {
      const body = {
        activoId: modalMnt.id,
        tipo: formMnt.tipo,
        fecha: new Date(formMnt.fecha).toISOString(),
        descripcion: formMnt.descripcion,
        proveedor: formMnt.proveedor || undefined,
        costo: formMnt.costo ? Number(formMnt.costo) : undefined,
        proximoMantenimiento: formMnt.proximoMantenimiento ? new Date(formMnt.proximoMantenimiento).toISOString() : undefined,
      }
      const res = await fetch('/api/admin/activos/mantenimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      setBienes(prev => prev.map(b => b.id === modalMnt.id ? { ...b, estado: 'EN_MANTENIMIENTO' as ActivoEstado } : b))
      setModalMnt(null)
      setFormMnt({ tipo: 'PREVENTIVO', fecha: '', descripcion: '', proveedor: '', costo: '', proximoMantenimiento: '' })
    } finally { setSaving(false) }
  }

  async function crearMovimiento(e: React.FormEvent) {
    e.preventDefault()
    if (!modalMov) return
    setSaving(true)
    try {
      const body = {
        activoId: modalMov.id,
        tipo: formMov.tipo,
        fecha: new Date(formMov.fecha).toISOString(),
        descripcion: formMov.descripcion,
        origenDependencia: formMov.origenDependencia || undefined,
        destinoDependencia: formMov.destinoDependencia || undefined,
        actaNumero: formMov.actaNumero || undefined,
      }
      const NUEVO_ESTADO: Record<string, ActivoEstado> = {
        INGRESO: 'EN_SERVICIO', ASIGNACION: 'EN_SERVICIO', TRASLADO: 'EN_SERVICIO',
        DEVOLUCION: 'EN_BODEGA', BAJA: 'DADO_DE_BAJA', REINTEGRO: 'EN_SERVICIO',
      }
      const res = await fetch('/api/admin/activos/movimientos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { alert((await res.json()).error); return }
      setBienes(prev => prev.map(b => b.id === modalMov.id ? { ...b, estado: NUEVO_ESTADO[formMov.tipo] } : b))
      setModalMov(null)
      setFormMov({ tipo: 'TRASLADO', fecha: '', descripcion: '', origenDependencia: '', destinoDependencia: '', actaNumero: '' })
    } finally { setSaving(false) }
  }

  const inputCls = "w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-xs font-medium text-gray-700 mb-1"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activos y bienes</h1>
          <p className="text-sm text-gray-500 mt-1">Inventario institucional de bienes muebles e inmuebles</p>
        </div>
        <button onClick={() => setModalBien(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Nuevo activo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total activos',     value: kpis.total,            color: 'blue' },
          { label: 'En servicio',       value: kpis.enServicio,       color: 'green' },
          { label: 'En mantenimiento',  value: kpis.enMantenimiento,  color: 'yellow' },
          { label: 'Dados de baja',     value: kpis.dadosDeBaja,      color: 'red' },
          { label: 'Valor inventario',  value: fmt.format(kpis.valorTotal), color: 'purple', isText: true },
        ].map(k => (
          <div key={k.label} className={`bg-white rounded-xl shadow-sm border p-4`}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className={`text-2xl font-bold text-${k.color}-600 mt-1`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['inventario', 'alertas'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'alertas' ? `Alertas mantenimiento${proximosMantenimientos.length > 0 ? ` (${proximosMantenimientos.length})` : ''}` : 'Inventario'}
          </button>
        ))}
      </div>

      {tab === 'alertas' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {proximosMantenimientos.length === 0 ? (
            <p className="text-center text-gray-500 py-10">Sin mantenimientos próximos en los próximos 30 días</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>{['Código','Activo','Fecha próx. mantenimiento'].map(h => <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {proximosMantenimientos.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{m.activo.codigo}</td>
                    <td className="px-4 py-3">{m.activo.nombre}</td>
                    <td className="px-4 py-3 text-orange-600 font-medium">{m.proximoMantenimiento ? new Date(m.proximoMantenimiento).toLocaleDateString('es-CO') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'inventario' && (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, código, serial..."
              className="border rounded px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="todos">Todos los estados</option>
              {Object.entries(ESTADO_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="todas">Todas las categorías</option>
              {Object.entries(CATEGORIA_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>{['Código','Nombre','Categoría','Marca / Modelo','Estado','Responsable','Ubicación','Valor','Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="text-center text-gray-400 py-12">Sin activos registrados</td></tr>
                  ) : filtered.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.codigo}</td>
                      <td className="px-4 py-3 font-medium max-w-48 truncate">{b.nombre}</td>
                      <td className="px-4 py-3 text-gray-600">{CATEGORIA_LABEL[b.categoria]}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{[b.marca, b.modelo].filter(Boolean).join(' / ') || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_COLOR[b.estado]}`}>
                          {ESTADO_LABEL[b.estado]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{b.responsableNombre ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-32 truncate">{b.ubicacion ?? '—'}</td>
                      <td className="px-4 py-3 text-xs">{b.valorAdquisicion ? fmt.format(b.valorAdquisicion) : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setModalAsig(b)} title="Asignar" className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">Asignar</button>
                          <button onClick={() => setModalMnt(b)} title="Mantenimiento" className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100">Mnt.</button>
                          <button onClick={() => setModalMov(b)} title="Movimiento" className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-700 hover:bg-gray-100">Mov.</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500">
                Mostrando {filtered.length} de {bienes.length} activos
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal: Nuevo activo ─────────────────────────────────────────────── */}
      {modalBien && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Registrar nuevo activo</h2>
              <button onClick={() => setModalBien(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearBien} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Código / Placa *</label>
                  <input required value={formBien.codigo} onChange={e => setFormBien(p => ({...p, codigo: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nombre *</label>
                  <input required value={formBien.nombre} onChange={e => setFormBien(p => ({...p, nombre: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría *</label>
                  <select required value={formBien.categoria} onChange={e => setFormBien(p => ({...p, categoria: e.target.value as ActivoCategoria}))} className={inputCls}>
                    {Object.entries(CATEGORIA_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo (ej: Laptop, Escritorio)</label>
                  <input value={formBien.tipo} onChange={e => setFormBien(p => ({...p, tipo: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Marca</label>
                  <input value={formBien.marca} onChange={e => setFormBien(p => ({...p, marca: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Modelo</label>
                  <input value={formBien.modelo} onChange={e => setFormBien(p => ({...p, modelo: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Serial / Placa</label>
                  <input value={formBien.serial} onChange={e => setFormBien(p => ({...p, serial: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Valor adquisición (COP)</label>
                  <input type="number" min="0" value={formBien.valorAdquisicion} onChange={e => setFormBien(p => ({...p, valorAdquisicion: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Fecha adquisición</label>
                  <input type="date" value={formBien.fechaAdquisicion} onChange={e => setFormBien(p => ({...p, fechaAdquisicion: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vida útil (años)</label>
                  <input type="number" min="1" value={formBien.vidaUtilAnios} onChange={e => setFormBien(p => ({...p, vidaUtilAnios: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Responsable</label>
                  <input value={formBien.responsableNombre} onChange={e => setFormBien(p => ({...p, responsableNombre: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Dependencia</label>
                  <input value={formBien.dependenciaNombre} onChange={e => setFormBien(p => ({...p, dependenciaNombre: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Ubicación física</label>
                <input value={formBien.ubicacion} onChange={e => setFormBien(p => ({...p, ubicacion: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Observaciones</label>
                <textarea rows={2} value={formBien.observaciones} onChange={e => setFormBien(p => ({...p, observaciones: e.target.value}))} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalBien(false)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar activo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Asignación ───────────────────────────────────────────────── */}
      {modalAsig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Asignar: <span className="text-blue-600">{modalAsig.nombre}</span></h2>
              <button onClick={() => setModalAsig(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearAsignacion} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Funcionario responsable *</label>
                <input required value={formAsig.funcionarioNombre} onChange={e => setFormAsig(p => ({...p, funcionarioNombre: e.target.value}))} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Dependencia</label>
                <input value={formAsig.dependenciaNombre} onChange={e => setFormAsig(p => ({...p, dependenciaNombre: e.target.value}))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fecha inicio *</label>
                  <input required type="date" value={formAsig.fechaInicio} onChange={e => setFormAsig(p => ({...p, fechaInicio: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>N° Acta</label>
                  <input value={formAsig.actaNumero} onChange={e => setFormAsig(p => ({...p, actaNumero: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Observación</label>
                <textarea rows={2} value={formAsig.observacion} onChange={e => setFormAsig(p => ({...p, observacion: e.target.value}))} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalAsig(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Mantenimiento ────────────────────────────────────────────── */}
      {modalMnt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Mantenimiento: <span className="text-yellow-600">{modalMnt.nombre}</span></h2>
              <button onClick={() => setModalMnt(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearMantenimiento} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tipo *</label>
                  <select required value={formMnt.tipo} onChange={e => setFormMnt(p => ({...p, tipo: e.target.value as TipoMnt}))} className={inputCls}>
                    <option value="PREVENTIVO">Preventivo</option>
                    <option value="CORRECTIVO">Correctivo</option>
                    <option value="GARANTIA">Garantía</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Fecha *</label>
                  <input required type="date" value={formMnt.fecha} onChange={e => setFormMnt(p => ({...p, fecha: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción *</label>
                <textarea required rows={2} value={formMnt.descripcion} onChange={e => setFormMnt(p => ({...p, descripcion: e.target.value}))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Proveedor</label>
                  <input value={formMnt.proveedor} onChange={e => setFormMnt(p => ({...p, proveedor: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Costo (COP)</label>
                  <input type="number" min="0" value={formMnt.costo} onChange={e => setFormMnt(p => ({...p, costo: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Próximo mantenimiento</label>
                <input type="date" value={formMnt.proximoMantenimiento} onChange={e => setFormMnt(p => ({...p, proximoMantenimiento: e.target.value}))} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalMnt(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar mantenimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Movimiento ───────────────────────────────────────────────── */}
      {modalMov && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Movimiento: <span className="text-gray-700">{modalMov.nombre}</span></h2>
              <button onClick={() => setModalMov(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={crearMovimiento} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tipo de movimiento *</label>
                  <select required value={formMov.tipo} onChange={e => setFormMov(p => ({...p, tipo: e.target.value as TipoMov}))} className={inputCls}>
                    <option value="TRASLADO">Traslado</option>
                    <option value="DEVOLUCION">Devolución a bodega</option>
                    <option value="BAJA">Baja definitiva</option>
                    <option value="REINTEGRO">Reintegro</option>
                    <option value="INGRESO">Ingreso inicial</option>
                    <option value="ASIGNACION">Asignación</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Fecha *</label>
                  <input required type="date" value={formMov.fecha} onChange={e => setFormMov(p => ({...p, fecha: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Descripción / Justificación *</label>
                <textarea required rows={2} value={formMov.descripcion} onChange={e => setFormMov(p => ({...p, descripcion: e.target.value}))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Dependencia origen</label>
                  <input value={formMov.origenDependencia} onChange={e => setFormMov(p => ({...p, origenDependencia: e.target.value}))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Dependencia destino</label>
                  <input value={formMov.destinoDependencia} onChange={e => setFormMov(p => ({...p, destinoDependencia: e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>N° Acta</label>
                <input value={formMov.actaNumero} onChange={e => setFormMov(p => ({...p, actaNumero: e.target.value}))} className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalMov(null)} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50">
                  {saving ? 'Guardando…' : 'Registrar movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
