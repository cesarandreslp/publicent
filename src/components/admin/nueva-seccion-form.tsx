"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Props {
  paginaId: string
  paginaTitulo: string
}

const TIPOS: { value: string; label: string; icon: string; desc: string }[] = [
  { value: "TEXTO",            label: "Texto",              icon: "📝", desc: "Párrafos de texto enriquecido" },
  { value: "HTML",             label: "HTML libre",         icon: "🖊️",  desc: "Código HTML personalizado" },
  { value: "GALERIA",          label: "Galería",            icon: "🖼️",  desc: "Grid de imágenes" },
  { value: "ACORDEON",         label: "Acordeón",           icon: "📂", desc: "Preguntas y respuestas expandibles" },
  { value: "TABS",             label: "Pestañas",           icon: "📑", desc: "Contenido en tabs" },
  { value: "TARJETAS",         label: "Tarjetas",           icon: "🃏", desc: "Grid de tarjetas con título e imagen" },
  { value: "LISTA_DOCUMENTOS", label: "Lista documentos",   icon: "📋", desc: "Lista de archivos descargables" },
  { value: "FORMULARIO",       label: "Formulario",         icon: "📬", desc: "Formulario de contacto" },
  { value: "IFRAME",           label: "Iframe / Embed",     icon: "🔗", desc: "Contenido embebido de URL externa" },
  { value: "VIDEO",            label: "Video",              icon: "🎥", desc: "Video de YouTube / Vimeo" },
  { value: "MAPA",             label: "Mapa",               icon: "🗺️",  desc: "Mapa de Google Maps embebido" },
  { value: "TIMELINE",         label: "Línea de tiempo",    icon: "⏱️",  desc: "Eventos ordenados cronológicamente" },
]

const DEFAULT_CONTENIDO: Record<string, unknown> = {
  TEXTO:            { html: "<p>Escribe tu contenido aquí...</p>" },
  HTML:             { html: "" },
  GALERIA:          { imagenes: [] },
  ACORDEON:         { items: [{ pregunta: "¿Título?", respuesta: "Respuesta..." }] },
  TABS:             { tabs: [{ titulo: "Pestaña 1", contenido: "Contenido" }] },
  TARJETAS:         { tarjetas: [{ titulo: "Tarjeta", descripcion: "", imagenUrl: "", enlace: "" }] },
  LISTA_DOCUMENTOS: { documentos: [] },
  FORMULARIO:       { campos: ["nombre", "email", "asunto", "mensaje"], destino: "" },
  IFRAME:           { url: "", titulo: "", altura: 400 },
  VIDEO:            { url: "", titulo: "" },
  MAPA:             { embed: "", titulo: "" },
  TIMELINE:        { eventos: [{ fecha: "", titulo: "", descripcion: "" }] },
}

export default function NuevaSeccionForm({ paginaId, paginaTitulo }: Props) {
  const router = useRouter()
  const [tipo,    setTipo]    = useState("")
  const [nombre,  setNombre]  = useState("")
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo || !nombre) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/paginas/${paginaId}/secciones`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          nombre,
          tipo,
          contenido: DEFAULT_CONTENIDO[tipo] ?? {},
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Error al crear"); return }
      router.push(`/admin/paginas/${paginaId}`)
    } catch {
      setError("Error de red")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de sección */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Tipo de sección <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.value} type="button"
              onClick={() => {
                setTipo(t.value)
                if (!nombre) setNombre(t.label)
              }}
              className={`flex items-start gap-2 p-3 rounded-xl border text-left transition ${
                tipo === t.value
                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <span className="text-xl mt-0.5 shrink-0">{t.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Nombre */}
      {tipo && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nombre de la sección <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Misión y visión"
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
          />
          <p className="mt-1 text-xs text-slate-400">
            Este nombre es de uso interno. Ayuda a identificar la sección en el editor.
          </p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link href={`/admin/paginas/${paginaId}`}
          className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200 hover:border-slate-300 transition">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={saving || !tipo || !nombre}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 rounded-xl transition shadow-sm"
        >
          {saving ? "Creando…" : "Añadir sección"}
        </button>
      </div>
    </form>
  )
}
