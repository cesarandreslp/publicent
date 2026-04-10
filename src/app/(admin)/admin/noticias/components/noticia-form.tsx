"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Eye,
  Calendar,
  Star,
  Image as ImageIcon,
  Video,
  Loader2,
} from "lucide-react"
import { RichEditor } from "@/components/admin/shared"

interface Categoria {
  id: string
  nombre: string
  slug: string
  color: string | null
}

interface NoticiaData {
  id?: string
  titulo: string
  extracto: string
  contenido: string
  imagenDestacada: string
  galeria: string[]
  videoUrl: string
  estado: "BORRADOR" | "PUBLICADO" | "ARCHIVADO"
  destacada: boolean
  fechaPublicacion: string
  categoriaId: string
  metaTitle: string
  metaDescription: string
  etiquetas: string[]
}

interface NoticiaFormProps {
  noticia?: NoticiaData
  isEditing?: boolean
}

export function NoticiaForm({ noticia, isEditing = false }: NoticiaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [activeTab, setActiveTab] = useState<"contenido" | "media" | "seo">(
    "contenido"
  )

  const [formData, setFormData] = useState<NoticiaData>({
    titulo: noticia?.titulo || "",
    extracto: noticia?.extracto || "",
    contenido: noticia?.contenido || "",
    imagenDestacada: noticia?.imagenDestacada || "",
    galeria: noticia?.galeria || [],
    videoUrl: noticia?.videoUrl || "",
    estado: noticia?.estado || "BORRADOR",
    destacada: noticia?.destacada || false,
    fechaPublicacion: noticia?.fechaPublicacion || "",
    categoriaId: noticia?.categoriaId || "",
    metaTitle: noticia?.metaTitle || "",
    metaDescription: noticia?.metaDescription || "",
    etiquetas: noticia?.etiquetas || [],
  })

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await fetch("/api/admin/noticias/categorias")
        if (response.ok) {
          const data = await response.json()
          setCategorias(data)
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error)
      }
    }
    fetchCategorias()
  }, [])

  const handleSubmit = async (estado?: "BORRADOR" | "PUBLICADO") => {
    setLoading(true)

    try {
      const dataToSend = {
        ...formData,
        estado: estado || formData.estado,
        fechaPublicacion:
          estado === "PUBLICADO" && !formData.fechaPublicacion
            ? new Date().toISOString()
            : formData.fechaPublicacion || null,
      }

      const url = isEditing
        ? `/api/admin/noticias/${noticia?.id}`
        : "/api/admin/noticias"

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        router.push("/admin/noticias")
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Error al guardar la noticia")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar la noticia")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "contenido", label: "Contenido" },
    { id: "media", label: "Multimedia" },
    { id: "seo", label: "SEO" },
  ]

  return (
    <div className="space-y-6">
      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Link
          href="/admin/noticias"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit("BORRADOR")}
            disabled={loading || !formData.titulo || !formData.contenido}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("PUBLICADO")}
            disabled={loading || !formData.titulo || !formData.contenido}
            className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Publicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
              placeholder="Escribe el título de la noticia"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? "border-[#003366] text-[#003366]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "contenido" && (
                <div className="space-y-6">
                  {/* Extracto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracto
                    </label>
                    <textarea
                      value={formData.extracto}
                      onChange={(e) =>
                        setFormData({ ...formData, extracto: e.target.value })
                      }
                      placeholder="Breve descripción de la noticia (aparece en listados)"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.extracto.length}/160 caracteres recomendados
                    </p>
                  </div>

                  {/* Editor de contenido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido *
                    </label>
                    <RichEditor
                      content={formData.contenido}
                      onChange={(content: string) =>
                        setFormData({ ...formData, contenido: content })
                      }
                      placeholder="Escribe el contenido de la noticia..."
                    />
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-6">
                  {/* Imagen destacada */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="inline h-4 w-4 mr-1" />
                      Imagen destacada
                    </label>
                    <input
                      type="url"
                      value={formData.imagenDestacada}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          imagenDestacada: e.target.value,
                        })
                      }
                      placeholder="URL de la imagen destacada"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                    {formData.imagenDestacada && (
                      <img
                        src={formData.imagenDestacada}
                        alt="Vista previa"
                        className="mt-4 max-h-48 rounded-lg object-cover"
                      />
                    )}
                  </div>

                  {/* Video */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Video className="inline h-4 w-4 mr-1" />
                      URL de video (YouTube/Vimeo)
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, videoUrl: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-6">
                  {/* Meta título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta título
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, metaTitle: e.target.value })
                      }
                      placeholder={formData.titulo || "Título SEO"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.metaTitle.length}/60 caracteres recomendados
                    </p>
                  </div>

                  {/* Meta descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta descripción
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metaDescription: e.target.value,
                        })
                      }
                      placeholder={formData.extracto || "Descripción para buscadores"}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.metaDescription.length}/160 caracteres
                      recomendados
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estado y publicación */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Publicación</h3>

            <div className="space-y-4">
              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as NoticiaData["estado"],
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                >
                  <option value="BORRADOR">Borrador</option>
                  <option value="PUBLICADO">Publicado</option>
                  <option value="ARCHIVADO">Archivado</option>
                </select>
              </div>

              {/* Fecha de publicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha de publicación
                </label>
                <input
                  type="datetime-local"
                  value={formData.fechaPublicacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fechaPublicacion: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>

              {/* Destacada */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.destacada}
                  onChange={(e) =>
                    setFormData({ ...formData, destacada: e.target.checked })
                  }
                  className="h-4 w-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                />
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Marcar como destacada
                </span>
              </label>
            </div>
          </div>

          {/* Categoría */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Categoría</h3>

            <select
              value={formData.categoriaId}
              onChange={(e) =>
                setFormData({ ...formData, categoriaId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Sin categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
