"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Image as ImageIcon,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Calendar,
  Link as LinkIcon,
  Loader2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { ConfirmDialog } from "@/components/admin/shared"

interface Slide {
  id: string
  titulo: string | null
  subtitulo: string | null
  imagenUrl: string
  imagenMovilUrl: string | null
  enlace: string | null
  textoBoton: string | null
  orden: number
  activo: boolean
  fechaInicio: string | null
  fechaFin: string | null
  createdAt: string
}

export function SliderClient() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    slide: Slide | null
  }>({ isOpen: false, slide: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)

  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    imagenUrl: "",
    imagenMovilUrl: "",
    enlace: "",
    textoBoton: "",
    activo: true,
    fechaInicio: "",
    fechaFin: "",
  })

  const fetchSlides = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/slider")
      if (response.ok) {
        const data = await response.json()
        setSlides(data)
      }
    } catch (error) {
      console.error("Error al cargar slides:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingSlide
        ? `/api/admin/slider/${editingSlide.id}`
        : "/api/admin/slider"

      const response = await fetch(url, {
        method: editingSlide ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          fechaInicio: formData.fechaInicio || null,
          fechaFin: formData.fechaFin || null,
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingSlide(null)
        resetForm()
        fetchSlides()
      } else {
        const error = await response.json()
        alert(error.error || "Error al guardar slide")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide)
    setFormData({
      titulo: slide.titulo || "",
      subtitulo: slide.subtitulo || "",
      imagenUrl: slide.imagenUrl,
      imagenMovilUrl: slide.imagenMovilUrl || "",
      enlace: slide.enlace || "",
      textoBoton: slide.textoBoton || "",
      activo: slide.activo,
      fechaInicio: slide.fechaInicio
        ? format(new Date(slide.fechaInicio), "yyyy-MM-dd")
        : "",
      fechaFin: slide.fechaFin
        ? format(new Date(slide.fechaFin), "yyyy-MM-dd")
        : "",
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog.slide) return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/slider/${deleteDialog.slide.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setDeleteDialog({ isOpen: false, slide: null })
        fetchSlides()
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar slide")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleActive = async (slide: Slide) => {
    try {
      const response = await fetch(`/api/admin/slider/${slide.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activo: !slide.activo }),
      })

      if (response.ok) {
        fetchSlides()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleMoveSlide = async (index: number, direction: "up" | "down") => {
    if (reordering) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= slides.length) return

    setReordering(true)

    // Swap orders
    const updatedSlides = [...slides]
    const [movedSlide] = updatedSlides.splice(index, 1)
    updatedSlides.splice(newIndex, 0, movedSlide)

    // Update order numbers
    const reorderedSlides = updatedSlides.map((slide, idx) => ({
      id: slide.id,
      orden: idx + 1,
    }))

    try {
      const response = await fetch("/api/admin/slider", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slides: reorderedSlides }),
      })

      if (response.ok) {
        fetchSlides()
      }
    } catch (error) {
      console.error("Error al reordenar:", error)
    } finally {
      setReordering(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: "",
      subtitulo: "",
      imagenUrl: "",
      imagenMovilUrl: "",
      enlace: "",
      textoBoton: "",
      activo: true,
      fechaInicio: "",
      fechaFin: "",
    })
  }

  const isSlideActive = (slide: Slide) => {
    if (!slide.activo) return false

    const now = new Date()
    if (slide.fechaInicio && new Date(slide.fechaInicio) > now) return false
    if (slide.fechaFin && new Date(slide.fechaFin) < now) return false

    return true
  }

  const activeCount = slides.filter(isSlideActive).length

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Slider / Banners</h1>
          <p className="text-gray-600 mt-1">
            Administra las imágenes del carrusel principal
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSlide(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Slide
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Slides</p>
          <p className="text-2xl font-bold text-gray-900">{slides.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Inactivos</p>
          <p className="text-2xl font-bold text-gray-400">
            {slides.length - activeCount}
          </p>
        </div>
      </div>

      {/* Lista de Slides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          </div>
        ) : slides.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No hay slides
            </h3>
            <p className="text-gray-500 mb-4">
              Crea tu primer slide para mostrar en el carrusel
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
            >
              <Plus className="h-4 w-4" />
              Crear Slide
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`p-4 flex items-center gap-4 ${
                  !isSlideActive(slide) ? "bg-gray-50" : ""
                }`}
              >
                {/* Orden y controles */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleMoveSlide(index, "up")}
                    disabled={index === 0 || reordering}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <button
                    onClick={() => handleMoveSlide(index, "down")}
                    disabled={index === slides.length - 1 || reordering}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Imagen */}
                <div className="shrink-0">
                  <img
                    src={slide.imagenUrl}
                    alt={slide.titulo || "Slide"}
                    className="h-20 w-36 object-cover rounded-lg border border-gray-200"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {slide.titulo || "Sin título"}
                    </h3>
                    {isSlideActive(slide) ? (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {slide.subtitulo && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {slide.subtitulo}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {slide.enlace && (
                      <span className="flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        {slide.textoBoton || "Ver más"}
                      </span>
                    )}
                    {(slide.fechaInicio || slide.fechaFin) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {slide.fechaInicio
                          ? format(new Date(slide.fechaInicio), "d MMM", {
                              locale: es,
                            })
                          : "..."}
                        {" - "}
                        {slide.fechaFin
                          ? format(new Date(slide.fechaFin), "d MMM yyyy", {
                              locale: es,
                            })
                          : "..."}
                      </span>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className={`p-2 rounded-lg transition-colors ${
                      slide.activo
                        ? "text-green-600 hover:bg-green-50"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    title={slide.activo ? "Desactivar" : "Activar"}
                  >
                    {slide.activo ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                  {slide.enlace && (
                    <a
                      href={slide.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver enlace"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(slide)}
                    className="p-2 text-gray-400 hover:text-[#003366] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteDialog({ isOpen: true, slide: slide })
                    }
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingSlide ? "Editar Slide" : "Nuevo Slide"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) =>
                        setFormData({ ...formData, titulo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={formData.subtitulo}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitulo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de imagen (Desktop) *
                  </label>
                  <input
                    type="url"
                    value={formData.imagenUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imagenUrl: e.target.value })
                    }
                    required
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño recomendado: 1920x600 px
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de imagen (Móvil)
                  </label>
                  <input
                    type="url"
                    value={formData.imagenMovilUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        imagenMovilUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño recomendado: 768x400 px
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enlace (opcional)
                    </label>
                    <input
                      type="url"
                      value={formData.enlace}
                      onChange={(e) =>
                        setFormData({ ...formData, enlace: e.target.value })
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texto del botón
                    </label>
                    <input
                      type="text"
                      value={formData.textoBoton}
                      onChange={(e) =>
                        setFormData({ ...formData, textoBoton: e.target.value })
                      }
                      placeholder="Ver más"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de inicio (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) =>
                        setFormData({ ...formData, fechaInicio: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de fin (opcional)
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFin}
                      onChange={(e) =>
                        setFormData({ ...formData, fechaFin: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData({ ...formData, activo: e.target.checked })
                    }
                    className="h-4 w-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                  />
                  <span className="text-sm text-gray-700">
                    Slide activo (visible en el sitio web)
                  </span>
                </label>

                {formData.imagenUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Vista previa:
                    </p>
                    <img
                      src={formData.imagenUrl}
                      alt="Vista previa"
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingSlide ? "Guardar cambios" : "Crear slide"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, slide: null })}
        onConfirm={handleDelete}
        title="Eliminar slide"
        message={`¿Estás seguro de que deseas eliminar este slide? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}
