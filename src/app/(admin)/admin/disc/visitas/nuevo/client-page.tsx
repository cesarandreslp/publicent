'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NuevaVisitaClient({ usuarios }: { usuarios: { id: string; nombre: string }[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [f, setF] = useState({
    entidadVisitada: '', dependencia: '',
    fecha: new Date().toISOString().slice(0, 10),
    objetivo: '', hallazgos: '', recomendaciones: '', compromisos: '',
    fechaSeguimiento: '', funcionarioId: '',
  })

  function set<K extends keyof typeof f>(k: K) {
    return (v: string) => setF((p) => ({ ...p, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/disc/visitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entidadVisitada: f.entidadVisitada,
          dependencia: f.dependencia || null,
          fecha: new Date(f.fecha).toISOString(),
          objetivo: f.objetivo,
          hallazgos: f.hallazgos,
          recomendaciones: f.recomendaciones || null,
          compromisos: f.compromisos || null,
          fechaSeguimiento: f.fechaSeguimiento ? new Date(f.fechaSeguimiento).toISOString() : null,
          funcionarioId: f.funcionarioId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al crear la visita'); return }
      router.push(`/admin/disc/visitas/${data.id}`)
      router.refresh()
    } catch { setError('Error de red.') } finally { setLoading(false) }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/admin/disc" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Volver</Link>
      <h1 className="text-2xl font-bold text-slate-900">Registrar visita preventiva</h1>
      <form onSubmit={submit} className="space-y-5 bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelCls}>Entidad visitada *</label><input value={f.entidadVisitada} onChange={(e) => set('entidadVisitada')(e.target.value)} required className={inputCls} /></div>
          <div><label className={labelCls}>Dependencia</label><input value={f.dependencia} onChange={(e) => set('dependencia')(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Fecha *</label><input type="date" value={f.fecha} onChange={(e) => set('fecha')(e.target.value)} required className={inputCls} /></div>
          <div><label className={labelCls}>Funcionario</label>
            <select value={f.funcionarioId} onChange={(e) => set('funcionarioId')(e.target.value)} className={inputCls}>
              <option value="">Yo mismo</option>
              {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
        </div>
        <div><label className={labelCls}>Objetivo *</label><textarea value={f.objetivo} onChange={(e) => set('objetivo')(e.target.value)} required rows={2} className={inputCls} /></div>
        <div><label className={labelCls}>Hallazgos *</label><textarea value={f.hallazgos} onChange={(e) => set('hallazgos')(e.target.value)} required rows={3} className={inputCls} /></div>
        <div><label className={labelCls}>Recomendaciones</label><textarea value={f.recomendaciones} onChange={(e) => set('recomendaciones')(e.target.value)} rows={2} className={inputCls} /></div>
        <div><label className={labelCls}>Compromisos</label><textarea value={f.compromisos} onChange={(e) => set('compromisos')(e.target.value)} rows={2} className={inputCls} /></div>
        <div className="sm:w-1/2"><label className={labelCls}>Fecha de seguimiento</label><input type="date" value={f.fechaSeguimiento} onChange={(e) => set('fechaSeguimiento')(e.target.value)} className={inputCls} /></div>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/disc" className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancelar</Link>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creando…' : 'Registrar visita'}</button>
        </div>
      </form>
    </div>
  )
}
