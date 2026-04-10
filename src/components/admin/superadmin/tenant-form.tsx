"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface TenantFormData {
  id?: string
  slug?: string
  codigo?: string
  nombre?: string
  nombreCorto?: string
  tipoEntidad?: string
  nit?: string
  municipio?: string
  departamento?: string
  codigoDivipola?: string
  dominioPrincipal?: string
  dominioPersonalizado?: string
  databaseUrl?: string
  databaseName?: string
  plan?: string
  emailContacto?: string
  telefonoContacto?: string
  nombreContacto?: string
  logoUrl?: string
  colorPrimario?: string
  colorSecundario?: string
  fechaActivacion?: string
  fechaVencimiento?: string
  modulosActivos?: {
    pqrsd?: boolean
    gestionDocumental?: boolean
    ventanillaUnica?: boolean
  }
}

const TIPOS = [
  "PERSONERIA", "CONTRALORIA", "ALCALDIA", "CONCEJO",
  "GOBERNACION", "ASAMBLEA", "OTRO",
]

const PLANES = ["BASICO", "ESTANDAR", "PROFESIONAL", "ENTERPRISE"]

function Field({
  label, name, type = "text", value, onChange, required, placeholder, hint, readOnly,
}: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  placeholder?: string
  hint?: string
  readOnly?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-sm disabled:opacity-50 read-only:opacity-70"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function SelectField({
  label, name, value, onChange, options, required,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  options: string[]
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition text-sm"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  )
}

export default function TenantForm({ initial = {} }: { initial?: TenantFormData }) {
  const router = useRouter()
  const isEdit = !!initial.id

  const [f, setF] = useState<TenantFormData>({
    slug:              initial.slug             ?? "",
    codigo:            initial.codigo           ?? "",
    nombre:            initial.nombre           ?? "",
    nombreCorto:       initial.nombreCorto      ?? "",
    tipoEntidad:       initial.tipoEntidad      ?? "PERSONERIA",
    nit:               initial.nit              ?? "",
    municipio:         initial.municipio        ?? "",
    departamento:      initial.departamento     ?? "",
    codigoDivipola:    initial.codigoDivipola   ?? "",
    dominioPrincipal:  initial.dominioPrincipal ?? "",
    dominioPersonalizado: initial.dominioPersonalizado ?? "",
    databaseUrl:       initial.databaseUrl      ?? "",
    databaseName:      initial.databaseName     ?? "",
    plan:              initial.plan             ?? "BASICO",
    emailContacto:     initial.emailContacto    ?? "",
    telefonoContacto:  initial.telefonoContacto ?? "",
    nombreContacto:    initial.nombreContacto   ?? "",
    logoUrl:           initial.logoUrl          ?? "",
    colorPrimario:     initial.colorPrimario    ?? "#1a56db",
    colorSecundario:   initial.colorSecundario  ?? "#7e3af2",
    fechaActivacion:   initial.fechaActivacion
      ? new Date(initial.fechaActivacion).toISOString().split("T")[0]
      : "",
    fechaVencimiento:  initial.fechaVencimiento
      ? new Date(initial.fechaVencimiento).toISOString().split("T")[0]
      : "",
    modulosActivos: initial.modulosActivos ?? {
      pqrsd: true,
      gestionDocumental: false,
      ventanillaUnica: false,
    },
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(key: keyof TenantFormData) {
    return (v: string) => setF((prev) => ({ ...prev, [key]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...f,
      fechaActivacion:  f.fechaActivacion  || null,
      fechaVencimiento: f.fechaVencimiento || null,
      dominioPersonalizado: f.dominioPersonalizado || null,
    }

    try {
      const res = isEdit
        ? await fetch(`/api/superadmin/tenants/${initial.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/superadmin/tenants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Error al guardar")
        return
      }

      router.push(isEdit ? `/superadmin/tenants/${initial.id}` : "/superadmin/tenants")
      router.refresh()
    } catch {
      setError("Error de red. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const section = (title: string, children: React.ReactNode) => (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      {section("Identificadores", <>
        <Field label="Slug"   name="slug"   value={f.slug!}   onChange={set("slug")}
          required placeholder="personeria-buga" readOnly={isEdit}
          hint="Identificador único URL-friendly. No se puede cambiar después." />
        <Field label="Código DIVIPOLA" name="codigo" value={f.codigo!} onChange={set("codigo")}
          required placeholder="76111-001" hint="Código único de la entidad en la plataforma" />
        <Field label="NIT" name="nit" value={f.nit!} onChange={set("nit")} placeholder="890.706.353-1" />
        <Field label="Código DIVIPOLA municipio" name="codigoDivipola" value={f.codigoDivipola!}
          onChange={set("codigoDivipola")} placeholder="76111" />
      </>)}

      {section("Información de la entidad", <>
        <div className="sm:col-span-2">
          <Field label="Nombre completo" name="nombre" value={f.nombre!} onChange={set("nombre")}
            required placeholder="Personería Municipal de Guadalajara de Buga" />
        </div>
        <Field label="Nombre corto" name="nombreCorto" value={f.nombreCorto!}
          onChange={set("nombreCorto")} placeholder="Personería de Buga" />
        <SelectField label="Tipo de entidad" name="tipoEntidad" value={f.tipoEntidad!}
          onChange={set("tipoEntidad")} options={TIPOS} required />
        <Field label="Municipio" name="municipio" value={f.municipio!}
          onChange={set("municipio")} required placeholder="Guadalajara de Buga" />
        <Field label="Departamento" name="departamento" value={f.departamento!}
          onChange={set("departamento")} required placeholder="Valle del Cauca" />
      </>)}

      {section("Dominios", <>
        <Field label="Dominio principal" name="dominioPrincipal" value={f.dominioPrincipal!}
          onChange={set("dominioPrincipal")} required
          placeholder="personeria-buga.tuplatforma.com"
          hint="Subdominio gestionado por la plataforma" />
        <Field label="Dominio personalizado" name="dominioPersonalizado"
          value={f.dominioPersonalizado!} onChange={set("dominioPersonalizado")}
          placeholder="personeriabuga.gov.co" hint="Dominio propio .gov.co (opcional)" />
      </>)}

      {section("Base de datos", <>
        <div className="sm:col-span-2">
          <Field label="Connection string PostgreSQL" name="databaseUrl" value={f.databaseUrl!}
            onChange={set("databaseUrl")} required type="password"
            placeholder="postgresql://user:pass@host/db?sslmode=require"
            hint="URL de conexión única del tenant en Neon u otro proveedor PostgreSQL" />
        </div>
        <Field label="Nombre de la base de datos" name="databaseName" value={f.databaseName!}
          onChange={set("databaseName")} required placeholder="personeria_buga_prod" />
      </>)}

      {section("Plan y contrato", <>
        <SelectField label="Plan" name="plan" value={f.plan!}
          onChange={set("plan")} options={PLANES} required />
        <div />
        <Field label="Fecha de activación" name="fechaActivacion" value={f.fechaActivacion!}
          onChange={set("fechaActivacion")} type="date" />
        <Field label="Fecha de vencimiento" name="fechaVencimiento" value={f.fechaVencimiento!}
          onChange={set("fechaVencimiento")} type="date" />
      </>)}

      {section("Módulos Activos", <>
        <div className="sm:col-span-2 space-y-4">
          <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-xl bg-[#0a0f1e] cursor-pointer hover:border-slate-500 transition">
            <input type="checkbox" checked={f.modulosActivos?.pqrsd}
              onChange={(e) => setF(p => ({ ...p, modulosActivos: { ...p.modulosActivos, pqrsd: e.target.checked } }))}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/50" />
            <div>
              <p className="text-sm font-medium text-white">PQRS Básicas</p>
              <p className="text-xs text-slate-500">Módulo nativo de peticiones y quejas</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-xl bg-[#0a0f1e] cursor-pointer hover:border-slate-500 transition">
            <input type="checkbox" checked={f.modulosActivos?.gestionDocumental}
              onChange={(e) => setF(p => ({ ...p, modulosActivos: { ...p.modulosActivos, gestionDocumental: e.target.checked } }))}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/50" />
            <div>
              <p className="text-sm font-medium text-white">Gestor Documental (Orfeo NG)</p>
              <p className="text-xs text-slate-500">Suite avanzada de gestión documental</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 border border-slate-700 rounded-xl bg-[#0a0f1e] cursor-pointer hover:border-slate-500 transition">
            <input type="checkbox" checked={f.modulosActivos?.ventanillaUnica}
              onChange={(e) => setF(p => ({ ...p, modulosActivos: { ...p.modulosActivos, ventanillaUnica: e.target.checked } }))}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/50" />
            <div>
              <p className="text-sm font-medium text-white">Ventanilla Única</p>
              <p className="text-xs text-slate-500">Recepción especializada de correspondencia y PQRSD acoplada a Orfeo</p>
            </div>
          </label>
        </div>
      </>)}

      {section("Contacto", <>
        <Field label="Email de contacto" name="emailContacto" value={f.emailContacto!}
          onChange={set("emailContacto")} required type="email"
          placeholder="admin@personeriabuga.gov.co" />
        <Field label="Teléfono" name="telefonoContacto" value={f.telefonoContacto!}
          onChange={set("telefonoContacto")} type="tel" placeholder="+57 2 228 0000" />
        <div className="sm:col-span-2">
          <Field label="Nombre del contacto técnico" name="nombreContacto"
            value={f.nombreContacto!} onChange={set("nombreContacto")}
            placeholder="Juan Pérez" />
        </div>
      </>)}

      {section("Apariencia", <>
        <div className="sm:col-span-2">
          <Field label="URL del logo" name="logoUrl" value={f.logoUrl!}
            onChange={set("logoUrl")} type="url"
            placeholder="https://cdn.tuplatforma.com/logos/personeria-buga.png" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Color primario</label>
          <div className="flex items-center gap-3">
            <input type="color" value={f.colorPrimario!}
              onChange={(e) => setF((p) => ({ ...p, colorPrimario: e.target.value }))}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
            <input type="text" value={f.colorPrimario!}
              onChange={(e) => setF((p) => ({ ...p, colorPrimario: e.target.value }))}
              className="flex-1 px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Color secundario</label>
          <div className="flex items-center gap-3">
            <input type="color" value={f.colorSecundario!}
              onChange={(e) => setF((p) => ({ ...p, colorSecundario: e.target.value }))}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
            <input type="text" value={f.colorSecundario!}
              onChange={(e) => setF((p) => ({ ...p, colorSecundario: e.target.value }))}
              className="flex-1 px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>
      </>)}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-5 py-3 text-sm">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-xl text-sm transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
        >
          {loading ? "Guardando…" : isEdit ? "Guardar cambios" : "Registrar entidad"}
        </button>
      </div>
    </form>
  )
}
