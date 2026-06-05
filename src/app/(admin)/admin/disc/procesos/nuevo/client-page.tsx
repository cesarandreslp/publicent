'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TIPO_PROCESO_LABEL, CALIFICACION_LABEL } from '@/lib/disc-labels'

interface Props {
  usuarios: { id: string; nombre: string }[]
}

export default function NuevoProcesoClient({ usuarios }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [anonima, setAnonima] = useState(false)
  const [f, setF] = useState({
    tipo: 'DISCIPLINARIO_ORDINARIO',
    quejoso: '',
    disciplinadoNombre: '',
    disciplinadoCargo: '',
    disciplinadoEntidad: '',
    hechos: '',
    normaInfringida: '',
    calificacionFalta: '',
    fechaQueja: new Date().toISOString().slice(0, 10),
    instructorId: '',
  })

  function set<K extends keyof typeof f>(k: K) {
    return (v: string) => setF((p) => ({ ...p, [k]: v }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/disc/procesos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: f.tipo,
          anonima,
          quejoso: anonima ? null : (f.quejoso || null),
          disciplinadoNombre: f.disciplinadoNombre,
          disciplinadoCargo: f.disciplinadoCargo,
          disciplinadoEntidad: f.disciplinadoEntidad,
          hechos: f.hechos,
          normaInfringida: f.normaInfringida || null,
          calificacionFalta: f.calificacionFalta || null,
          fechaQueja: new Date(f.fechaQueja).toISOString(),
          instructorId: f.instructorId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al crear el proceso')
        return
      }
      router.push(`/admin/disc/procesos/${data.id}`)
      router.refresh()
    } catch {
      setError('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/admin/disc" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Apertura de proceso disciplinario</h1>

      <form onSubmit={submit} className="space-y-5 bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Tipo de proceso *</label>
            <select value={f.tipo} onChange={(e) => set('tipo')(e.target.value)} className={inputCls}>
              {Object.entries(TIPO_PROCESO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Fecha de la queja *</label>
            <input type="date" value={f.fechaQueja} onChange={(e) => set('fechaQueja')(e.target.value)} required className={inputCls} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="anon" type="checkbox" checked={anonima} onChange={(e) => setAnonima(e.target.checked)} className="w-4 h-4 rounded" />
          <label htmlFor="anon" className="text-sm text-slate-700">Queja anónima</label>
        </div>
        {!anonima && (
          <div>
            <label className={labelCls}>Quejoso</label>
            <input value={f.quejoso} onChange={(e) => set('quejoso')(e.target.value)} className={inputCls} placeholder="Nombre del quejoso" />
          </div>
        )}

        <div className="border-t border-slate-100 pt-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">Disciplinado (servidor investigado)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Nombre *</label>
              <input value={f.disciplinadoNombre} onChange={(e) => set('disciplinadoNombre')(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cargo *</label>
              <input value={f.disciplinadoCargo} onChange={(e) => set('disciplinadoCargo')(e.target.value)} required className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Entidad donde labora *</label>
              <input value={f.disciplinadoEntidad} onChange={(e) => set('disciplinadoEntidad')(e.target.value)} required className={inputCls} />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Hechos *</label>
          <textarea value={f.hechos} onChange={(e) => set('hechos')(e.target.value)} required rows={4} className={inputCls} placeholder="Descripción de los hechos que originan el proceso" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Norma presuntamente infringida</label>
            <input value={f.normaInfringida} onChange={(e) => set('normaInfringida')(e.target.value)} className={inputCls} placeholder="Ej: Art. 38 Ley 1952/2019" />
          </div>
          <div>
            <label className={labelCls}>Calificación provisional</label>
            <select value={f.calificacionFalta} onChange={(e) => set('calificacionFalta')(e.target.value)} className={inputCls}>
              <option value="">Sin calificar</option>
              {Object.entries(CALIFICACION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Funcionario instructor</label>
          <select value={f.instructorId} onChange={(e) => set('instructorId')(e.target.value)} className={inputCls}>
            <option value="">Sin asignar</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
          </select>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/admin/disc" className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Cancelar</Link>
          <button type="submit" disabled={loading} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creando…' : 'Abrir proceso'}
          </button>
        </div>
      </form>
    </div>
  )
}
