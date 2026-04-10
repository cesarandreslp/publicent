"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BlockEditor } from "./editor/block-editor"

interface SeccionData {
  id: string
  nombre: string
  tipo: string
  contenido: Record<string, unknown>
  configuracion: Record<string, unknown> | null
  visible: boolean
  orden: number
}

interface PaginaData {
  id: string
  titulo: string
  slug: string
  descripcion: string
  plantilla: string
  metaKeywords: string
  publicada: boolean
}

const TIPO_ICON: Record<string, string> = {
  TEXTO:            "📝",
  HTML:             "🖊️",
  GALERIA:          "🖼️",
  ACORDEON:         "📂",
  TABS:             "📑",
  TARJETAS:         "🃏",
  LISTA_DOCUMENTOS: "📋",
  FORMULARIO:       "📬",
  IFRAME:           "🔗",
  VIDEO:            "🎥",
  MAPA:             "🗺️",
  TIMELINE:         "⏱️",
}

const PLANTILLAS = ["GENERICA", "TRANSPARENCIA", "CONTACTO", "DIRECTORIO", "SERVICIOS", "NOTICIAS", "GALERIA"]

function SeccionCard({
  seccion,
  onToggle,
  onSave,
  isToggling,
}: {
  seccion: SeccionData
  onToggle: (id: string, visible: boolean) => void
  onSave: (id: string, contenido: Record<string, unknown>, nombre: string) => void
  isToggling: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [nombre,   setNombre]   = useState(seccion.nombre)
  const [contenidoJson, setContenidoJson] = useState(
    JSON.stringify(seccion.contenido, null, 2)
  )
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [saved,  setSaved]        = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const parsed = JSON.parse(contenidoJson)
      setJsonError(null)
      await onSave(seccion.id, parsed, nombre)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setJsonError("JSON inválido. Verifica la sintaxis.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`rounded-2xl border transition-all ${
      seccion.visible
        ? "border-slate-200 bg-white"
        : "border-slate-100 bg-slate-50 opacity-70"
    }`}>
      {/* Header de la sección */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <span className="text-slate-300 cursor-grab">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </span>

        <span className="text-xl shrink-0">{TIPO_ICON[seccion.tipo] ?? "📄"}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{seccion.nombre}</p>
          <p className="text-xs text-slate-400">{seccion.tipo}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Toggle visible */}
          <button
            onClick={() => onToggle(seccion.id, seccion.visible)}
            disabled={isToggling}
            title={seccion.visible ? "Ocultar" : "Mostrar"}
            className={`p-2 rounded-lg transition ${
              seccion.visible
                ? "text-emerald-500 hover:bg-emerald-50"
                : "text-slate-300 hover:bg-slate-100"
            }`}
          >
            {seccion.visible ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>

          {/* Expandir editor */}
          <button
            onClick={() => setExpanded((e) => !e)}
            title="Editar contenido"
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor expandible */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-3">
          {/* Nombre de la sección */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Nombre de la sección
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
            />
          </div>

          {/* Editor Condicional */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-500">
                {seccion.tipo === 'HTML' || seccion.tipo === 'TEXTO' ? 'Contenido del Bloque' : 'Contenido Estructurado (JSON)'}
              </label>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                {seccion.tipo}
              </span>
            </div>
            
            {(seccion.tipo === 'HTML' || seccion.tipo === 'TEXTO') ? (
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <BlockEditor 
                  content={(seccion.contenido.html || seccion.contenido.texto || '') as string} 
                  onChange={(html) => {
                    const newContent = { ...seccion.contenido, [seccion.tipo === 'HTML' ? 'html' : 'texto']: html }
                    setContenidoJson(JSON.stringify(newContent, null, 2))
                    setJsonError(null)
                  }}
                  placeholder="Escribe el contenido de esta sección..."
                />
              </div>
            ) : (
              <textarea
                value={contenidoJson}
                onChange={(e) => {
                  setContenidoJson(e.target.value)
                  setJsonError(null)
                }}
                rows={10}
                spellCheck={false}
                className="w-full px-4 py-3 bg-slate-900 text-green-400 font-mono text-sm border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-y"
              />
            )}
            
            {jsonError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                {jsonError}
              </p>
            )}
          </div>

          {/* Guardar */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setExpanded(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200 hover:border-slate-300 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 rounded-xl transition shadow-sm"
            >
              {saved ? "✅ Guardado" : saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PaginaEditForm({
  pagina,
  secciones: initialSecciones,
}: {
  pagina: PaginaData
  secciones: SeccionData[]
}) {
  const router = useRouter()
  const [secciones, setSecciones]  = useState(initialSecciones)
  const [toggling,  setToggling]   = useState<string | null>(null)
  const [, startTransition]        = useTransition()

  // Page meta form
  const [titulo,       setTitulo]       = useState(pagina.titulo)
  const [descripcion,  setDescripcion]  = useState(pagina.descripcion)
  const [slug,         setSlug]         = useState(pagina.slug)
  const [metaKeywords, setMetaKeywords] = useState(pagina.metaKeywords)
  const [plantilla,    setPlantilla]    = useState(pagina.plantilla)
  const [publicada,    setPublicada]    = useState(pagina.publicada)
  const [savingMeta,   setSavingMeta]   = useState(false)
  const [savedMeta,    setSavedMeta]    = useState(false)
  const [metaError,    setMetaError]    = useState<string | null>(null)

  async function toggleVisible(id: string, visible: boolean) {
    setToggling(id)
    setSecciones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !visible } : s))
    )
    try {
      await fetch(`/api/admin/secciones/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ visible: !visible }),
      })
      startTransition(() => router.refresh())
    } catch {
      setSecciones((prev) =>
        prev.map((s) => (s.id === id ? { ...s, visible } : s))
      )
    } finally {
      setToggling(null)
    }
  }

  async function saveSeccion(id: string, contenido: Record<string, unknown>, nombre: string) {
    await fetch(`/api/admin/secciones/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ contenido, nombre }),
    })
    setSecciones((prev) =>
      prev.map((s) => (s.id === id ? { ...s, contenido, nombre } : s))
    )
    startTransition(() => router.refresh())
  }

  async function saveMeta(e: React.FormEvent) {
    e.preventDefault()
    setSavingMeta(true)
    setMetaError(null)
    try {
      const res = await fetch(`/api/admin/paginas/${pagina.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ titulo, descripcion, slug, metaKeywords, plantilla, publicada }),
      })
      if (!res.ok) {
        const data = await res.json()
        setMetaError(data.error ?? "Error al guardar")
        return
      }
      setSavedMeta(true)
      setTimeout(() => setSavedMeta(false), 2000)
      startTransition(() => router.refresh())
    } catch {
      setMetaError("Error de red")
    } finally {
      setSavingMeta(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda: Configuraciones y Preview (3 columnas lg) */}
      <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
        <form onSubmit={saveMeta} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h2 className="font-semibold text-slate-900">Configuración</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Título</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Slug (URL)</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Meta descripción</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1">Plantilla</label>
              <select value={plantilla} onChange={(e) => setPlantilla(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition">
                {PLANTILLAS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <label className="text-sm font-medium text-slate-600">Publicada</label>
              <button type="button" onClick={() => setPublicada(!publicada)}
                className={`relative w-11 h-6 rounded-full transition-all ${publicada ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${publicada ? "translate-x-5" : ""}`} />
              </button>
            </div>

            {metaError && (
              <p className="text-xs text-red-500">{metaError}</p>
            )}

            <button type="submit" disabled={savingMeta}
              className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 rounded-xl transition shadow-sm">
              {savedMeta ? "✅ Guardado" : savingMeta ? "Guardando…" : "Guardar página"}
            </button>
          </div>
        </form>

        {/* Live Preview Button / Mini Window */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[300px]">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <span className="text-xl">👁️</span>
               <h2 className="font-semibold text-slate-900 text-sm">Vista Previa Real</h2>
             </div>
             <a href={`/${slug}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium">
               Ver final ▶
             </a>
          </div>
          <div className="flex-1 bg-gray-50 relative pointer-events-none opacity-50 overflow-hidden">
             {/* Renderizamos un iframe en modo "disable-interactions" para previsualizar la página */}
             <iframe 
               src={`/${slug}`}
               title="Preview" 
               className="w-[1024px] h-[800px] absolute top-0 left-0 origin-top-left"
               style={{ transform: 'scale(0.32)', pointerEvents: 'none' }}
             />
          </div>
        </div>
      </div>

      {/* Columna Derecha: Secciones y Build Builder (9 columnas lg) */}
      <div className="lg:col-span-9 space-y-4 order-1 lg:order-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Secciones de la página</h2>
          <Link
            href={`/admin/paginas/${pagina.id}/secciones/nueva`}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir sección
          </Link>
        </div>

        {secciones.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
            <p className="text-2xl mb-2">🧩</p>
            <p className="text-sm">Esta página no tiene secciones aún.</p>
            <Link href={`/admin/paginas/${pagina.id}/secciones/nueva`}
              className="mt-3 inline-flex items-center gap-1 text-blue-500 text-sm hover:underline">
              + Añadir primera sección
            </Link>
          </div>
        ) : (
          secciones.map((s) => (
            <SeccionCard
              key={s.id}
              seccion={s}
              onToggle={toggleVisible}
              onSave={saveSeccion}
              isToggling={toggling === s.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
