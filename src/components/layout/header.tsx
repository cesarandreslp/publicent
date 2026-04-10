"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { Menu, X, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ─── Menú principal basado en Resolución 1519 de 2020 ──────────────────────────
// Menús obligatorios: Transparencia, Atención al Ciudadano, Participa
const menuItems = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "La Entidad",
    href: "/entidad",
    children: [
      { label: "Misión y Visión", href: "/entidad/mision-vision" },
      { label: "Funciones y Deberes", href: "/entidad/funciones" },
      { label: "Organigrama", href: "/entidad/organigrama" },
      { label: "Directorio Institucional", href: "/entidad/directorio" },
      { label: "Personero Municipal", href: "/entidad/personero" },
    ],
  },
  {
    label: "Transparencia",
    href: "/transparencia",
    obligatorio: true,
    children: [
      { label: "1. Información de la Entidad", href: "/transparencia/informacion-entidad" },
      { label: "2. Normativa", href: "/transparencia/normativa" },
      { label: "3. Contratación", href: "/transparencia/contratacion" },
      { label: "4. Planeación, Presupuesto e Informes", href: "/transparencia/planeacion" },
      { label: "5. Trámites", href: "/transparencia/tramites" },
      { label: "6. Datos Abiertos", href: "/transparencia/datos-abiertos" },
      { label: "7. Información Específica", href: "/transparencia/informacion-especifica" },
      { label: "8. Obligación de Reporte", href: "/transparencia/obligacion-reporte" },
    ],
  },
  {
    label: "Atención al Ciudadano",
    href: "/atencion-ciudadano",
    obligatorio: true,
    children: [
      { label: "PQRSD", href: "/atencion-ciudadano/pqrsd" },
      { label: "Consultar PQRSD", href: "/atencion-ciudadano/consultar-pqrsd" },
      { label: "Mecanismos de Contacto", href: "/atencion-ciudadano/contacto" },
      { label: "Horarios de Atención", href: "/atencion-ciudadano/horarios" },
      { label: "Sede Principal", href: "/atencion-ciudadano/sede" },
    ],
  },
  {
    // 3er menú obligatorio según Resolución 1519 de 2020
    label: "Participa",
    href: "/participa",
    obligatorio: true,
    children: [
      { label: "Participación para el Diagnóstico", href: "/participa/diagnostico" },
      { label: "Planeación y Presupuesto Participativo", href: "/participa/planeacion-participativa" },
      { label: "Consulta Ciudadana", href: "/participa/consulta-ciudadana" },
      { label: "Rendición de Cuentas", href: "/participa/rendicion-cuentas" },
      { label: "Control Social", href: "/participa/control-social" },
      { label: "Colaboración e Innovación Abierta", href: "/participa/colaboracion" },
    ],
  },
  {
    label: "Servicios",
    href: "/servicios",
    children: [
      { label: "Asesoría Jurídica", href: "/servicios/asesoria-juridica" },
      { label: "Defensa del Ciudadano", href: "/servicios/defensa-ciudadano" },
      { label: "Vigilancia Administrativa", href: "/servicios/vigilancia" },
      { label: "Promoción de Derechos Humanos", href: "/servicios/derechos-humanos" },
    ],
  },
  {
    label: "Noticias",
    href: "/noticias",
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Cerrar dropdown al presionar Escape (nivel global)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveDropdown(null)
        setSearchOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Barra superior con información de contacto */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/>
                </svg>
                (602) 2017004
              </span>
              <span className="hidden md:flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                contacto@personeriabuga.gov.co
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/mapa-sitio" className="hover:text-gov-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue rounded">Mapa del Sitio</Link>
              <span className="text-gray-300">|</span>
              <Link href="/politicas" className="hover:text-gov-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue rounded">Políticas</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Logo y navegación principal */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue rounded-md">
            <img src="/images/logo-personeria.png" alt="Logo Personería Municipal de Guadalajara de Buga" className="w-12 h-12" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gov-blue leading-tight">
                Personería Municipal
              </h1>
              <p className="text-sm text-gray-600">Guadalajara de Buga</p>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <nav id="navegacion-principal" role="navigation" aria-label="Navegación principal" className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <DesktopMenuItem
                key={item.label}
                item={item}
                isOpen={activeDropdown === item.label}
                onOpen={() => setActiveDropdown(item.label)}
                onClose={() => setActiveDropdown(null)}
                onToggle={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
              />
            ))}
          </nav>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {/* Búsqueda */}
            <div className="relative">
              {searchOpen ? (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white shadow-lg rounded-md p-2">
                  <Input 
                    type="search" 
                    placeholder="Buscar..." 
                    className="w-64"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false) }}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Cerrar búsqueda"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Abrir búsqueda"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Botón PQRSD destacado */}
            <Link href="/atencion-ciudadano/pqrsd" className="hidden sm:block">
              <Button variant="gov" size="sm">
                Radicar PQRSD
              </Button>
            </Link>

            {/* Menú móvil */}
            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4" aria-label="Menú de navegación móvil">
            {menuItems.map((item) => (
              <MobileMenuItem key={item.label} item={item} onNavigate={() => setMobileMenuOpen(false)} />
            ))}
            <div className="pt-4 mt-4 border-t">
              <Link href="/atencion-ciudadano/pqrsd" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gov" className="w-full">
                  Radicar PQRSD
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

// ─── Desktop menu item con accesibilidad por teclado ─────────────────────────

interface DesktopMenuItemProps {
  item: typeof menuItems[0]
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onToggle: () => void
}

function DesktopMenuItem({ item, isOpen, onOpen, onClose, onToggle }: DesktopMenuItemProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLAnchorElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!item.children) return

    switch (e.key) {
      case "Enter":
      case " ":
        // Si tiene hijos, toggle dropdown en lugar de navegar
        e.preventDefault()
        onToggle()
        break
      case "ArrowDown":
        e.preventDefault()
        if (!isOpen) {
          onOpen()
        }
        // Enfocar primer item del dropdown
        requestAnimationFrame(() => {
          const firstLink = dropdownRef.current?.querySelector("a") as HTMLElement | null
          firstLink?.focus()
        })
        break
      case "Escape":
        if (isOpen) {
          e.preventDefault()
          e.stopPropagation()
          onClose()
          triggerRef.current?.focus()
        }
        break
    }
  }, [item.children, isOpen, onOpen, onClose, onToggle])

  const handleDropdownKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const items = dropdownRef.current?.querySelectorAll("a") as NodeListOf<HTMLElement> | undefined
    if (!items) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (index < items.length - 1) {
          items[index + 1].focus()
        }
        break
      case "ArrowUp":
        e.preventDefault()
        if (index > 0) {
          items[index - 1].focus()
        } else {
          // Volver al trigger
          triggerRef.current?.focus()
          onClose()
        }
        break
      case "Escape":
        e.preventDefault()
        e.stopPropagation()
        onClose()
        triggerRef.current?.focus()
        break
      case "Tab":
        // Cerrar al salir con tab
        if (e.shiftKey && index === 0) {
          onClose()
        } else if (!e.shiftKey && index === items.length - 1) {
          onClose()
        }
        break
    }
  }, [onClose])

  // Item sin hijos: link simple
  if (!item.children) {
    return (
      <Link
        href={item.href}
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gov-blue hover:bg-gray-50 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue"
      >
        {item.label}
      </Link>
    )
  }

  // Item con dropdown
  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <Link
        ref={triggerRef}
        href={item.href}
        className={cn(
          "flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gov-blue hover:bg-gray-50 rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue",
          isOpen && "text-gov-blue bg-gray-50"
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onKeyDown={handleKeyDown}
      >
        {item.label}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </Link>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 w-72 bg-white shadow-lg rounded-md border py-2 z-50"
          role="menu"
          aria-label={`Submenú de ${item.label}`}
        >
          {item.children.map((child, index) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gov-blue hover:text-white transition-colors focus-visible:bg-gov-blue focus-visible:text-white focus-visible:outline-none"
              onKeyDown={(e) => handleDropdownKeyDown(e, index)}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mobile menu item ─────────────────────────────────────────────────────────

function MobileMenuItem({ item, onNavigate }: { item: typeof menuItems[0]; onNavigate: () => void }) {
  const [open, setOpen] = useState(false)

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block py-3 text-gray-700 hover:text-gov-blue border-b focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue"
      >
        {item.label}
      </Link>
    )
  }

  return (
    <div className="border-b">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-gray-700 hover:text-gov-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue rounded"
        aria-expanded={open}
        aria-controls={`mobile-submenu-${item.label.replace(/\s+/g, "-").toLowerCase()}`}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open && (
        <div id={`mobile-submenu-${item.label.replace(/\s+/g, "-").toLowerCase()}`} className="pl-4 pb-3" role="menu">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              onClick={onNavigate}
              className="block py-2 text-sm text-gray-600 hover:text-gov-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue rounded"
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
