"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  FileText,
  Download,
  Edit,
  Trash2,
  Search,
  Filter,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  Loader2,
  Eye,
  EyeOff,
  HardDrive,
} from "lucide-react"
import { DataTable, ConfirmDialog } from "@/components/admin/shared"

interface Documento {
  id: string
  nombre: string
  descripcion: string | null
  archivoUrl: string
  tipoArchivo: string
  tamanio: number | null
  categoria: string
  carpeta: string | null
  publico: boolean
  createdAt: string
  subidoPor: {
    id: string
    nombre: string
    apellido: string
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Estadistica {
  categoria: string
  _count: { id: number }
}

const CATEGORIAS = [
  { value: "NORMATIVIDAD", label: "Normatividad", icon: FileText },
  { value: "PLANEACION", label: "Planeación", icon: FolderOpen },
  { value: "PRESUPUESTO", label: "Presupuesto", icon: FileSpreadsheet },
  { value: "CONTRATACION", label: "Contratación", icon: File },
  { value: "INFORMES", label: "Informes", icon: FileText },
  { value: "RESOLUCIONES", label: "Resoluciones", icon: FileText },
  { value: "ACUERDOS", label: "Acuerdos", icon: FileText },
  { value: "CIRCULARES", label: "Circulares", icon: FileText },
  { value: "MANUALES", label: "Manuales", icon: FileText },
  { value: "FORMATOS", label: "Formatos", icon: FileText },
  { value: "OTRO", label: "Otro", icon: File },
]

export function DocumentosClient() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadistica[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Documento | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    documento: Documento | null
  }>({ isOpen: false, documento: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    archivoUrl: "",
    tipoArchivo: "",
    tamanio: 0,
    categoria: "",
    carpeta: "",
    publico: true,
  })

  const fetchDocumentos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoriaFilter && { categoria: categoriaFilter }),
      })

      const response = await fetch(`/api/admin/documentos?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDocumentos(data.documentos)
        setEstadisticas(data.estadisticas)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error al cargar documentos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocumentos()
  }, [pagination.page, searchTerm, categoriaFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingDoc
        ? `/api/admin/documentos/${editingDoc.id}`
        : "/api/admin/documentos"

      const response = await fetch(url, {
        method: editingDoc ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingDoc(null)
        resetForm()
        fetchDocumentos()
      } else {
        const error = await response.json()
        alert(error.error || "Error al guardar documento")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar documento")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (doc: Documento) => {
    setEditingDoc(doc)
    setFormData({
      nombre: doc.nombre,
      descripcion: doc.descripcion || "",
      archivoUrl: doc.archivoUrl,
      tipoArchivo: doc.tipoArchivo,
      tamanio: doc.tamanio || 0,
      categoria: doc.categoria,
      carpeta: doc.carpeta || "",
      publico: doc.publico,
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog.documento) return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/documentos/${deleteDialog.documento.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setDeleteDialog({ isOpen: false, documento: null })
        fetchDocumentos()
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar documento")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      archivoUrl: "",
      tipoArchivo: "",
      tamanio: 0,
      categoria: "",
      carpeta: "",
      publico: true,
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (tipo: string) => {
    if (tipo.includes("image")) return <FileImage className="h-5 w-5 text-blue-500" />
    if (tipo.includes("spreadsheet") || tipo.includes("excel"))
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />
    if (tipo.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  const getCategoriaLabel = (cat: string) => {
    return CATEGORIAS.find((c) => c.value === cat)?.label || cat
  }

  const columns: ColumnDef<Documento>[] = [
    {
      accessorKey: "nombre",
      header: "Documento",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {getFileIcon(row.original.tipoArchivo)}
          <div>
            <p className="font-medium text-gray-900 line-clamp-1">
              {row.original.nombre}
            </p>
            {row.original.descripcion && (
              <p className="text-sm text-gray-500 line-clamp-1">
                {row.original.descripcion}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoría",
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          {getCategoriaLabel(row.original.categoria)}
        </span>
      ),
    },
    {
      accessorKey: "tamanio",
      header: "Tamaño",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatFileSize(row.original.tamanio)}
        </span>
      ),
    },
    {
      accessorKey: "publico",
      header: "Visibilidad",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.publico ? (
            <>
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Público</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Privado</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {format(new Date(row.original.createdAt), "d MMM yyyy", { locale: es })}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <a
            href={row.original.archivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Descargar"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setDeleteDialog({ isOpen: true, documento: row.original })
            }
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  // Calcular total de almacenamiento
  const totalStorage = documentos.reduce((acc, doc) => acc + (doc.tamanio || 0), 0)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600 mt-1">
            Gestión documental según Resolución 1519/2020
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDoc(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Documento
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {CATEGORIAS.slice(0, 5).map((cat) => {
          const count =
            estadisticas.find((e) => e.categoria === cat.value)?._count.id || 0
          return (
            <button
              key={cat.value}
              onClick={() =>
                setCategoriaFilter(
                  categoriaFilter === cat.value ? "" : cat.value
                )
              }
              className={`p-4 rounded-lg border transition-colors ${
                categoriaFilter === cat.value
                  ? "border-[#003366] bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <cat.icon className="h-5 w-5 text-gray-400 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-xs text-gray-500">{cat.label}</p>
            </button>
          )
        })}
        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <HardDrive className="h-5 w-5 text-gray-400 mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {formatFileSize(totalStorage)}
          </p>
          <p className="text-xs text-gray-500">Almacenamiento</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <select
            value={categoriaFilter}
            onChange={(e) => setCategoriaFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={documentos} />
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
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingDoc ? "Editar Documento" : "Nuevo Documento"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del documento *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL del archivo *
                  </label>
                  <input
                    type="url"
                    value={formData.archivoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, archivoUrl: e.target.value })
                    }
                    required
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de archivo *
                    </label>
                    <select
                      value={formData.tipoArchivo}
                      onChange={(e) =>
                        setFormData({ ...formData, tipoArchivo: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    >
                      <option value="">Seleccionar</option>
                      <option value="application/pdf">PDF</option>
                      <option value="application/msword">Word (DOC)</option>
                      <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">
                        Word (DOCX)
                      </option>
                      <option value="application/vnd.ms-excel">Excel (XLS)</option>
                      <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
                        Excel (XLSX)
                      </option>
                      <option value="image/jpeg">Imagen (JPG)</option>
                      <option value="image/png">Imagen (PNG)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) =>
                        setFormData({ ...formData, categoria: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    >
                      <option value="">Seleccionar</option>
                      {CATEGORIAS.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carpeta (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.carpeta}
                    onChange={(e) =>
                      setFormData({ ...formData, carpeta: e.target.value })
                    }
                    placeholder="Ej: 2026/informes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.publico}
                    onChange={(e) =>
                      setFormData({ ...formData, publico: e.target.checked })
                    }
                    className="h-4 w-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                  />
                  <span className="text-sm text-gray-700">
                    Documento público (visible en el sitio web)
                  </span>
                </label>

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
                    {editingDoc ? "Guardar cambios" : "Crear documento"}
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
        onClose={() => setDeleteDialog({ isOpen: false, documento: null })}
        onConfirm={handleDelete}
        title="Eliminar documento"
        message={`¿Estás seguro de que deseas eliminar el documento "${deleteDialog.documento?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}
