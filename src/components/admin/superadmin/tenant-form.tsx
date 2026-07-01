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
  groqApiKey?: string
  shipuApiKey?: string
  smtpHost?: string
  smtpPort?: string
  smtpUser?: string
  smtpPass?: string
  smtpFrom?: string
  whatsappPhoneNumberId?: string
  whatsappAccessToken?: string
  whatsappFromPhone?: string
  secopClientId?: string
  secopClientSecret?: string
  secopNit?: string
  modulosActivos?: {
    pqrsd?: boolean
    gestionDocumental?: boolean
    ventanillaUnica?: boolean
  }
}

const TIPOS = [
  "PERSONERIA", "CONTRALORIA", "ALCALDIA", "CONCEJO",
  "GOBERNACION", "ASAMBLEA", "MINISTERIO", "AGENCIA", "OTRO",
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
    groqApiKey:      "",
    shipuApiKey:     "",
    smtpHost:        initial.smtpHost ?? "",
    smtpPort:        initial.smtpPort ?? "587",
    smtpUser:        initial.smtpUser ?? "",
    smtpPass:        "",
    smtpFrom:        initial.smtpFrom ?? "",
    whatsappPhoneNumberId: initial.whatsappPhoneNumberId ?? "",
    whatsappAccessToken:   "",
    whatsappFromPhone:     initial.whatsappFromPhone ?? "",
    secopClientId:     initial.secopClientId ?? "",
    secopClientSecret: "",
    secopNit:          initial.secopNit ?? "",
    modulosActivos: initial.modulosActivos ?? {
      pqrsd: true,
      gestionDocumental: false,
      ventanillaUnica: false,
    },
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [waTestPhone, setWaTestPhone] = useState("")
  const [waTestState, setWaTestState] = useState<{ loading: boolean; msg: string | null; ok: boolean }>({ loading: false, msg: null, ok: false })
  const [secopTestState, setSecopTestState] = useState<{ loading: boolean; msg: string | null; ok: boolean }>({ loading: false, msg: null, ok: false })

  function set(key: keyof TenantFormData) {
    return (v: string) => setF((prev) => ({ ...prev, [key]: v }))
  }

  async function enviarPruebaWhatsApp() {
    if (!initial.id) return
    if (!waTestPhone.trim()) {
      setWaTestState({ loading: false, msg: "Ingresa un número de prueba.", ok: false })
      return
    }
    setWaTestState({ loading: true, msg: null, ok: false })
    try {
      const res = await fetch(`/api/superadmin/tenants/${initial.id}/whatsapp-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone: waTestPhone.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setWaTestState({ loading: false, msg: data.error ?? "Error al enviar la prueba.", ok: false })
        return
      }
      setWaTestState({ loading: false, msg: `Mensaje de prueba enviado (id: ${data.messageId ?? "—"}).`, ok: true })
    } catch {
      setWaTestState({ loading: false, msg: "Error de red al enviar la prueba.", ok: false })
    }
  }

  async function verificarSecopConexion() {
    if (!initial.id) return
    setSecopTestState({ loading: true, msg: null, ok: false })
    try {
      const res = await fetch(`/api/superadmin/tenants/${initial.id}/secop-test`, { method: "POST" })
      const data = await res.json()
      if (!data.success) {
        setSecopTestState({ loading: false, msg: data.error ?? "Error al verificar conexión.", ok: false })
        return
      }
      setSecopTestState({ loading: false, msg: data.mensaje ?? "Conexión verificada.", ok: true })
    } catch {
      setSecopTestState({ loading: false, msg: "Error de red al verificar.", ok: false })
    }
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

      {section("Configuración IA", <>
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Cada entidad gestiona su propio consumo de IA. El tenant debe proveer sus propias API keys.
            Si Groq falla o no está configurado, el sistema usa Shipu (z.ai) automáticamente como respaldo.
          </p>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="API Key de Groq"
            name="groqApiKey"
            type="password"
            value={f.groqApiKey!}
            onChange={set("groqApiKey")}
            placeholder="gsk_..."
            hint="Clasificación PQRSD con LLaMA 3.3 70B. Obtener en console.groq.com."
          />
        </div>
        <div className="sm:col-span-2">
          <Field
            label="API Key de Shipu (z.ai) — Respaldo"
            name="shipuApiKey"
            type="password"
            value={f.shipuApiKey!}
            onChange={set("shipuApiKey")}
            placeholder="sk-..."
            hint="Proveedor de respaldo (modelo z1-32b). Se activa automáticamente si Groq no responde."
          />
        </div>
        {isEdit && (
          <div className="sm:col-span-2">
            <p className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-2.5">
              ⚠ En modo edición, deja los campos en blanco para conservar las API keys actuales.
              Ingresa una nueva clave solo si deseas reemplazarla.
            </p>
          </div>
        )}
      </>)}

      {section("Configuración de correo (SMTP)", <>
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Cada entidad usa su propio correo institucional (Google Workspace, Microsoft 365 u
            hosting propio). Se usa para PQRSD, recuperación de contraseña y alertas automáticas.
            Si no se configura, no se enviarán correos para este tenant.
          </p>
        </div>
        <Field
          label="Servidor SMTP (host)"
          name="smtpHost"
          value={f.smtpHost!}
          onChange={set("smtpHost")}
          placeholder="smtp.gmail.com / smtp.office365.com"
          hint="Host del proveedor de correo de la entidad."
        />
        <Field
          label="Puerto"
          name="smtpPort"
          value={f.smtpPort!}
          onChange={set("smtpPort")}
          placeholder="587"
          hint="587 (STARTTLS) o 465 (SSL)."
        />
        <Field
          label="Usuario SMTP"
          name="smtpUser"
          value={f.smtpUser!}
          onChange={set("smtpUser")}
          placeholder="notificaciones@entidad.gov.co"
          hint="Cuenta que autentica el envío."
        />
        <Field
          label="Contraseña SMTP"
          name="smtpPass"
          type="password"
          value={f.smtpPass!}
          onChange={set("smtpPass")}
          placeholder="••••••••"
          hint="Con Gmail/Workspace usa una 'app password' (requiere 2FA)."
        />
        <div className="sm:col-span-2">
          <Field
            label="Remitente (From)"
            name="smtpFrom"
            value={f.smtpFrom!}
            onChange={set("smtpFrom")}
            placeholder="notificaciones@entidad.gov.co"
            hint="Opcional. Si se omite, se usa el usuario SMTP. En Gmail debe coincidir con el usuario o ser un alias verificado."
          />
        </div>
        {isEdit && (
          <div className="sm:col-span-2">
            <p className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-2.5">
              ⚠ En modo edición, deja la contraseña en blanco para conservar la actual.
              Para eliminar el SMTP del tenant, borra el host y el usuario.
            </p>
          </div>
        )}
      </>)}

      {section("Configuración WhatsApp (Meta Cloud API)", <>
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Canal de notificaciones WhatsApp para PQRSD y Ventanilla Única. Usa la API gratuita de
            Meta Cloud (hasta 1.000 conversaciones de servicio/mes). El admin de la entidad debe
            registrar y aprobar las plantillas <code className="text-slate-400">pqrsd_radicado</code>,{" "}
            <code className="text-slate-400">pqrsd_respondida</code> y{" "}
            <code className="text-slate-400">pqrsd_por_vencer</code> en su cuenta de Meta Business.
          </p>
        </div>
        <Field
          label="Phone Number ID"
          name="whatsappPhoneNumberId"
          value={f.whatsappPhoneNumberId!}
          onChange={set("whatsappPhoneNumberId")}
          placeholder="123456789012345"
          hint="ID del número emisor en Meta (no el número visible)."
        />
        <Field
          label="Número emisor (display)"
          name="whatsappFromPhone"
          value={f.whatsappFromPhone!}
          onChange={set("whatsappFromPhone")}
          placeholder="+57 300 123 4567"
          hint="Número visible del emisor (referencia)."
        />
        <div className="sm:col-span-2">
          <Field
            label="Access Token"
            name="whatsappAccessToken"
            type="password"
            value={f.whatsappAccessToken!}
            onChange={set("whatsappAccessToken")}
            placeholder="EAAG..."
            hint="Token de acceso permanente o de sistema. Se almacena cifrado."
          />
        </div>
        {isEdit && (
          <>
            <div className="sm:col-span-2">
              <p className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-2.5">
                ⚠ En modo edición, deja el token en blanco para conservar el actual.
                Para eliminar WhatsApp del tenant, borra el Phone Number ID.
              </p>
            </div>
            <div className="sm:col-span-2 border-t border-slate-800 pt-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Enviar mensaje de prueba</label>
              <div className="flex items-center gap-3">
                <input
                  type="tel"
                  value={waTestPhone}
                  onChange={(e) => setWaTestPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="flex-1 px-4 py-2.5 bg-[#0a0f1e] border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                />
                <button
                  type="button"
                  onClick={enviarPruebaWhatsApp}
                  disabled={waTestState.loading}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition whitespace-nowrap"
                >
                  {waTestState.loading ? "Enviando…" : "Enviar prueba"}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Usa la plantilla de prueba contra la config guardada. Guarda los cambios antes de probar credenciales nuevas.
              </p>
              {waTestState.msg && (
                <p className={`mt-2 text-xs rounded-lg px-3 py-2 ${waTestState.ok ? "text-emerald-400 bg-emerald-400/5 border border-emerald-400/20" : "text-red-400 bg-red-400/5 border border-red-400/20"}`}>
                  {waTestState.msg}
                </p>
              )}
            </div>
          </>
        )}
      </>)}

      {section("Integración SECOP II (consulta vía datos.gov.co)", <>
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Sincroniza (lectura) los procesos y contratos que la entidad ya tiene publicados en
            SECOP II, consultándolos desde el portal de datos abiertos del Estado. Requiere una
            <strong className="text-slate-400"> API Key de Socrata</strong> generada en{" "}
            <a
              href="https://www.datos.gov.co/profile/edit/developer_settings"
              target="_blank" rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              datos.gov.co → perfil → API Keys
            </a>. No publica en SECOP (eso es transaccional dentro de la plataforma).
          </p>
        </div>
        <Field
          label="API Key ID"
          name="secopClientId"
          value={f.secopClientId!}
          onChange={set("secopClientId")}
          placeholder="vrdnpg82f0o9qz8xrrctt5tw"
          hint="API Key ID de datos.gov.co (Socrata)."
        />
        <Field
          label="NIT de la entidad"
          name="secopNit"
          value={f.secopNit!}
          onChange={set("secopNit")}
          placeholder="815.000.290-6"
          hint="NIT con el que la entidad publica en SECOP (se filtran sus registros)."
        />
        <div className="sm:col-span-2">
          <Field
            label="API Key Secret"
            name="secopClientSecret"
            type="password"
            value={f.secopClientSecret!}
            onChange={set("secopClientSecret")}
            placeholder="••••••••"
            hint="API Key Secret de datos.gov.co. Se almacena cifrado."
          />
        </div>
        {isEdit && (
          <>
            <div className="sm:col-span-2">
              <p className="text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-2.5">
                ⚠ En modo edición, deja el API Key Secret en blanco para conservar el actual.
                Para eliminar la integración SECOP, borra el API Key ID.
              </p>
            </div>
            <div className="sm:col-span-2 border-t border-slate-800 pt-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Verificar conexión con SECOP II</label>
              <p className="text-xs text-slate-500 mb-3">
                Usa las credenciales ya guardadas (no las del formulario actual). Guarda primero si cambiaste el secreto.
              </p>
              <button
                type="button"
                onClick={verificarSecopConexion}
                disabled={secopTestState.loading}
                className="px-4 py-2.5 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition whitespace-nowrap"
              >
                {secopTestState.loading ? "Verificando…" : "Verificar conexión SECOP"}
              </button>
              {secopTestState.msg && (
                <p className={`mt-2 text-xs rounded-lg px-3 py-2 ${secopTestState.ok ? "text-emerald-400 bg-emerald-400/5 border border-emerald-400/20" : "text-red-400 bg-red-400/5 border border-red-400/20"}`}>
                  {secopTestState.msg}
                </p>
              )}
            </div>
          </>
        )}
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
