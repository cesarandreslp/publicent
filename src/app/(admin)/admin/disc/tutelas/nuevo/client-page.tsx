'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NuevaTutelaClient({ usuarios }: { usuarios: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [f, setF] = useState({
    accionante: '', accionado: '', derechoVulnerado: '', juzgado: '',
    fechaRecepcion: new Date().toISOString().slice(0, 10),
    fechaVencimiento: '', funcionarioId: '', observaciones: '',
  })

  function set<K extends keyof typeof f>(k: K) {
    return (v: string) => setF((p) => ({ ...p, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/disc/tutelas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accionante: f.accionante,
          accionado: f.accionado,
          derechoVulnerado: f.derechoVulnerado,
          juzgado: f.juzgado || null,
          fechaRecepcion: new Date(f.fechaRecepcion).toISOString(),
          fechaVencimiento: f.fechaVencimiento ? new Date(f.fechaVencimiento).toISOString() : null,
          funcionarioId: f.funcionarioId || null,
          observaciones: f.observaciones || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al crear la tutela'); return }
      router.push(`/admin/disc/tutelas/${data.id}`)
      router.refresh()
    } catch { setError('Error de red.') } finally { setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/admin/disc" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Volver</Link>
      <h1 className="text-2xl font-bold text-slate-900">Registrar tutela</h1>
      <form onSubmit={submit} className="space-y-5 bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelCls}>Accionante *</label><input value={f.accionante} onChange={(e) => set('accionante')(e.target.value)} required className={inputCls} /></div>
          <div><label className={labelCls}>Accionado *</label><input value={f.accionado} onChange={(e) => set('accionado')(e.target.value)} required className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Derecho fundamental vulnerado *</label><input value={f.derechoVulnerado} onChange={(e) => set('derechoVulnerado')(e.target.value)} required className={inputCls} placeholder="Ej: Derecho de petición, salud, debido proceso" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelCls}>Juzgado</label><input value={f.juzgado} onChange={(e) => set('juzgado')(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Funcionario asignado</label>
            <select value={f.funcionarioId} onChange={(e) => set('funcionarioId')(e.target.value)} className={inputCls}>
              <option value="">Sin asignar</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Fecha de recepción *</label><input type="date" value={f.fechaRecepcion} onChange={(e) => set('fechaRecepcion')(e.target.value)} required className={inputCls} /></div>
          <div><label className={labelCls}>Fecha límite de respuesta</label><input type="date" value={f.fechaVencimiento} onChange={(e) => set('fechaVencimiento')(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Observaciones</label><textarea value={f.observaciones} onChange={(e) => set('observaciones')(e.target.value)} rows={3} className={inputCls} /></div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/disc" className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancelar</Link>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creando…' : 'Registrar tutela'}</button>
        </div>
      </form>
    </div>
  )
}
