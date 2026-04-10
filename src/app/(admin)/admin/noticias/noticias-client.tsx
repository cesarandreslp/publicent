"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Star,
  Newspaper,
  Search,
  Filter,
} from "lucide-react"
import { DataTable } from "@/components/admin/shared"
import { ConfirmDialog } from "@/components/admin/shared"

interface Noticia {
  id: string
  titulo: string
  slug: string
  extracto: string | null
  imagenDestacada: string | null
  estado: "BORRADOR" | "PUBLICADO" | "ARCHIVADO"
  destacada: boolean
  fechaPublicacion: string | null
  createdAt: string
  categoria: {
    id: string
    nombre: string
    color: string | null
  } | null
  creador: {
    id: string
    nombre: string
    apellido: string
  }
  _count: {
    etiquetas: number
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function NoticiasClient() {
  const router = useRouter()
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    noticia: Noticia | null
  }>({ isOpen: false, noticia: null })
  const [deleting, setDeleting] = useState(false)

  const fetchNoticias = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(estadoFilter && { estado: estadoFilter }),
      })

      const response = await fetch(`/api/admin/noticias?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNoticias(data.noticias)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error al cargar noticias:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNoticias()
  }, [pagination.page, searchTerm, estadoFilter])

  const handleDelete = async () => {
    if (!deleteDialog.noticia) return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/noticias/${deleteDialog.noticia.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setDeleteDialog({ isOpen: false, noticia: null })
        fetchNoticias()
      }
    } catch (error) {
      console.error("Error al eliminar noticia:", error)
    } finally {
      setDeleting(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const styles = {
      BORRADOR: "bg-yellow-100 text-yellow-800",
      PUBLICADO: "bg-green-100 text-green-800",
      ARCHIVADO: "bg-gray-100 text-gray-800",
    }
    const labels = {
      BORRADOR: "Borrador",
      PUBLICADO: "Publicado",
      ARCHIVADO: "Archivado",
    }
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[estado as keyof typeof styles]}`}
      >
        {labels[estado as keyof typeof labels]}
      </span>
    )
  }

  const columns: ColumnDef<Noticia>[] = [
    {
      accessorKey: "titulo",
      header: "Título",
      cell: ({ row }) => (
        <div className="flex items-start gap-3">
          {row.original.imagenDestacada ? (
            <img
              src={row.original.imagenDestacada}
              alt=""
              className="w-16 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
              <Newspaper className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 line-clamp-1">
                {row.original.titulo}
              </span>
              {row.original.destacada && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            {row.original.extracto && (
              <p className="text-sm text-gray-500 line-clamp-1">
                {row.original.extracto}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoría",
      cell: ({ row }) =>
        row.original.categoria ? (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{
              backgroundColor: row.original.categoria.color || "#e5e7eb",
              color: row.original.categoria.color ? "#fff" : "#374151",
            }}
          >
            {row.original.categoria.nombre}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Sin categoría</span>
        ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => getEstadoBadge(row.original.estado),
    },
    {
      accessorKey: "creador",
      header: "Autor",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.creador.nombre} {row.original.creador.apellido}
        </span>
      ),
    },
    {
      accessorKey: "fechaPublicacion",
      header: "Publicación",
      cell: ({ row }) =>
        row.original.fechaPublicacion ? (
          <span className="text-sm text-gray-600">
            {format(new Date(row.original.fechaPublicacion), "d MMM yyyy", {
              locale: es,
            })}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Sin programar</span>
        ),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/noticias/${row.original.slug}`}
            target="_blank"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/noticias/${row.original.id}/editar`}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() =>
              setDeleteDialog({ isOpen: true, noticia: row.original })
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

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Noticias</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las noticias y publicaciones del sitio
          </p>
        </div>
        <Link
          href="/admin/noticias/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Noticia
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar noticias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="ARCHIVADO">Archivado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={noticias} />
        )}
      </div>

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, noticia: null })}
        onConfirm={handleDelete}
        title="Eliminar noticia"
        message={`¿Estás seguro de que deseas eliminar la noticia "${deleteDialog.noticia?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}
