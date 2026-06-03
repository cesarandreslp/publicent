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
        title: "Identidad institucional",
        href: "/admin/contenido/identidad",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 7v6m-3-3h6" />
          </svg>
        ),
      },
      {
        title: "Sedes",
        href: "/admin/contenido/sedes",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        title: "Canales de atención",
        href: "/admin/contenido/canales",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        ),
      },
      {
        title: "FAQs",
        href: "/admin/contenido/faqs",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Funcionarios",
        href: "/admin/contenido/funcionarios",
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
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
      {
        title: "Observatorio",
        href: "/admin/observatorio",
        externo: false,
        modulo: MODULO_IDS.OBSERVATORIO,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        ),
      },
      {
        title: "Auditoría",
        href: "/admin/auditoria",
        externo: false,
        modulo: MODULO_IDS.AUDITORIA_AVANZADA,
        roles: ["SUPER_ADMIN", "ADMIN"],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
    ],
  },
  {
    label: "Módulos activos",
    items: [
      {
        title: "Ventanilla Única",
        // Modo nativo: apunta a /admin/ventanilla. Si el módulo tiene apiUrl se sobreescribe en render.
        href: "/admin/ventanilla",
        externo: false,
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
      {
        title: "FRISCO — Bienes",
        href: "/admin/frisco",
        externo: false,
        modulo: MODULO_IDS.FRISCO_BIENES,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
          </svg>
        ),
      },
      {
        title: "Contabilidad",
        href: "/admin/contabilidad",
        externo: false,
        modulo: MODULO_IDS.CONTABILIDAD_PUBLICA,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 3h18v4H3V3zm0 8h12v10H3V11zm14 0h4v4h-4v-4zm0 6h4v4h-4v-4z" />
          </svg>
        ),
      },
      {
        title: "Presupuesto",
        href: "/admin/presupuesto",
        externo: false,
        modulo: MODULO_IDS.PRESUPUESTO_EJECUCION,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v8m0 0v2m0-10V6m9 6a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Nómina",
        href: "/admin/nomina",
        externo: false,
        modulo: MODULO_IDS.NOMINA_PUBLICA,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-4 4" />
          </svg>
        ),
      },
      {
        title: "Reportes de control",
        href: "/admin/reportes-control",
        externo: false,
        modulo: MODULO_IDS.REPORTES_CONTROL,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        title: "Tesorería",
        href: "/admin/tesoreria",
        externo: false,
        modulo: MODULO_IDS.TESORERIA,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
      },
      {
        title: "Contratación",
        href: "/admin/contratacion",
        externo: false,
        modulo: MODULO_IDS.CONTRATACION,
        badge: "Activo",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        title: "Activos y bienes",
        href: "/admin/activos",
        externo: false,
        modulo: MODULO_IDS.ACTIVOS_BIENES,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      {
        title: "Rentas locales",
        href: "/admin/rentas",
        externo: false,
        modulo: MODULO_IDS.RENTAS_LOCALES,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        title: "Almacén",
        href: "/admin/almacen",
        externo: false,
        modulo: MODULO_IDS.ALMACEN,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
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
                      <span className="flex-1">{item.title}</span>
                      {'badge' in item && item.badge && (
                        <span className="text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-800/40 px-1.5 py-0.5 rounded-full leading-none">
                          {item.badge}
                        </span>
                      )}
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
