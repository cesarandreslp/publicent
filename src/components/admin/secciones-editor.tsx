"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface SeccionInfo {
  id: string
  nombre: string
  tipo: string
  visible: boolean
  orden: number
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

export default function SeccionesEditor({
  paginaId,
  secciones: initialSecciones,
}: {
  paginaId: string
  secciones: SeccionInfo[]
}) {
  const router = useRouter()
  const [secciones, setSecciones]   = useState(initialSecciones)
  const [pending, startTransition]  = useTransition()
  const [toggling, setToggling]     = useState<string | null>(null)

  async function toggleVisible(seccionId: string, visible: boolean) {
    setToggling(seccionId)
    // Optimistic update
    setSecciones((prev) =>
      prev.map((s) => (s.id === seccionId ? { ...s, visible: !visible } : s))
    )

    try {
      await fetch(`/api/admin/secciones/${seccionId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ visible: !visible }),
      })
      startTransition(() => router.refresh())
    } catch {
      // Revert on error
      setSecciones((prev) =>
        prev.map((s) => (s.id === seccionId ? { ...s, visible } : s))
      )
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="divide-y divide-slate-50">
      {secciones.map((seccion) => (
        <div
          key={seccion.id}
          className={`flex items-center justify-between px-6 py-3 group transition ${
            !seccion.visible ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Drag handle (visual only) */}
            <span className="text-slate-300 cursor-grab hidden sm:block">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8h16M4 16h16" />
              </svg>
            </span>
            <span className="text-lg">{TIPO_ICON[seccion.tipo] ?? "📄"}</span>
            <div className="min-w-0">
              <p className={`text-sm font-medium truncate ${seccion.visible ? "text-slate-800" : "text-slate-400"}`}>
                {seccion.nombre}
              </p>
              <p className="text-xs text-slate-400">{seccion.tipo}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 ml-4 shrink-0">
            {/* Toggle visible */}
            <button
              onClick={() => toggleVisible(seccion.id, seccion.visible)}
              disabled={toggling === seccion.id || pending}
              title={seccion.visible ? "Ocultar sección" : "Mostrar sección"}
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

            {/* Edit */}
            <Link
              href={`/admin/paginas/${paginaId}/secciones/${seccion.id}`}
              title="Editar sección"
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
          </div>
        </div>
      ))}

      {/* Añadir sección */}
      <div className="px-6 py-3">
        <Link
          href={`/admin/paginas/${paginaId}`}
          className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir sección
        </Link>
      </div>
    </div>
  )
}
