"use client"

import { useEffect, useState } from "react"

type Usuario = {
  id: string; email: string; nombre: string; apellido: string
  cargo: string | null; activo: boolean; rol: { nombre: string } | null
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"]

export default function TenantUsuarios({ tenantId }: { tenantId: string }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)
  const [cred, setCred] = useState<{ email: string; password: string } | null>(null)
  const [form, setForm] = useState({ email: "", nombre: "", apellido: "", cargo: "", rolNombre: "SUPER_ADMIN" })

  async function cargar() {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/usuarios`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      setUsuarios(data.usuarios ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar usuarios")
    } finally { setLoading(false) }
  }
  useEffect(() => { cargar() }, [tenantId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function crear() {
    setCreando(true); setError(null); setCred(null)
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/usuarios`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      if (data.passwordGenerada) setCred({ email: data.usuario.email, password: data.passwordGenerada })
      setForm({ email: "", nombre: "", apellido: "", cargo: "", rolNombre: "SUPER_ADMIN" })
      await cargar()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear")
    } finally { setCreando(false) }
  }

  async function resetear(u: Usuario) {
    setError(null); setCred(null)
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenantId}/usuarios/${u.id}/reset`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      setCred({ email: u.email, password: data.password })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al restablecer")
    }
  }

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      {cred && (
        <div className="text-sm bg-green-950/30 border border-green-700/40 rounded-lg px-4 py-3">
          <p className="text-green-400 font-medium">Credenciales (anótalas, no se vuelven a mostrar):</p>
          <p className="text-slate-300 mt-1 font-mono text-xs">Usuario: {cred.email}</p>
          <p className="text-slate-300 font-mono text-xs">Contraseña: <span className="text-white">{cred.password}</span></p>
        </div>
      )}
      {error && <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-2">{error}</div>}

      {/* Lista */}
      {loading ? (
        <p className="text-sm text-slate-500">Cargando usuarios…</p>
      ) : usuarios.length === 0 ? (
        <p className="text-sm text-slate-500">Sin usuarios. Crea el administrador inicial abajo.</p>
      ) : (
        <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
          {usuarios.map((u) => (
            <div key={u.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="text-slate-200 truncate">{u.nombre} {u.apellido}
                  <span className="ml-2 text-[10px] uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{u.rol?.nombre ?? "—"}</span>
                  {!u.activo && <span className="ml-1 text-[10px] text-red-400">inactivo</span>}
                </p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
              <button onClick={() => resetear(u)} className="shrink-0 text-xs px-3 py-1.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800">
                Resetear contraseña
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Crear */}
      <div className="border-t border-slate-800 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Crear usuario</p>
        <div className="grid sm:grid-cols-2 gap-2">
          <input value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="email@entidad.gov.co" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
          <select value={form.rolNombre} onChange={(e) => set("rolNombre")(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} placeholder="Nombre" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
          <input value={form.apellido} onChange={(e) => set("apellido")(e.target.value)} placeholder="Apellido" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
        </div>
        <button onClick={crear} disabled={creando || !form.email || !form.nombre}
          className="mt-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm rounded-xl">
          {creando ? "Creando…" : "Crear usuario"}
        </button>
        <p className="text-[11px] text-slate-600 mt-1">La contraseña se genera automáticamente y se muestra una sola vez.</p>
      </div>
    </div>
  )
}
