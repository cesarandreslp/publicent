"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  GripVertical,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Loader2,
  Menu as MenuIcon,
  Link as LinkIcon,
  Shield,
  FolderTree,
} from "lucide-react"
import { ConfirmDialog } from "@/components/admin/shared"

interface MenuItem {
  id: string
  nombre: string
  slug: string
  icono: string | null
  orden: number
  visible: boolean
  esObligatorio: boolean
  codigoITA: string | null
  padreId: string | null
  subMenus: MenuItem[]
  pagina: {
    id: string
    titulo: string
    slug: string
  } | null
}

export function MenuClient() {
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    menu: MenuItem | null
  }>({ isOpen: false, menu: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    icono: "",
    visible: true,
    esObligatorio: false,
    codigoITA: "",
  })

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/menu")
      if (response.ok) {
        const data = await response.json()
        setMenus(data)
        // Expandir todos por defecto
        const allIds = new Set<string>()
        data.forEach((menu: MenuItem) => {
          allIds.add(menu.id)
          menu.subMenus?.forEach((sub: MenuItem) => allIds.add(sub.id))
        })
        setExpandedMenus(allIds)
      }
    } catch (error) {
      console.error("Error al cargar menús:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingMenu
        ? `/api/admin/menu/${editingMenu.id}`
        : "/api/admin/menu"

      const response = await fetch(url, {
        method: editingMenu ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          padreId: parentId,
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setEditingMenu(null)
        setParentId(null)
        resetForm()
        fetchMenus()
      } else {
        const error = await response.json()
        alert(error.error || "Error al guardar menú")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu)
    setParentId(menu.padreId)
    setFormData({
      nombre: menu.nombre,
      slug: menu.slug,
      icono: menu.icono || "",
      visible: menu.visible,
      esObligatorio: menu.esObligatorio,
      codigoITA: menu.codigoITA || "",
    })
    setShowModal(true)
  }

  const handleAddSubmenu = (parent: MenuItem) => {
    setEditingMenu(null)
    setParentId(parent.id)
    resetForm()
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog.menu) return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/admin/menu/${deleteDialog.menu.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setDeleteDialog({ isOpen: false, menu: null })
        fetchMenus()
      } else {
        const error = await response.json()
        alert(error.error || "Error al eliminar menú")
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleVisible = async (menu: MenuItem) => {
    try {
      const response = await fetch(`/api/admin/menu/${menu.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visible: !menu.visible }),
      })

      if (response.ok) {
        fetchMenus()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleMoveMenu = async (
    menuList: MenuItem[],
    index: number,
    direction: "up" | "down",
    parentMenuId: string | null
  ) => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= menuList.length) return

    const updatedMenus = [...menuList]
    const [movedMenu] = updatedMenus.splice(index, 1)
    updatedMenus.splice(newIndex, 0, movedMenu)

    const reorderedMenus = updatedMenus.map((menu, idx) => ({
      id: menu.id,
      orden: idx + 1,
    }))

    try {
      await fetch("/api/admin/menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ menus: reorderedMenus }),
      })
      fetchMenus()
    } catch (error) {
      console.error("Error al reordenar:", error)
    }
  }

  const toggleExpand = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      slug: "",
      icono: "",
      visible: true,
      esObligatorio: false,
      codigoITA: "",
    })
  }

  const generateSlug = (nombre: string) => {
    return nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const renderMenuItem = (
    menu: MenuItem,
    index: number,
    menuList: MenuItem[],
    level: number = 0
  ) => {
    const isExpanded = expandedMenus.has(menu.id)
    const hasSubMenus = menu.subMenus && menu.subMenus.length > 0

    return (
      <div key={menu.id} className="border-b border-gray-100 last:border-b-0">
        <div
          className={`flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors ${
            !menu.visible ? "opacity-60" : ""
          }`}
          style={{ paddingLeft: `${1 + level * 1.5}rem` }}
        >
          {/* Expandir/Colapsar */}
          <button
            onClick={() => hasSubMenus && toggleExpand(menu.id)}
            className={`p-1 rounded ${
              hasSubMenus
                ? "hover:bg-gray-200 cursor-pointer"
                : "cursor-default text-transparent"
            }`}
          >
            {hasSubMenus ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {/* Orden */}
          <div className="flex flex-col items-center">
            <button
              onClick={() =>
                handleMoveMenu(menuList, index, "up", menu.padreId)
              }
              disabled={index === 0}
              className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <GripVertical className="h-4 w-4 text-gray-400" />
            <button
              onClick={() =>
                handleMoveMenu(menuList, index, "down", menu.padreId)
              }
              disabled={index === menuList.length - 1}
              className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{menu.nombre}</span>
              {menu.esObligatorio && (
                <span
                  className="px-1.5 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700 flex items-center gap-1"
                  title="Requerido por Resolución 1519/2020"
                >
                  <Shield className="h-3 w-3" />
                  Obligatorio
                </span>
              )}
              {menu.codigoITA && (
                <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                  ITA: {menu.codigoITA}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                /{menu.slug}
              </span>
              {hasSubMenus && (
                <span className="flex items-center gap-1">
                  <FolderTree className="h-3 w-3" />
                  {menu.subMenus.length} submenús
                </span>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleToggleVisible(menu)}
              className={`p-2 rounded-lg transition-colors ${
                menu.visible
                  ? "text-green-600 hover:bg-green-50"
                  : "text-gray-400 hover:bg-gray-100"
              }`}
              title={menu.visible ? "Ocultar" : "Mostrar"}
            >
              {menu.visible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleAddSubmenu(menu)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Agregar submenú"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEdit(menu)}
              className="p-2 text-gray-400 hover:text-[#003366] hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </button>
            {!menu.esObligatorio && (
              <button
                onClick={() => setDeleteDialog({ isOpen: true, menu })}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Submenús */}
        {hasSubMenus && isExpanded && (
          <div className="bg-gray-50/50">
            {menu.subMenus.map((subMenu, subIndex) =>
              renderMenuItem(subMenu, subIndex, menu.subMenus, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  const countTotalItems = (items: MenuItem[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + (item.subMenus ? countTotalItems(item.subMenus) : 0)
    }, 0)
  }

  const countObligatorios = (items: MenuItem[]): number => {
    return items.reduce((count, item) => {
      const subCount = item.subMenus ? countObligatorios(item.subMenus) : 0
      return count + (item.esObligatorio ? 1 : 0) + subCount
    }, 0)
  }

  const totalItems = countTotalItems(menus)
  const totalObligatorios = countObligatorios(menus)

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editor de Menú</h1>
          <p className="text-gray-600 mt-1">
            Estructura de navegación según Resolución 1519/2020
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMenu(null)
            setParentId(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo ítem
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total ítems</p>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Menús principales</p>
          <p className="text-2xl font-bold text-[#003366]">{menus.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <Shield className="h-8 w-8 text-amber-500" />
          <div>
            <p className="text-sm text-gray-500">Obligatorios (Res. 1519)</p>
            <p className="text-2xl font-bold text-amber-600">
              {totalObligatorios}
            </p>
          </div>
        </div>
      </div>

      {/* Aviso normativo */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">
            Cumplimiento Resolución 1519/2020
          </p>
          <p className="text-amber-700 mt-1">
            Los ítems marcados como obligatorios no pueden ser eliminados.
            Corresponden a las secciones mínimas requeridas por la normativa de
            transparencia activa para entidades públicas.
          </p>
        </div>
      </div>

      {/* Árbol de menús */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
          </div>
        ) : menus.length === 0 ? (
          <div className="text-center py-12">
            <MenuIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No hay ítems de menú
            </h3>
            <p className="text-gray-500 mb-4">
              Crea el primer ítem para construir la navegación
            </p>
            <button
              onClick={() => {
                setParentId(null)
                setShowModal(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244]"
            >
              <Plus className="h-4 w-4" />
              Crear ítem
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {menus.map((menu, index) =>
              renderMenuItem(menu, index, menus)
            )}
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
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingMenu
                  ? "Editar ítem de menú"
                  : parentId
                  ? "Nuevo submenú"
                  : "Nuevo ítem de menú"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => {
                      const nombre = e.target.value
                      setFormData({
                        ...formData,
                        nombre,
                        slug: editingMenu ? formData.slug : generateSlug(nombre),
                      })
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL) *
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                      /
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono (clase Lucide)
                  </label>
                  <input
                    type="text"
                    value={formData.icono}
                    onChange={(e) =>
                      setFormData({ ...formData, icono: e.target.value })
                    }
                    placeholder="Ej: home, building, users"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código ITA (Res. 1519)
                  </label>
                  <input
                    type="text"
                    value={formData.codigoITA}
                    onChange={(e) =>
                      setFormData({ ...formData, codigoITA: e.target.value })
                    }
                    placeholder="Ej: 1.1, 2.3, 4.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Código del criterio del Índice de Transparencia Activa (si
                    aplica)
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) =>
                        setFormData({ ...formData, visible: e.target.checked })
                      }
                      className="h-4 w-4 text-[#003366] border-gray-300 rounded focus:ring-[#003366]"
                    />
                    <span className="text-sm text-gray-700">Visible</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.esObligatorio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          esObligatorio: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">
                      Obligatorio (Res. 1519)
                    </span>
                  </label>
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
                    {editingMenu ? "Guardar cambios" : "Crear ítem"}
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
        onClose={() => setDeleteDialog({ isOpen: false, menu: null })}
        onConfirm={handleDelete}
        title="Eliminar ítem de menú"
        message={`¿Estás seguro de que deseas eliminar "${deleteDialog.menu?.nombre}"? ${
          deleteDialog.menu?.subMenus && deleteDialog.menu.subMenus.length > 0
            ? `Sus ${deleteDialog.menu.subMenus.length} submenús se moverán al nivel superior.`
            : ""
        }`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}
