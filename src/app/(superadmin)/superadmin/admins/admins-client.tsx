"use client"

import { useState } from "react"

type Admin = { id: string; email: string; nombre: string; activo: boolean; createdAt: string }

export default function AdminsClient({ inicial }: { inicial: Admin[] }) {
  const [admins, setAdmins] = useState<Admin[]>(inicial)
  const [form, setForm] = useState({ nombre: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function crear() {
    setLoading(true); setError(null)
    try {
      const res = await fetch("/api/superadmin/admins", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Error")
      setAdmins((p) => [...p, data.admin])
      setForm({ nombre: "", email: "", password: "" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear")
    } finally { setLoading(false) }
  }

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="mt-6 space-y-5">
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#111827] divide-y divide-slate-800">
        {admins.map((a) => (
          <div key={a.id} className="px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <p className="text-slate-200">{a.nombre}</p>
              <p className="text-xs text-slate-500">{a.email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${a.activo ? "bg-emerald-900/50 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
              {a.activo ? "activo" : "inactivo"}
            </span>
          </div>
        ))}
      </div>

      <div className="border border-slate-800 rounded-2xl bg-[#111827] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Nuevo superadmin</p>
        {error && <div className="text-sm text-red-300 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2 mb-3">{error}</div>}
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} placeholder="Nombre" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
          <input value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="email@ossinnovation.com" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
          <input value={form.password} onChange={(e) => set("password")(e.target.value)} type="password" placeholder="Contraseña (mín. 8)" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600" />
        </div>
        <button onClick={crear} disabled={loading || !form.nombre || !form.email || !form.password}
          className="mt-3 px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm rounded-xl">
          {loading ? "Creando…" : "Crear superadmin"}
        </button>
      </div>
    </div>
  )
}
