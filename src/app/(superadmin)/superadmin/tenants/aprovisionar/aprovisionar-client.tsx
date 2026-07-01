"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type ModuloItem = { id: string; nombre: string; categoria: string; obligatorio: boolean }

type Resultado = {
  tenantId: string
  dominioPrincipal: string
  adminEmail: string
  adminPassword: string
  databaseName: string
  projectId: string
  modulosActivos: string[]
}

const TIPOS = ["PERSONERIA", "CONTRALORIA", "ALCALDIA", "CONCEJO", "GOBERNACION", "ASAMBLEA", "MINISTERIO", "AGENCIA", "OTRO"]

function Campo({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}{required && <span className="text-red-400"> *</span>}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-blue-500 outline-none"
      />
    </label>
  )
}

export default function AprovisionarClient({ modulos }: { modulos: ModuloItem[] }) {
  const router = useRouter()
  const [f, setF] = useState({
    slug: "", codigo: "", nombre: "", nombreCorto: "", tipoEntidad: "PERSONERIA", nit: "",
    municipio: "", departamento: "", slogan: "", dominioPrincipal: "", plan: "ENTERPRISE",
    direccion: "", ciudad: "", telefono: "", email: "", horario: "",
    adminEmail: "", adminNombre: "", adminApellido: "", adminCargo: "",
  })
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Resultado | null>(null)

  const set = (k: keyof typeof f) => (v: string) => setF((p) => ({ ...p, [k]: v }))
  const toggleMod = (id: string) =>
    setSeleccion((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const opcionales = modulos.filter((m) => !m.obligatorio)

  async function aprovisionar() {
    setLoading(true); setError(null); setResult(null)
    try {
      const res = await fetch("/api/superadmin/tenants/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entidad: {
            slug: f.slug, codigo: f.codigo, nombre: f.nombre, nombreCorto: f.nombreCorto || undefined,
            tipoEntidad: f.tipoEntidad, nit: f.nit || undefined, municipio: f.municipio || undefined,
            departamento: f.departamento || undefined, slogan: f.slogan || undefined,
          },
          dominioPrincipal: f.dominioPrincipal,
          plan: f.plan,
          contacto: {
            direccion: f.direccion, ciudad: f.ciudad, telefono: f.telefono,
            email: f.email, horario: f.horario || undefined,
          },
          admin: {
            email: f.adminEmail, nombre: f.adminNombre, apellido: f.adminApellido,
            cargo: f.adminCargo || undefined,
          },
          modulos: [...seleccion],
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Error al aprovisionar"); return }
      setResult(data as Resultado)
    } catch {
      setError("Error de red. El aprovisionamiento puede tardar; revisa la lista de tenants antes de reintentar.")
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="border border-green-700/40 bg-green-950/20 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-semibold text-green-400">✅ Tenant aprovisionado</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-sm">
          <Dato k="Entidad" v={f.nombre} />
          <Dato k="Dominio" v={result.dominioPrincipal} />
          <Dato k="Base de datos" v={result.databaseName} />
          <Dato k="Proyecto Neon" v={result.projectId} />
          <Dato k="Admin" v={result.adminEmail} />
          <Dato k="Contraseña" v={result.adminPassword} />
          <Dato k="Módulos" v={result.modulosActivos.join(", ") || "(solo obligatorios)"} />
        </div>
        <div className="text-xs text-amber-400/90 bg-amber-400/5 border border-amber-400/20 rounded-lg px-4 py-3 leading-relaxed">
          ⚠ Anota la contraseña ahora (no se vuelve a mostrar). Siguientes pasos:
          <br />1) Agrega el dominio <strong>{result.dominioPrincipal}</strong> en Vercel → Domains.
          <br />2) Entra con el admin y cambia la contraseña.
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => router.push("/superadmin/tenants")} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-xl">Ir a Tenants</button>
          <button onClick={() => { setResult(null); setSeleccion(new Set()) }} className="px-4 py-2 border border-slate-700 text-slate-300 text-sm rounded-xl hover:bg-slate-800">Crear otro</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Seccion titulo="Entidad">
        <Campo label="Slug (subdominio)" value={f.slug} onChange={set("slug")} placeholder="personeria-tulua" required />
        <Campo label="Código DIVIPOLA+consec." value={f.codigo} onChange={set("codigo")} placeholder="76834-001" required />
        <Campo label="Nombre completo" value={f.nombre} onChange={set("nombre")} placeholder="Personería Municipal de Tuluá" required />
        <Campo label="Nombre corto" value={f.nombreCorto} onChange={set("nombreCorto")} placeholder="Personería de Tuluá" />
        <label className="block">
          <span className="text-xs text-slate-400">Tipo de entidad</span>
          <select value={f.tipoEntidad} onChange={(e) => set("tipoEntidad")(e.target.value)}
            className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <Campo label="NIT" value={f.nit} onChange={set("nit")} placeholder="800.000.000-0" />
        <Campo label="Municipio" value={f.municipio} onChange={set("municipio")} placeholder="Tuluá" />
        <Campo label="Departamento" value={f.departamento} onChange={set("departamento")} placeholder="Valle del Cauca" />
        <Campo label="Slogan" value={f.slogan} onChange={set("slogan")} placeholder="Defensores de los derechos ciudadanos" />
      </Seccion>

      <Seccion titulo="Dominio y plan">
        <Campo label="Dominio principal" value={f.dominioPrincipal} onChange={set("dominioPrincipal")} placeholder="personeria-tulua.vercel.app" required />
        <label className="block">
          <span className="text-xs text-slate-400">Plan (referencia)</span>
          <select value={f.plan} onChange={(e) => set("plan")(e.target.value)}
            className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
            {["BASICO", "ESTANDAR", "PROFESIONAL", "ENTERPRISE"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
      </Seccion>

      <Seccion titulo="Contacto">
        <Campo label="Dirección" value={f.direccion} onChange={set("direccion")} placeholder="Calle 25 # 25-04" />
        <Campo label="Ciudad" value={f.ciudad} onChange={set("ciudad")} placeholder="Tuluá, Valle del Cauca" />
        <Campo label="Teléfono" value={f.telefono} onChange={set("telefono")} placeholder="(602) 000 0000" />
        <Campo label="Email de contacto" value={f.email} onChange={set("email")} type="email" placeholder="contacto@entidad.gov.co" required />
        <Campo label="Horario" value={f.horario} onChange={set("horario")} placeholder="L-V 8:00 a.m. - 6:00 p.m." />
      </Seccion>

      <Seccion titulo="Administrador inicial">
        <Campo label="Email del admin" value={f.adminEmail} onChange={set("adminEmail")} type="email" placeholder="admin@entidad.gov.co" required />
        <Campo label="Nombre" value={f.adminNombre} onChange={set("adminNombre")} placeholder="Nombre" required />
        <Campo label="Apellido" value={f.adminApellido} onChange={set("adminApellido")} placeholder="Apellido" />
        <Campo label="Cargo" value={f.adminCargo} onChange={set("adminCargo")} placeholder="Administrador del Sistema" />
        <p className="text-xs text-slate-500 sm:col-span-3">La contraseña se genera automáticamente y se muestra una sola vez al terminar.</p>
      </Seccion>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Módulos contratados</h3>
        <p className="text-xs text-slate-600 mb-3">Marca exactamente lo que dice el contrato. Los obligatorios se activan siempre.</p>
        <div className="grid sm:grid-cols-2 gap-1.5">
          {opcionales.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 cursor-pointer hover:border-slate-600">
              <input type="checkbox" checked={seleccion.has(m.id)} onChange={() => toggleMod(m.id)} className="accent-blue-600" />
              {m.nombre}
            </label>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3">{error}</div>}

      <div className="flex items-center gap-3">
        <button onClick={aprovisionar} disabled={loading}
          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition">
          {loading ? "Aprovisionando… (puede tardar ~30-60s)" : "Aprovisionar tenant"}
        </button>
        {loading && <span className="text-xs text-slate-500">Creando BD en Neon, esquema y datos… no cierres la página.</span>}
      </div>
      <p className="text-[11px] text-slate-600">
        Nota: en Vercel Hobby (límite 60s) los tenants con módulos fiscales pesados (contabilidad/presupuesto)
        pueden exceder el tiempo; para esos usa el CLI <code>npm run provision-tenant</code>.
      </p>
    </div>
  )
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">{titulo}</h3>
      <div className="grid sm:grid-cols-3 gap-3">{children}</div>
    </div>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase text-slate-500">{k}</div>
      <div className="text-white break-all font-mono text-xs mt-0.5">{v}</div>
    </div>
  )
}
