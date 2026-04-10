"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TenantActions({
  tenantId,
  tenantName,
  activo,
  suspendido,
}: {
  tenantId: string
  tenantName: string
  activo: boolean
  suspendido: boolean
}) {
  const router  = useRouter()
  const [open,  setOpen]  = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggleSuspend() {
    setLoading(true)
    await fetch(`/api/superadmin/tenants/${tenantId}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ suspendido: !suspendido, activo: suspendido }),
    })
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function deleteTenant() {
    if (!confirm(`¿Seguro que deseas desactivar "${tenantName}"? Esta acción suspende la entidad.`)) return
    setLoading(true)
    await fetch(`/api/superadmin/tenants/${tenantId}`, { method: "DELETE" })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
        title="Más acciones"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-[#1f2937] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
            <button
              onClick={toggleSuspend}
              className={`w-full text-left px-4 py-2.5 text-sm transition ${
                suspendido
                  ? "text-emerald-400 hover:bg-emerald-400/10"
                  : "text-amber-400 hover:bg-amber-400/10"
              }`}
            >
              {suspendido ? "✅ Reactivar" : "⏸ Suspender"}
            </button>
            <hr className="border-slate-700 my-1" />
            <button
              onClick={deleteTenant}
              className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition"
            >
              🗑 Desactivar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
