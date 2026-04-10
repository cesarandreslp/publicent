"use client"

import { useState } from "react"
import {
  MODULOS_CATALOGO,
  resolveModulosConfig,
  type ModulosConfig,
  type ModuloCatalogo,
  type ModuloId,
} from "@/lib/modules"

// ─── Iconos SVG inline ────────────────────────────────────────────────────────

const ICONOS: Record<ModuloId, React.ReactNode> = {
  sitio_web: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ventanilla_unica: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  gestion_documental: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
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
            {show ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
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
  disponible,
  onChange,
}: {
  catalogo: ModuloCatalogo
  config: ModulosConfig[ModuloId]
  disponible: boolean
  onChange: (updates: Partial<ModulosConfig[ModuloId]>) => void
}) {
  const activo = config.activo

  // Extraer campos de integración del config actual
  const integrations = catalogo.camposIntegracion ?? []
  const configAsRecord = config as unknown as Record<string, unknown>

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all ${
        !disponible
          ? "border-slate-800 opacity-60"
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
          {ICONOS[catalogo.id]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{catalogo.nombre}</h3>
            {catalogo.obligatorio && (
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                Siempre activo
              </span>
            )}
            {!disponible && (
              <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded-full">
                Plan superior requerido
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{catalogo.descripcion}</p>
        </div>

        <Toggle
          checked={activo}
          onChange={(v) => onChange({ activo: v } as Partial<ModulosConfig[ModuloId]>)}
          disabled={!disponible || catalogo.obligatorio}
        />
      </div>

      {/* Campos de integración (solo cuando activo y tiene integración) */}
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

const PLAN_RANK: Record<string, number> = {
  BASICO: 0, ESTANDAR: 1, PROFESIONAL: 2, ENTERPRISE: 3,
}

export default function TenantModulos({ tenantId, plan, modulosRaw }: Props) {
  const [modulos, setModulos] = useState<ModulosConfig>(
    resolveModulosConfig(modulosRaw)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const planRank = PLAN_RANK[plan] ?? 0

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
            Plan actual:{" "}
            <span className="text-white font-medium">{plan}</span>
          </p>
        </div>
      </div>

      {/* Tarjetas de módulos */}
      <div className="space-y-3">
        {MODULOS_CATALOGO.map((catalogo) => {
          const minPlan = catalogo.planesDisponibles[0]
          const disponible = planRank >= (PLAN_RANK[minPlan] ?? 0)
          const config = modulos[catalogo.id]

          return (
            <ModuloCard
              key={catalogo.id}
              catalogo={catalogo}
              config={config}
              disponible={disponible}
              onChange={(updates) => handleChange(catalogo.id, updates)}
            />
          )
        })}
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 13l4 4L19 7" />
          </svg>
          Configuración de módulos guardada correctamente
        </div>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end pt-1">
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
