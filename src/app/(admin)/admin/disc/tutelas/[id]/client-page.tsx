'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ESTADO_TUTELA_LABEL } from '@/lib/disc-labels'

interface Tutela {
  id: string; numero: string; accionante: string; accionado: string
  derechoVulnerado: string; juzgado: string | null; estado: string
  fechaRecepcion: string; fechaVencimiento: string | null; fechaFallo: string | null
  falloSentido: string | null; impugnada: boolean; estadoCumplimiento: string | null
  observaciones: string | null; funcionario: string | null
  proceso: { id: string; numero: string } | null
}

const CUMPLIMIENTO = ['PENDIENTE', 'EN_CUMPLIMIENTO', 'CUMPLIDA', 'INCUMPLIDA']
const FALLO = ['CONCEDIDA', 'IMPUGNADA', 'NEGADA']

export default function DetalleTutelaClient({ tutela }: { tutela: Tutela }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [f, setF] = useState({
    estado: tutela.estado,
    juzgado: tutela.juzgado ?? '',
    fechaFallo: tutela.fechaFallo ? tutela.fechaFallo.slice(0, 10) : '',
    falloSentido: tutela.falloSentido ?? '',
    impugnada: tutela.impugnada,
    estadoCumplimiento: tutela.estadoCumplimiento ?? '',
    observaciones: tutela.observaciones ?? '',
  })

  async function guardar() {
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/disc/tutelas/${tutela.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: f.estado,
          juzgado: f.juzgado || null,
          fechaFallo: f.fechaFallo ? new Date(f.fechaFallo).toISOString() : null,
          falloSentido: f.falloSentido || null,
          impugnada: f.impugnada,
          estadoCumplimiento: f.estadoCumplimiento || null,
          observaciones: f.observaciones || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Error'); return }
      router.refresh()
      alert('Tutela actualizada.')
    } finally { setBusy(false) }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1'
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('es-CO')

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/admin/disc" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="w-4 h-4" /> Volver</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{tutela.numero}</h1>
        <p className="text-slate-500 text-sm mt-1">{tutela.accionante} <span className="text-slate-300">vs</span> {tutela.accionado}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 text-sm">
        <div><span className="text-slate-400 text-xs">Derecho vulnerado:</span> <span className="text-slate-700">{tutela.derechoVulnerado}</span></div>
        <div><span className="text-slate-400 text-xs">Recibida:</span> <span className="text-slate-700">{fmt(tutela.fechaRecepcion)}</span></div>
        {tutela.fechaVencimiento && <div><span className="text-slate-400 text-xs">Vence:</span> <span className="text-slate-700">{fmt(tutela.fechaVencimiento)}</span></div>}
        <div><span className="text-slate-400 text-xs">Funcionario:</span> <span className="text-slate-700">{tutela.funcionario ?? '—'}</span></div>
        {tutela.proceso && <div><span className="text-slate-400 text-xs">Proceso relacionado:</span> <Link href={`/admin/disc/procesos/${tutela.proceso.id}`} className="text-blue-600 hover:underline">{tutela.proceso.numero}</Link></div>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-semibold text-slate-800">Actualizar trámite</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelCls}>Estado</label>
            <select value={f.estado} onChange={(e) => setF((p) => ({ ...p, estado: e.target.value }))} className={inputCls}>
              {Object.entries(ESTADO_TUTELA_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Juzgado</label><input value={f.juzgado} onChange={(e) => setF((p) => ({ ...p, juzgado: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Fecha del fallo</label><input type="date" value={f.fechaFallo} onChange={(e) => setF((p) => ({ ...p, fechaFallo: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Sentido del fallo</label>
            <select value={f.falloSentido} onChange={(e) => setF((p) => ({ ...p, falloSentido: e.target.value }))} className={inputCls}>
              <option value="">—</option>
              {FALLO.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Estado de cumplimiento</label>
            <select value={f.estadoCumplimiento} onChange={(e) => setF((p) => ({ ...p, estadoCumplimiento: e.target.value }))} className={inputCls}>
              <option value="">—</option>
              {CUMPLIMIENTO.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input id="imp" type="checkbox" checked={f.impugnada} onChange={(e) => setF((p) => ({ ...p, impugnada: e.target.checked }))} className="w-4 h-4 rounded" />
            <label htmlFor="imp" className="text-sm text-slate-700">Fallo impugnado</label>
          </div>
        </div>
        <div><label className={labelCls}>Observaciones</label><textarea value={f.observaciones} onChange={(e) => setF((p) => ({ ...p, observaciones: e.target.value }))} rows={3} className={inputCls} /></div>
        <div className="flex justify-end">
          <button onClick={guardar} disabled={busy} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </div>
    </div>
  )
}
