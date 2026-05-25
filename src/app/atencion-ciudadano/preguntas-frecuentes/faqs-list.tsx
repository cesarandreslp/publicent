'use client'

import { useState } from 'react'
import { ChevronDown, Search, HelpCircle } from 'lucide-react'

interface Faq {
  id: string
  pregunta: string
  respuesta: string
  categoria: string
  orden: number
}

const CATEGORIA_LABELS: Record<string, string> = {
  GENERAL: 'General',
  PQRSD: 'PQRSD',
  TRAMITES: 'Trámites',
  ACCESO_INFORMACION: 'Acceso a la información',
  ATENCION: 'Atención',
  OTROS: 'Otros',
}

export function FaqsList({ faqs }: { faqs: Faq[] }) {
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas')
  const [preguntaAbierta, setPreguntaAbierta] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const categoriasDisponibles = Array.from(new Set(faqs.map((f) => f.categoria))).sort()

  const filtradas = faqs.filter((p) => {
    const matchCategoria = categoriaActiva === 'todas' || p.categoria === categoriaActiva
    const q = busqueda.toLowerCase()
    const matchBusqueda =
      !q ||
      p.pregunta.toLowerCase().includes(q) ||
      p.respuesta.toLowerCase().includes(q)
    return matchCategoria && matchBusqueda
  })

  if (faqs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-12 text-center">
        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No hay preguntas publicadas
        </h3>
        <p className="text-gray-600">
          Aún no se han registrado preguntas frecuentes en el sistema.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en las preguntas frecuentes..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
          />
        </div>
      </div>

      {/* Filtro por categoría */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCategoriaActiva('todas')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            categoriaActiva === 'todas'
              ? 'bg-gov-blue text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todas las categorías
        </button>
        {categoriasDisponibles.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categoriaActiva === cat
                ? 'bg-gov-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {CATEGORIA_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-4">
        {filtradas.length > 0 ? (
          filtradas.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border overflow-hidden"
            >
              <button
                onClick={() =>
                  setPreguntaAbierta(preguntaAbierta === item.id ? null : item.id)
                }
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{item.pregunta}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                    preguntaAbierta === item.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {preguntaAbierta === item.id && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.respuesta}
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                    {CATEGORIA_LABELS[item.categoria] ?? item.categoria}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600">
              No hay preguntas que coincidan con su búsqueda. Intente con otros términos o{' '}
              <button
                onClick={() => {
                  setBusqueda('')
                  setCategoriaActiva('todas')
                }}
                className="text-gov-blue hover:underline"
              >
                ver todas las preguntas
              </button>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
