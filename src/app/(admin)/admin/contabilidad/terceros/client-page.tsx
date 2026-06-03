"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Building2, Plus, Pencil, Trash2, Search,
  X, Save, ChevronLeft, CheckCircle2, AlertCircle,
} from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoDoc = "NIT" | "CC" | "CE" | "PA" | "OTRO"

interface Tercero {
  id: string
  documento: string
  tipoDocumento: TipoDoc
  razonSocial: string
  email: string | null
  telefono: string | null
  direccion: string | null
  ciudad: string | null
  activo: boolean
}

interface Props {
  terceros: Tercero[]
}

const TIPO_LABEL: Record<TipoDoc, string> = {
  NIT: "NIT", CC: "Cédula", CE: "Cédula Extran.", PA: "Pasaporte", OTRO: "Otro",
}

// ─── Modal CRUD ───────────────────────────────────────────────────────────────

function TerceroModal({
  inicial,
  onClose,
  onGuardado,
}: {
  inicial?: Tercero
  onClose: () => void
  onGuardado: () => void
}) {
  const esEdicion = !!inicial
  const [form, setForm] = useState({
    documento:     inicial?.documento     ?? "",
    tipoDocumento: inicial?.tipoDocumento ?? "NIT" as TipoDoc,
    razonSocial:   inicial?.razonSocial   ?? "",
    email:         inicial?.email         ?? "",
    telefono:      inicial?.telefono      ?? "",
    direccion:     inicial?.direccion     ?? "",
    ciudad:        inicial?.ciudad        ?? "",
    activo:        inicial?.activo        ?? true,
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  async function handleGuardar() {
    if (!form.documento.trim() || !form.razonSocial.trim()) {
      setError("Documento y razón social son obligatorios")
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const payload = {
        ...form,
        email:    form.email    || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        ciudad:   form.ciudad   || null,
      }
      const url = esEdicion ? `/api/admin/cp/terceros/${inicial!.id}` : "/api/admin/cp/terceros"
      const method = esEdicion ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Error al guardar")
        return
      }
      onGuardado()
    } catch {
      setError("Error de red")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-base font-semibold text-white">
              {esEdicion ? "Editar tercero" : "Nuevo tercero"}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-5 space-y-4">

          {/* Tipo + Documento */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tipo</label>
              <select
                value={form.tipoDocumento}
                onChange={e => set("tipoDocumento", e.target.value)}
                disabled={esEdicion}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                {(Object.keys(TIPO_LABEL) as TipoDoc[]).map(t => (
                  <option key={t} value={t}>{TIPO_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1">
                Número de documento <span className="text-red-400">*</span>
              </label>
              <input
                value={form.documento}
                onChange={e => set("documento", e.target.value)}
                disabled={esEdicion}
                placeholder="Ej: 800197268"
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Razón social */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Razón social / Nombre <span className="text-red-400">*</span>
            </label>
            <input
              value={form.razonSocial}
              onChange={e => set("razonSocial", e.target.value)}
              placeholder="Ej: DIAN — Dirección de Impuestos y Aduanas Nacionales"
              className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Email + Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                placeholder="contacto@entidad.gov.co"
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
              <input
                value={form.telefono}
                onChange={e => set("telefono", e.target.value)}
                placeholder="601 7428700"
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Ciudad + Dirección */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Ciudad</label>
              <input
                value={form.ciudad}
                onChange={e => set("ciudad", e.target.value)}
                placeholder="Bogotá D.C."
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Dirección</label>
              <input
                value={form.direccion}
                onChange={e => set("direccion", e.target.value)}
                placeholder="Cra. 8 # 6C-38"
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Activo (solo en edición) */}
          {esEdicion && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("activo", !form.activo)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.activo ? "bg-blue-600" : "bg-slate-700"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.activo ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-slate-300">{form.activo ? "Activo" : "Inactivo"}</span>
            </label>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-blue-900/30"
          >
            <Save className="w-4 h-4" />
            {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Crear tercero"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TercerosClient({ terceros: inicial }: Props) {
  const router = useRouter()
  const [lista, setLista] = useState<Tercero[]>(inicial)
  const [busqueda, setBusqueda] = useState("")
  const [soloActivos, setSoloActivos] = useState(true)
  const [modal, setModal] = useState<"nuevo" | Tercero | null>(null)
  const [feedback, setFeedback] = useState<{ tipo: "ok" | "error"; msg: string } | null>(null)

  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase()
    return lista.filter(t =>
      (!soloActivos || t.activo) &&
      (
        t.documento.toLowerCase().includes(q) ||
        t.razonSocial.toLowerCase().includes(q) ||
        (t.ciudad ?? "").toLowerCase().includes(q)
      )
    )
  }, [lista, busqueda, soloActivos])

  function mostrarFeedback(tipo: "ok" | "error", msg: string) {
    setFeedback({ tipo, msg })
    setTimeout(() => setFeedback(null), 4000)
  }

  async function handleEliminar(t: Tercero) {
    if (!confirm(`¿Eliminar o inactivar "${t.razonSocial}"?`)) return
    const res = await fetch(`/api/admin/cp/terceros/${t.id}`, { method: "DELETE" })
    if (res.ok) {
      const data = await res.json()
      if (data.inactivado) {
        setLista(prev => prev.map(x => x.id === t.id ? { ...x, activo: false } : x))
        mostrarFeedback("ok", "Tercero inactivado (tiene asientos registrados)")
      } else {
        setLista(prev => prev.filter(x => x.id !== t.id))
        mostrarFeedback("ok", "Tercero eliminado")
      }
    } else {
      mostrarFeedback("error", "No se pudo eliminar")
    }
  }

  function handleGuardado() {
    setModal(null)
    mostrarFeedback("ok", "Tercero guardado correctamente")
    router.refresh()
    // Recarga optimista desde la API
    fetch("/api/admin/cp/terceros?q=")
      .then(r => r.json())
      .then(d => setLista(d.terceros ?? []))
      .catch(() => {})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">

      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/admin/contabilidad" className="text-slate-400 hover:text-white transition">
              <ChevronLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-xl font-bold text-white">Terceros auxiliares</h1>
              <p className="text-slate-400 text-sm">
                {lista.filter(t => t.activo).length} activos · {lista.length} total
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal("nuevo")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-900/30"
          >
            <Plus className="w-4 h-4" /> Nuevo tercero
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por NIT, nombre o ciudad…"
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={soloActivos}
              onChange={e => setSoloActivos(e.target.checked)}
              className="rounded accent-blue-500"
            />
            Solo activos
          </label>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${
            feedback.tipo === "ok"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {feedback.tipo === "ok"
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />
            }
            {feedback.msg}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left">Tipo</th>
                <th className="px-5 py-3 text-left">Documento</th>
                <th className="px-5 py-3 text-left">Razón social</th>
                <th className="px-5 py-3 text-left">Ciudad</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    {busqueda ? "Sin resultados para la búsqueda" : "No hay terceros registrados"}
                  </td>
                </tr>
              )}
              {filtrados.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3">
                    <span className="text-xs bg-white/10 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      {t.tipoDocumento}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-300 text-xs">{t.documento}</td>
                  <td className="px-5 py-3 text-white font-medium">{t.razonSocial}</td>
                  <td className="px-5 py-3 text-slate-400">{t.ciudad ?? "—"}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{t.email ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.activo
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-slate-700 text-slate-400"
                    }`}>
                      {t.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setModal(t)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEliminar(t)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        title="Eliminar / Inactivar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600">
          Los terceros inactivados no aparecen en los selectores de comprobantes pero sus asientos existentes se conservan.
        </p>
      </div>

      {/* Modal */}
      {modal && (
        <TerceroModal
          inicial={modal === "nuevo" ? undefined : modal}
          onClose={() => setModal(null)}
          onGuardado={handleGuardado}
        />
      )}
    </div>
  )
}
