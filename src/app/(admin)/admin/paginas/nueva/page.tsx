"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const PLANTILLAS = ["GENERICA", "TRANSPARENCIA", "CONTACTO", "DIRECTORIO", "SERVICIOS", "NOTICIAS", "GALERIA"]

function toSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export default function NuevaPaginaPage() {
  const router = useRouter()
  const [titulo,       setTitulo]       = useState("")
  const [slug,         setSlug]         = useState("")
  const [descripcion,  setDescripcion]  = useState("")
  const [plantilla,    setPlantilla]    = useState("GENERICA")
  const [metaKeywords, setMetaKeywords] = useState("")
  const [slugManual,   setSlugManual]   = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  function handleTitulo(val: string) {
    setTitulo(val)
    if (!slugManual) setSlug(toSlug(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/paginas", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ titulo, slug, descripcion, plantilla, metaKeywords }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Error al crear"); return }
      router.push(`/admin/paginas/${data.id}`)
    } catch {
      setError("Error de red")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/paginas" className="hover:text-slate-700">Páginas</Link>
        <span>/</span>
        <span className="text-slate-800">Nueva página</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva página</h1>
        <p className="text-slate-400 text-sm mt-1">
          Crea una página y luego añade secciones para construir su contenido.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => handleTitulo(e.target.value)}
              placeholder="Ej: Quiénes somos"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              URL (slug) <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400 transition">
              <span className="px-3 text-slate-400 text-sm select-none">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
                placeholder="quienes-somos"
                required
                className="flex-1 bg-transparent py-2.5 pr-4 text-slate-800 font-mono text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Plantilla */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Plantilla</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLANTILLAS.map((p) => (
                <button
                  key={p} type="button"
                  onClick={() => setPlantilla(p)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition ${
                    plantilla === p
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Meta descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Meta descripción <span className="text-slate-400 font-normal">(SEO)</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción de la página para motores de búsqueda..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition resize-none"
            />
          </div>

          {/* Palabras clave */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Palabras clave <span className="text-slate-400 font-normal">(separadas por coma)</span>
            </label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="gestión, transparencia, gobierno"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
            />
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link href="/admin/paginas"
            className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200 hover:border-slate-300 transition">
            Cancelar
          </Link>
          <button
            type="submit" disabled={saving || !titulo || !slug}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 rounded-xl transition shadow-sm"
          >
            {saving ? "Creando…" : "Crear página"}
          </button>
        </div>
      </form>
    </div>
  )
}
