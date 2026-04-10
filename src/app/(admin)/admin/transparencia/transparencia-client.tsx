"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Eye,
  BarChart3,
} from "lucide-react"

interface Subcategoria {
  id: string
  codigo: string
  nombre: string
  slug: string
  orden: number
  _count: {
    items: number
  }
}

interface Categoria {
  id: string
  numero: number
  nombre: string
  slug: string
  descripcion: string | null
  icono: string | null
  esObligatoria: boolean
  codigoITA: string | null
  subcategorias: Subcategoria[]
  estadisticas: {
    totalItems: number
    itemsCumplidos: number
    porcentajeCumplimiento: number
  }
}

export function TransparenciaClient() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategoria, setExpandedCategoria] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch("/api/admin/transparencia/categorias")
        if (response.ok) {
          const data = await response.json()
          setCategorias(data)
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCategorias()
  }, [])

  // Calcular estadísticas generales
  const estadisticasGenerales = categorias.reduce(
    (acc, cat) => ({
      totalItems: acc.totalItems + cat.estadisticas.totalItems,
      itemsCumplidos: acc.itemsCumplidos + cat.estadisticas.itemsCumplidos,
    }),
    { totalItems: 0, itemsCumplidos: 0 }
  )

  const porcentajeGeneral =
    estadisticasGenerales.totalItems > 0
      ? Math.round(
          (estadisticasGenerales.itemsCumplidos /
            estadisticasGenerales.totalItems) *
            100
        )
      : 0

  const getProgressColor = (porcentaje: number) => {
    if (porcentaje >= 80) return "bg-green-500"
    if (porcentaje >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transparencia</h1>
          <p className="text-gray-600 mt-1">
            Gestión de contenidos según Ley 1712/2014 y Resolución 1519/2020
          </p>
        </div>
        <Link
          href="/transparencia"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          <Eye className="h-4 w-4" />
          Ver página pública
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Dashboard de cumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cumplimiento General</p>
              <p className="text-3xl font-bold text-gray-900">{porcentajeGeneral}%</p>
            </div>
            <div className={`p-3 rounded-full ${getProgressColor(porcentajeGeneral)} bg-opacity-10`}>
              <BarChart3 className={`h-6 w-6 ${getProgressColor(porcentajeGeneral).replace('bg-', 'text-')}`} />
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(porcentajeGeneral)} transition-all`}
              style={{ width: `${porcentajeGeneral}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Categorías</p>
              <p className="text-3xl font-bold text-gray-900">{categorias.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Según Res. 1519/2020
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Items Cumplidos</p>
              <p className="text-3xl font-bold text-green-600">
                {estadisticasGenerales.itemsCumplidos}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            de {estadisticasGenerales.totalItems} requeridos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Items Pendientes</p>
              <p className="text-3xl font-bold text-red-600">
                {estadisticasGenerales.totalItems - estadisticasGenerales.itemsCumplidos}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Requieren atención
          </p>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Categorías de Información (Res. 1519/2020)
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              No hay categorías de transparencia configuradas
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Ejecute el seed para cargar las categorías según la Resolución 1519
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categorias.map((categoria) => (
              <div key={categoria.id}>
                {/* Categoría */}
                <button
                  onClick={() =>
                    setExpandedCategoria(
                      expandedCategoria === categoria.id ? null : categoria.id
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold">
                      {categoria.numero}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">
                        {categoria.nombre}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {categoria.subcategorias.length} subcategorías •{" "}
                        {categoria.estadisticas.totalItems} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Barra de progreso */}
                    <div className="hidden sm:flex items-center gap-2 w-32">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(categoria.estadisticas.porcentajeCumplimiento)}`}
                          style={{
                            width: `${categoria.estadisticas.porcentajeCumplimiento}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {categoria.estadisticas.porcentajeCumplimiento}%
                      </span>
                    </div>

                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedCategoria === categoria.id ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Subcategorías expandidas */}
                {expandedCategoria === categoria.id && (
                  <div className="bg-gray-50 px-6 py-4 space-y-2">
                    {categoria.subcategorias.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/admin/transparencia/${categoria.slug}/${sub.slug}`}
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-gray-500">
                            {sub.codigo}
                          </span>
                          <span className="text-gray-900">{sub.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {sub._count.items} items
                          </span>
                          <Edit className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información normativa */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">
              Marco Normativo de Transparencia
            </h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• <strong>Ley 1712 de 2014:</strong> Ley de Transparencia y del Derecho de Acceso a la Información Pública</li>
              <li>• <strong>Decreto 1081 de 2015:</strong> Decreto Único Reglamentario del Sector Presidencia</li>
              <li>• <strong>Resolución 1519 de 2020:</strong> Lineamientos de publicación de información en sitios web</li>
              <li>• <strong>Anexos 1-4:</strong> Categorías de información obligatoria para entidades territoriales</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
