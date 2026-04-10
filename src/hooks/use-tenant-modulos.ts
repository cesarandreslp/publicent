"use client"

/**
 * useTenantModulos — Hook de cliente para leer la config de módulos del tenant.
 *
 * Llama a GET /api/tenant/modulos (cacheado en CDN por 5 min).
 * Devuelve URLs dinámicas según el módulo activo (PQRS nativo vs Ventanilla Única).
 *
 * Uso:
 *   const { pqrsUrl, consultarPqrsUrl, documentalUrl, loading } = useTenantModulos()
 */

import { useState, useEffect } from "react"

interface TenantModulosResult {
  pqrsUrl:         string | null
  consultarPqrsUrl: string | null
  documentalUrl:   string | null
  documentalActivo: boolean
  ventanillaActiva: boolean
  loading: boolean
}

const DEFAULTS: TenantModulosResult = {
  pqrsUrl:          null,
  consultarPqrsUrl: null,
  documentalUrl:    null,
  documentalActivo: false,
  ventanillaActiva: false,
  loading:          true,
}

export function useTenantModulos(): TenantModulosResult {
  const [result, setResult] = useState<TenantModulosResult>(DEFAULTS)

  useEffect(() => {
    let cancelled = false

    fetch("/api/tenant/modulos", { next: { revalidate: 300 } } as RequestInit)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data) return
        setResult({
          pqrsUrl:          data.pqrsUrl         ?? null,
          consultarPqrsUrl: data.consultarPqrsUrl ?? null,
          documentalUrl:    data.documentalUrl    ?? null,
          documentalActivo: !!data.documentalUrl,
          ventanillaActiva: data.modulos?.ventanilla_unica?.activo === true,
          loading:          false,
        })
      })
      .catch(() => {
        if (!cancelled) setResult({ ...DEFAULTS, loading: false })
      })

    return () => { cancelled = true }
  }, [])

  return result
}
