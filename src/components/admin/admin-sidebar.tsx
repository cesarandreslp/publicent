"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import type { TenantInfo } from "@/lib/tenant"
import { MODULO_IDS, type ModuloId } from "@/lib/modules"
import GdNotificacionesBadge from "@/components/admin/gd-notificaciones-badge"

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
  tenant: TenantInfo | null
}

const NAV_GROUPS: Array<{
  label: string | null
  items: Array<{
    title: string
    href: string
    exact?: boolean
    icon: React.ReactNode
    roles?: string[]
    /** Módulo requerido para mostrar este item */
    modulo?: ModuloId
    /** Indica que el item abre una URL externa (nueva pestaña) */
    externo?: boolean
    badge?: string
  }>
}> = [
  {
    label: null,
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        exact: true,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Contenido",
    items: [
      {
        title: "Noticias",
        href: "/admin/noticias",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        ),
      },
      {
        title: "Páginas y secciones",
        href: "/admin/paginas",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 6h16M4 10h16M4 14h16M4 18h7" />
          </svg>
        ),
      },
      {
        title: "Slider",
        href: "/admin/slider",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        title: "Documentos",
        href: "/admin/documentos",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Gestión",
    items: [
      {
        title: "PQRSD",
        href: "/admin/pqrs",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ),
      },
      {
        title: "Gestor Documental",
        href: "/admin/gd",
        badge: "AGN",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        ),
      },
      {
        title: "Transparencia",
        href: "/admin/transparencia",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
      {
        title: "Menú",
        href: "/admin/menu",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ),
      },
      {
        title: "Planeación y MIPG",
        href: "/admin/mipg",
        roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        title: "Bóveda Evidencias",
        href: "/admin/mipg/evidencias",
        roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        title: "Evaluar FURAG",
        href: "/admin/mipg/evaluacion",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  },

  {
    label: "Sistema",
    items: [
      {
        title: "Usuarios",
        href: "/admin/usuarios",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        title: "Estadísticas",
        href: "/admin/estadisticas",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        title: "Configuración",
        href: "/admin/configuracion",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        title: "Auditoría",
        href: "/admin/auditoria",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Módulos activos",
    items: [
      {
        title: "Ventanilla Única PQRS",
        href: "",           // se reemplaza dinámicamente con apiUrl del módulo
        externo: true,
        modulo: MODULO_IDS.VENTANILLA_UNICA,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        ),
      },
      {
        title: "Gestión Documental",
        href: "",
        externo: true,
        modulo: MODULO_IDS.GESTION_DOCUMENTAL,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ],
  },]

export default function AdminSidebar({ user, tenant }: AdminSidebarProps) {
  const pathname       = usePathname()
  const [open, setOpen] = useState(false)

  const primaryColor = tenant?.colorPrimario ?? "#1a56db"

  function modIsActive(modulo: ModuloId): boolean {
    if (!tenant) return false
    return tenant.modulosActivos[modulo]?.activo === true
  }

  function getModApiUrl(modulo: ModuloId): string {
    if (!tenant) return "#"
    const cfg = tenant.modulosActivos[modulo] as unknown as Record<string, unknown> | undefined
    return (cfg?.apiUrl as string) || "#"
  }

  function isActive(href: string, exact?: boolean): boolean {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Encabezado: info del tenant */}
      <div className="px-4 py-5 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3 group flex-1 min-w-0" onClick={() => setOpen(false)}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-base shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            {(tenant?.nombreCorto ?? "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {tenant?.nombreCorto ?? "Admin"}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {tenant?.tipoEntidad?.toLowerCase().replace("_", " ") ?? "entidad pública"}
            </p>
          </div>
        </Link>
        <GdNotificacionesBadge />
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_GROUPS.map((group, gi) => {
          const visibleItems = group.items.filter(item => {
            if (item.modulo && !modIsActive(item.modulo)) return false
            if (!("roles" in item) || !item.roles) return true
            return item.roles.includes(user.role ?? "")
          })
          if (visibleItems.length === 0) return null

          return (
            <div key={gi}>
              {group.label && (
                <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isActive(item.href, 'exact' in item ? (item as { href: string; exact?: boolean }).exact : undefined)

                  // Módulos externos: link a sistema externo
                  if (item.externo && item.modulo) {
                    const externalUrl = getModApiUrl(item.modulo)
                    return (
                      <a
                        key={item.title}
                        href={externalUrl !== "#" ? externalUrl : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150"
                      >
                        <span>{item.icon}</span>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <span className="text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-full leading-none">
                            {item.badge}
                          </span>
                        )}
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active
                          ? "text-white"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                      style={active ? { backgroundColor: primaryColor + "22" } : undefined}
                    >
                      {/* Indicador activo */}
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                          style={{ backgroundColor: primaryColor }}
                        />
                      )}
                      <span style={active ? { color: primaryColor } : undefined}>
                        {item.icon}
                      </span>
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Módulo de Configuración / Apariencia */}
      <div className="mb-6">
        <p className="px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Configuración
        </p>
        <nav className="space-y-1">
          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <Link
              href="/admin/ajustes/apariencia"
              className={`relative flex items-center gap-3 px-3 mx-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                pathname === "/admin/ajustes/apariencia"
                  ? "text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              style={pathname === "/admin/ajustes/apariencia" ? { backgroundColor: primaryColor + "22" } : undefined}
            >
              {pathname === "/admin/ajustes/apariencia" && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ backgroundColor: primaryColor }} />
              )}
              <span style={pathname === "/admin/ajustes/apariencia" ? { color: primaryColor } : undefined}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </span>
              Apariencia
            </Link>
          )}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Ver sitio público
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white uppercase">
              {(user.name ?? user.email ?? "U")[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user.name ?? user.email}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Botón mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-xl shadow-lg"
        aria-label="Abrir menú"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SidebarContent />
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-slate-900 border-r border-slate-800">
        <SidebarContent />
      </aside>
    </>
  )
}
