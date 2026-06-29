"use client"

/**
 * TenantIdentityProvider — expone la identidad del tenant activo (nombre oficial y
 * nombre corto) a los componentes de cliente.
 *
 * El layout (server component) resuelve el nombre del tenant y lo inyecta aquí, de
 * modo que cualquier componente cliente del sitio público pueda mostrar el nombre
 * de la ENTIDAD ACTIVA en vez de un valor horneado (ej. el texto de tratamiento de
 * datos del formulario PQRSD). Evita hardcodes de un tenant específico.
 */

import { createContext, useContext } from "react"

export interface TenantIdentity {
  /** Nombre oficial completo del tenant (ej. "Personería Municipal de Guadalajara de Buga"). */
  nombre: string
  /** Nombre corto del tenant (ej. "Personería de Buga"). */
  nombreCorto: string
}

const FALLBACK: TenantIdentity = {
  nombre: "la entidad",
  nombreCorto: "la entidad",
}

const TenantIdentityContext = createContext<TenantIdentity>(FALLBACK)

export function TenantIdentityProvider({
  nombre,
  nombreCorto,
  children,
}: {
  nombre?: string | null
  nombreCorto?: string | null
  children: React.ReactNode
}) {
  const value: TenantIdentity = {
    nombre: nombre?.trim() || FALLBACK.nombre,
    nombreCorto: nombreCorto?.trim() || nombre?.trim() || FALLBACK.nombreCorto,
  }
  return (
    <TenantIdentityContext.Provider value={value}>
      {children}
    </TenantIdentityContext.Provider>
  )
}

/** Devuelve la identidad del tenant activo. Seguro de usar en cualquier client component. */
export function useTenantIdentity(): TenantIdentity {
  return useContext(TenantIdentityContext)
}
