'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Visita {
  id: string; numero: string; entidadVisitada: string; dependencia: string | null
  fecha: string; objetivo: string; hallazgos: string
  recomendaciones: string | null; compromisos: string | null
  fechaSeguimiento: string | null; estadoSeguimiento: string | null; funcionario: string | null
}

const SEGUIMIENTO = ['PENDIENTE', 'EN_PROCESO', 'CUMPLIDO']

export default function DetalleVisitaClient({ visita }: { visita: Visita }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({
    hallazgos: visita.hallazgos,
    recomendaciones: visita.recomendaciones ?? '',
    compromisos: visita.compromisos ?? '',
    fechaSeguimiento: visita.fechaSeguimiento ? visita.fechaSeguimiento.slice(0, 10) : '',
    estadoSeguimiento: visita.estadoSeguimiento ?? '',
  })

  async function guardar() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/disc/visitas/${visita.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hallazgos: f.hallazgos,
          recomendaciones: f.recomendaciones || null,
          compromisos: f.compromisos || null,
          fechaSeguimiento: f.fechaSeguimiento ? new Date(f.fechaSeguimiento).toISOString() : null,
          estadoSeguimiento: f.estadoSeguimiento || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Error'); return }
      router.refresh()
      alert('Visita actualizada.')
    } finally { setBusy(false) }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/admin/disc" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Volver</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{visita.numero}</h1>
        <p className="text-slate-500 text-sm mt-1">{visita.entidadVisitada}{visita.dependencia ? ` — ${visita.dependencia}` : ''}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 text-sm">
        <div><span className="text-slate-400 text-xs">Fecha:</span> <span className="text-slate-700">{new Date(visita.fecha).toLocaleDateString('es-CO')}</span></div>
        <div><span className="text-slate-400 text-xs">Funcionario:</span> <span className="text-slate-700">{visita.funcionario ?? '—'}</span></div>
        <div><span className="text-slate-400 text-xs">Objetivo:</span> <span className="text-slate-700">{visita.objetivo}</span></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Hallazgos y seguimiento</h2>
        <div><label className={labelCls}>Hallazgos</label><textarea value={f.hallazgos} onChange={(e) => setF((p) => ({ ...p, hallazgos: e.target.value }))} rows={3} className={inputCls} /></div>
        <div><label className={labelCls}>Recomendaciones</label><textarea value={f.recomendaciones} onChange={(e) => setF((p) => ({ ...p, recomendaciones: e.target.value }))} rows={2} className={inputCls} /></div>
        <div><label className={labelCls}>Compromisos</label><textarea value={f.compromisos} onChange={(e) => setF((p) => ({ ...p, compromisos: e.target.value }))} rows={2} className={inputCls} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelCls}>Fecha de seguimiento</label><input type="date" value={f.fechaSeguimiento} onChange={(e) => setF((p) => ({ ...p, fechaSeguimiento: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Estado del seguimiento</label>
            <select value={f.estadoSeguimiento} onChange={(e) => setF((p) => ({ ...p, estadoSeguimiento: e.target.value }))} className={inputCls}>
              <option value="">—</option>
              {SEGUIMIENTO.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={guardar} disabled={busy} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </div>
    </div>
  )
}
