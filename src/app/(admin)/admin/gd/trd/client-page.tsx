"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Building2, FolderTree, Layers, FileText,
  Plus, ChevronRight, ChevronDown, Pencil,
  Trash2, Save, X, Archive, Clock, AlertTriangle,
  Search
} from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface TipoDocumental {
  id: string; nombre: string; diasTramite: number; activo: boolean
  subserieId: string
}

interface Subserie {
  id: string; codigo: string; nombre: string
  tiempoGestion: number; tiempoCentral: number
  soporteFisico: boolean; soporteElectronico: boolean
  disposicion: string; procedimiento?: string | null
  serieId: string; tiposDoc: TipoDocumental[]
}

interface Serie {
  id: string; codigo: string; nombre: string
  dependenciaId: string; subseries: Subserie[]
}

interface Dependencia {
  id: string; codigo: string; nombre: string; descripcion?: string | null
  activa: boolean; padreId?: string | null
  hijas: { id: string; codigo: string; nombre: string }[]
  series: Serie[]
  _count: { radicados: number; expedientes: number }
}

interface Props {
  dependencias: Dependencia[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DISPOSICION_LABEL: Record<string, string> = {
  CONSERVACION_TOTAL: "CT — Conservación Total",
  ELIMINACION: "E — Eliminación",
  SELECCION: "S — Selección",
  MICROFILMACION: "M/D — Microfilmación/Digitalización",
}

// ─── Formularios Inline ──────────────────────────────────────────────────────

function InlineForm({ onSave, onCancel, fields, defaults }: {
  onSave: (data: Record<string, string>) => Promise<void>
  onCancel: () => void
  fields: { name: string; label: string; placeholder: string; type?: string }[]
  defaults?: Record<string, string>
}) {
  const [data, setData] = useState<Record<string, string>>(defaults ?? {})
  const [saving, setSaving] = useState(false)

  return (
    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.name}>
            <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
            <input
              type={f.type ?? "text"}
              value={data[f.name] ?? ""}
              onChange={e => setData({ ...data, [f.name]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-all">
          <X className="w-3.5 h-3.5 inline mr-1" />Cancelar
        </button>
        <button
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            try { await onSave(data) } finally { setSaving(false) }
          }}
          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5 inline mr-1" />Guardar
        </button>
      </div>
    </div>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function TrdClient({ dependencias }: Props) {
  const router = useRouter()
  const [expandido, setExpandido] = useState<Set<string>>(new Set())
  const [busqueda, setBusqueda] = useState("")
  const [creando, setCreando] = useState<{ tipo: string; parentId?: string } | null>(null)

  const toggle = useCallback((id: string) => {
    setExpandido(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  // Guardar entidad via API
  const guardar = async (entidad: string, payload: Record<string, unknown>) => {
    const res = await fetch("/api/admin/gd/trd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entidad, payload }),
    })
    if (!res.ok) throw new Error(await res.text())
    setCreando(null)
    router.refresh()
  }

  // Filtro por búsqueda
  const depsFiltradas = busqueda
    ? dependencias.filter(d =>
        d.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.series.some(s =>
          s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          s.subseries.some(ss => ss.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        )
      )
    : dependencias

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Tabla de Retención Documental
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {dependencias.length} dependencias · {dependencias.reduce((a, d) => a + d.series.length, 0)} series · Acuerdo 004 AGN
            </p>
          </div>
          <button
            onClick={() => setCreando({ tipo: "dependencia" })}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-900/30 text-sm"
          >
            <Plus className="w-4 h-4" /> Nueva Dependencia
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Búsqueda */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar dependencia, serie o subserie..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Form nueva dependencia */}
        {creando?.tipo === "dependencia" && (
          <InlineForm
            fields={[
              { name: "codigo", label: "Código", placeholder: "Ej: PERS-01" },
              { name: "nombre", label: "Nombre", placeholder: "Ej: Despacho del Personero" },
            ]}
            onSave={data => guardar("dependencia", { ...data, activa: true })}
            onCancel={() => setCreando(null)}
          />
        )}

        {/* Árbol TRD */}
        <div className="space-y-3">
          {depsFiltradas.map(dep => {
            const isOpen = expandido.has(dep.id)
            return (
              <div key={dep.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

                {/* Dependencia */}
                <button
                  onClick={() => toggle(dep.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors text-left"
                >
                  {isOpen
                    ? <ChevronDown className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  }
                  <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-emerald-300 text-xs mr-2">{dep.codigo}</span>
                    <span className="font-semibold text-white">{dep.nombre}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{dep.series.length} series</span>
                    <span>{dep._count.radicados} radicados</span>
                    <span>{dep._count.expedientes} expedientes</span>
                  </div>
                </button>

                {/* Contenido expandido */}
                {isOpen && (
                  <div className="border-t border-white/5 px-5 pb-5 pt-3 space-y-3">

                    {/* Botón agregar serie */}
                    <button
                      onClick={() => setCreando({ tipo: "serie", parentId: dep.id })}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg hover:bg-emerald-500/10 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Serie
                    </button>

                    {creando?.tipo === "serie" && creando.parentId === dep.id && (
                      <InlineForm
                        fields={[
                          { name: "codigo", label: "Código", placeholder: "Ej: 1" },
                          { name: "nombre", label: "Nombre", placeholder: "Ej: ACTAS" },
                        ]}
                        onSave={data => guardar("serie", { ...data, dependenciaId: dep.id })}
                        onCancel={() => setCreando(null)}
                      />
                    )}

                    {/* Series */}
                    {dep.series.map(serie => {
                      const serieOpen = expandido.has(serie.id)
                      return (
                        <div key={serie.id} className="ml-6 border-l-2 border-emerald-800/30 pl-4">
                          <button
                            onClick={() => toggle(serie.id)}
                            className="w-full flex items-center gap-2 py-2 text-left hover:bg-white/5 rounded-lg px-2 transition-colors"
                          >
                            {serieOpen
                              ? <ChevronDown className="w-4 h-4 text-teal-400" />
                              : <ChevronRight className="w-4 h-4 text-slate-500" />
                            }
                            <FolderTree className="w-4 h-4 text-teal-400" />
                            <span className="font-mono text-teal-300 text-xs">{serie.codigo}</span>
                            <span className="text-sm text-white">{serie.nombre}</span>
                            <span className="text-xs text-slate-500 ml-auto">{serie.subseries.length} subseries</span>
                          </button>

                          {serieOpen && (
                            <div className="mt-2 space-y-2">
                              <button
                                onClick={() => setCreando({ tipo: "subserie", parentId: serie.id })}
                                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 px-2 py-1 rounded-lg hover:bg-teal-500/10 transition-all ml-6"
                              >
                                <Plus className="w-3 h-3" /> Agregar Subserie
                              </button>

                              {creando?.tipo === "subserie" && creando.parentId === serie.id && (
                                <div className="ml-6">
                                  <InlineForm
                                    fields={[
                                      { name: "codigo", label: "Código", placeholder: "Ej: 1.1" },
                                      { name: "nombre", label: "Nombre", placeholder: "Ej: Actas de Comité" },
                                      { name: "tiempoGestion", label: "Años Gestión", placeholder: "2", type: "number" },
                                      { name: "tiempoCentral", label: "Años Central", placeholder: "3", type: "number" },
                                    ]}
                                    onSave={data => guardar("subserie", {
                                      ...data,
                                      serieId: serie.id,
                                      tiempoGestion: parseInt(data.tiempoGestion) || 2,
                                      tiempoCentral: parseInt(data.tiempoCentral) || 3,
                                    })}
                                    onCancel={() => setCreando(null)}
                                  />
                                </div>
                              )}

                              {/* Subseries */}
                              {serie.subseries.map(sub => (
                                <div key={sub.id} className="ml-10 border-l border-teal-800/20 pl-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-cyan-400" />
                                    <span className="font-mono text-cyan-300 text-xs">{sub.codigo}</span>
                                    <span className="text-sm text-slate-200">{sub.nombre}</span>
                                  </div>

                                  {/* Metadata de la subserie */}
                                  <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-slate-400">
                                      <Clock className="w-3 h-3 inline mr-1" />
                                      Gestión: {sub.tiempoGestion}a · Central: {sub.tiempoCentral}a
                                    </span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded text-slate-400">
                                      <Archive className="w-3 h-3 inline mr-1" />
                                      {DISPOSICION_LABEL[sub.disposicion] ?? sub.disposicion}
                                    </span>
                                    {sub.soporteFisico && (
                                      <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded">📄 Físico</span>
                                    )}
                                    {sub.soporteElectronico && (
                                      <span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">💾 Electrónico</span>
                                    )}
                                  </div>

                                  {/* Tipos documentales */}
                                  {sub.tiposDoc.length > 0 && (
                                    <div className="mt-2 ml-4 space-y-1">
                                      {sub.tiposDoc.map(td => (
                                        <div key={td.id} className="flex items-center gap-2 text-xs text-slate-400">
                                          <FileText className="w-3 h-3 text-slate-500" />
                                          <span>{td.nombre}</span>
                                          <span className="text-slate-600">({td.diasTramite} días hábiles)</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Agregar tipo documental */}
                                  <button
                                    onClick={() => setCreando({ tipo: "tipoDocumental", parentId: sub.id })}
                                    className="flex items-center gap-1 text-[11px] text-cyan-500 hover:text-cyan-300 mt-1 ml-4 px-1.5 py-0.5 rounded hover:bg-cyan-500/10 transition-all"
                                  >
                                    <Plus className="w-3 h-3" /> Tipo documental
                                  </button>

                                  {creando?.tipo === "tipoDocumental" && creando.parentId === sub.id && (
                                    <div className="ml-4 mt-2">
                                      <InlineForm
                                        fields={[
                                          { name: "nombre", label: "Nombre", placeholder: "Ej: Resolución" },
                                          { name: "diasTramite", label: "Días trámite", placeholder: "15", type: "number" },
                                        ]}
                                        onSave={data => guardar("tipoDocumental", {
                                          nombre: data.nombre,
                                          diasTramite: parseInt(data.diasTramite) || 15,
                                          subserieId: sub.id,
                                        })}
                                        onCancel={() => setCreando(null)}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {dep.series.length === 0 && (
                      <p className="ml-6 text-sm text-slate-500 italic">Sin series documentales configuradas</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {depsFiltradas.length === 0 && (
            <div className="text-center py-12">
              <FolderTree className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">No hay dependencias configuradas</p>
              <p className="text-slate-500 text-sm mt-1">Crea la primera dependencia para construir tu TRD</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
