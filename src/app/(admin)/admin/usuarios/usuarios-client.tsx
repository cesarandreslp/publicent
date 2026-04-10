"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ColumnDef } from "@tanstack/react-table"
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
} from "lucide-react"
import { DataTable, ConfirmDialog } from "@/components/admin/shared"

interface Usuario {
  id: string
  email: string
  nombre: string
  apellido: string
  cargo: string | null
  telefono: string | null
  avatar: string | null
  activo: boolean
  emailVerificado: string | null
  rol: {
    id: string
    nombre: string
  }
  createdAt: string
}

interface Rol {
  id: string
  nombre: string
  _count: {
    usuarios: number
  }
}

export function UsuariosClient() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [rolFilter, setRolFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    usuario: Usuario | null
  }>({ isOpen: false, usuario: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    cargo: "",
    telefono: "",
    rolId: "",
  })

  const fetchUsuarios = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(rolFilter && { rolId: rolFilter }),
      })

      const response = await fetch(`/api/admin/usuarios?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsuarios(data)
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Error al cargar roles:", error)
    }
  }

  useEffect(() => {
    fetchUsuarios()
    fetchRoles()
  }, [searchTerm, rolFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingUser
        ? `/api/admin/usuarios/${editingUser.id}`
        : "/api/admin/usuarios"

      const response = await fetch(url, {
        method: editingUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          password: formData.password || undefined,
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingUser(null)
        resetForm()
        fetchUsuarios()
      } else {
        const error = await response.json()
        alert(error.error || "Error al guardar usuario")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar usuario")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario)
    setFormData({
      email: usuario.email,
      password: "",
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      cargo: usuario.cargo || "",
      telefono: usuario.telefono || "",
      rolId: usuario.rol.id,
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog.usuario) return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/usuarios/${deleteDialog.usuario.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setDeleteDialog({ isOpen: false, usuario: null })
        fetchUsuarios()
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar usuario")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      cargo: "",
      telefono: "",
      rolId: "",
    })
  }

  const getRolBadge = (rol: string) => {
    const styles: Record<string, string> = {
      SUPER_ADMIN: "bg-purple-100 text-purple-800",
      ADMIN: "bg-blue-100 text-blue-800",
      EDITOR: "bg-green-100 text-green-800",
      VIEWER: "bg-gray-100 text-gray-800",
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[rol] || "bg-gray-100 text-gray-800"}`}>
        {rol.replace("_", " ")}
      </span>
    )
  }

  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: "nombre",
      header: "Usuario",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#003366] rounded-full flex items-center justify-center text-white font-medium">
            {row.original.nombre.charAt(0)}
            {row.original.apellido.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {row.original.nombre} {row.original.apellido}
            </p>
            <p className="text-sm text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "cargo",
      header: "Cargo",
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.cargo || "Sin especificar"}
        </span>
      ),
    },
    {
      accessorKey: "rol",
      header: "Rol",
      cell: ({ row }) => getRolBadge(row.original.rol.nombre),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.activo ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 text-sm">Activo</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600 text-sm">Inactivo</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Registro",
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
          <button
            onClick={() => handleEdit(row.original)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              setDeleteDialog({ isOpen: true, usuario: row.original })
            }
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Desactivar"
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
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <select
            value={rolFilter}
            onChange={(e) => setRolFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre} ({rol._count.usuarios})
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
          <DataTable columns={columns} data={usuarios} />
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
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
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
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) =>
                        setFormData({ ...formData, apellido: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editingUser ? "(dejar vacío para mantener)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required={!editingUser}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) =>
                      setFormData({ ...formData, cargo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                  </label>
                  <select
                    value={formData.rolId}
                    onChange={(e) =>
                      setFormData({ ...formData, rolId: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((rol) => (
                      <option key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                </div>

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
                    {editingUser ? "Guardar cambios" : "Crear usuario"}
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
        onClose={() => setDeleteDialog({ isOpen: false, usuario: null })}
        onConfirm={handleDelete}
        title="Desactivar usuario"
        message={`¿Estás seguro de que deseas desactivar al usuario "${deleteDialog.usuario?.nombre} ${deleteDialog.usuario?.apellido}"? El usuario no podrá acceder al sistema.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        variant="warning"
        isLoading={deleting}
      />
    </div>
  )
}
