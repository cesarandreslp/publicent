"use client"

import { useMemo, useState } from "react"
import {
  MODULOS_CATALOGO,
  CATEGORIA_LABEL,
  areDepsActive,
  resolveModulosConfig,
  type ModulosConfig,
  type ModuloCatalogo,
  type ModuloId,
  type ModuloCategoria,
} from "@/lib/modules"
import { BUNDLES, type BundleId } from "@/lib/module-bundles"

// ─── Iconos por categoría (un set compacto sirve para los 29 módulos) ─────────

const ICONO_POR_CATEGORIA: Record<ModuloCategoria, React.ReactNode> = {
  portal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  atencion: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  documental: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    </svg>
  ),
  cumplimiento: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  financiero: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  operativo: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  analitica: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  vertical: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  integracion: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
  tenantId: string
  plan: string
  /** modulosActivos del tenant tal como llegan de la meta-DB */
  modulosRaw: unknown
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        disabled
          ? "opacity-40 cursor-not-allowed bg-slate-700"
          : checked
            ? "bg-blue-600"
            : "bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}

// ─── Campo de integración ──────────────────────────────────────────────────────

function IntegrationField({
  label,
  placeholder,
  tipo,
  descripcion,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  tipo: "text" | "password" | "url"
  descripcion?: string
  value: string
  onChange: (v: string) => void
}) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <div className="relative">
        <input
          type={tipo === "password" && !show ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm bg-[#0a0f1e] border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition"
        />
        {tipo === "password" && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
            tabIndex={-1}
          >
            {show ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {descripcion && <p className="mt-1 text-xs text-slate-600">{descripcion}</p>}
    </div>
  )
}

// ─── Tarjeta de módulo ────────────────────────────────────────────────────────

function ModuloCard({
  catalogo,
  config,
  disponiblePlan,
  depsOk,
  depsFaltantes,
  onChange,
}: {
  catalogo: ModuloCatalogo
  config: ModulosConfig[ModuloId]
  disponiblePlan: boolean
  depsOk: boolean
  depsFaltantes: string[]
  onChange: (updates: Partial<ModulosConfig[ModuloId]>) => void
}) {
  const activo = config.activo
  const bloqueado = !disponiblePlan || !depsOk || catalogo.obligatorio

  const integrations = catalogo.camposIntegracion ?? []
  const configAsRecord = config as unknown as Record<string, unknown>

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all ${
        !disponiblePlan
          ? "border-slate-800 opacity-60"
          : !depsOk && !activo
            ? "border-slate-800 opacity-70"
            : activo
              ? "border-blue-600/40 bg-blue-950/10"
              : "border-slate-800 bg-[#111827]"
      }`}
    >
      {/* Cabecera */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            activo ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-500"
          }`}
        >
          {ICONO_POR_CATEGORIA[catalogo.categoria]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{catalogo.nombre}</h3>
            <span className="text-[10px] uppercase tracking-wide bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {catalogo.tier}
            </span>
            {catalogo.obligatorio && (
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                Siempre activo
              </span>
            )}
            {!disponiblePlan && (
              <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded-full">
                Plan superior requerido
              </span>
            )}
            {!depsOk && depsFaltantes.length > 0 && (
              <span className="text-xs bg-orange-900/40 text-orange-300 border border-orange-800/40 px-2 py-0.5 rounded-full">
                Requiere: {depsFaltantes.join(", ")}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{catalogo.descripcion}</p>
        </div>

        <Toggle
          checked={activo}
          onChange={(v) => onChange({ activo: v } as Partial<ModulosConfig[ModuloId]>)}
          disabled={bloqueado}
        />
      </div>

      {/* Campos de integración */}
      {activo && catalogo.tieneIntegracion && integrations.length > 0 && (
        <div className="px-5 pb-5 border-t border-slate-800/60 pt-4 space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            Configuración de integración
          </p>
          {integrations.map((campo) => (
            <IntegrationField
              key={campo.key}
              label={campo.label}
              placeholder={campo.placeholder}
              tipo={campo.tipo}
              descripcion={campo.descripcion}
              value={(configAsRecord[campo.key] as string) ?? ""}
              onChange={(v) => onChange({ [campo.key]: v } as Partial<ModulosConfig[ModuloId]>)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

const ORDEN_CATEGORIAS: ModuloCategoria[] = [
  'portal', 'atencion', 'documental', 'cumplimiento',
  'financiero', 'operativo', 'vertical', 'analitica', 'integracion',
]

export default function TenantModulos({ tenantId, plan, modulosRaw }: Props) {
  const [modulos, setModulos] = useState<ModulosConfig>(
    resolveModulosConfig(modulosRaw)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Agrupar por categoría preservando el orden definido
  const porCategoria = useMemo(() => {
    const grupos = new Map<ModuloCategoria, ModuloCatalogo[]>()
    for (const cat of ORDEN_CATEGORIAS) grupos.set(cat, [])
    for (const m of MODULOS_CATALOGO) grupos.get(m.categoria)?.push(m)
    return grupos
  }, [])

  function handleChange(
    id: ModuloId,
    updates: Partial<ModulosConfig[ModuloId]>
  ) {
    setModulos((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }))
    setSuccess(false)
    setError(null)
  }

  function aplicarBundle(bundleId: BundleId) {
    const bundle = BUNDLES.find((b) => b.id === bundleId)
    if (!bundle) return
    const set = new Set<ModuloId>(bundle.modulos)
    setModulos((prev) => {
      const next = { ...prev }
      for (const m of MODULOS_CATALOGO) {
        if (m.obligatorio) continue
        // Activación por contrato: el bundle activa exactamente sus módulos, sin límite de plan.
        next[m.id] = { ...next[m.id], activo: set.has(m.id) }
      }
      return next
    })
    setSuccess(false)
    setError(null)
  }

  async function handleSave() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/modulos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modulos),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Error al guardar")
        return
      }

      setModulos(resolveModulosConfig(data.modulos))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setError("Error de red. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            Activación de módulos <span className="text-white font-medium">por contrato</span>
            {plan ? <span className="text-slate-600"> · plan de referencia: {plan}</span> : null}
          </p>
        </div>
      </div>

      {/* Bundles comerciales */}
      <div className="border border-slate-800 bg-[#111827] rounded-2xl p-4">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-3">
          Aplicar bundle preconfigurado
        </p>
        <div className="grid sm:grid-cols-3 gap-2">
          {BUNDLES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => aplicarBundle(b.id)}
              className="text-left px-3 py-2 rounded-xl border border-slate-700 hover:border-blue-600/60 hover:bg-blue-950/10 transition"
              title={b.descripcion}
            >
              <div className="text-sm font-medium text-white">{b.nombre}</div>
              <div className="text-xs text-slate-500 mt-0.5">{b.perfiles.join(' · ')}</div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-600 mt-3">
          Aplicar un bundle reemplaza la selección actual de módulos no obligatorios. La activación final depende del contrato del cliente.
        </p>
      </div>

      {/* Tarjetas por categoría */}
      {ORDEN_CATEGORIAS.map((categoria) => {
        const modulosCat = porCategoria.get(categoria) ?? []
        if (modulosCat.length === 0) return null

        return (
          <section key={categoria} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2">
              {CATEGORIA_LABEL[categoria]}
            </h2>
            <div className="space-y-3">
              {modulosCat.map((catalogo) => {
                // Activación por contrato: no se limita por plan. El único bloqueo
                // real es por dependencias de módulo o por ser obligatorio.
                const disponiblePlan = true
                const depsOk = areDepsActive(modulos, catalogo.id)
                const depsFaltantes = (catalogo.dependeDe ?? [])
                  .filter((dep) => !modulos[dep]?.activo)
                  .map((dep) => MODULOS_CATALOGO.find((m) => m.id === dep)?.nombre ?? dep)
                const config = modulos[catalogo.id]

                return (
                  <ModuloCard
                    key={catalogo.id}
                    catalogo={catalogo}
                    config={config}
                    disponiblePlan={disponiblePlan}
                    depsOk={depsOk}
                    depsFaltantes={depsFaltantes}
                    onChange={(updates) => handleChange(catalogo.id, updates)}
                  />
                )
              })}
            </div>
          </section>
        )
      })}

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 text-sm">
          Configuración de módulos guardada correctamente
        </div>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end pt-1 sticky bottom-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
        >
          {loading ? "Guardando…" : "Guardar módulos"}
        </button>
      </div>
    </div>
  )
}
