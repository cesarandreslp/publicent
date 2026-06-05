'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, FileText, ArrowRight, Plus, ExternalLink } from 'lucide-react'
import {
  TIPO_PROCESO_LABEL, ESTADO_PROCESO_LABEL, CALIFICACION_LABEL, SANCION_LABEL,
  semaforoDesdeVencimiento, SEMAFORO_CLASE, SEMAFORO_LABEL,
} from '@/lib/disc-labels'

interface Actuacion { id: string; tipo: string; descripcion: string; fecha: string; usuario: string }
interface Documento { id: string; nombre: string; tipo: string; url: string | null }
interface Proceso {
  id: string; numero: string; tipo: string; estado: string
  quejoso: string | null; anonima: boolean
  disciplinadoNombre: string; disciplinadoCargo: string; disciplinadoEntidad: string
  hechos: string; normaInfringida: string | null
  calificacionFalta: string | null; sancion: string | null; sancionDetalle: string | null
  fechaQueja: string; fechaVencimiento: string | null; instructor: string | null
  actuaciones: Actuacion[]; documentos: Documento[]
  tutelas: { id: string; numero: string; estado: string; accionante: string }[]
}

const TERMINALES = ['EJECUTORIADO', 'ARCHIVADO']
const TIPOS_DOC = ['QUEJA', 'PRUEBA', 'AUTO', 'FALLO', 'RECURSO', 'OTRO']

export default function DetalleProcesoClient({ proceso, siguientes }: { proceso: Proceso; siguientes: string[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  // Avanzar etapa
  const [avanzarOpen, setAvanzarOpen] = useState(false)
  const [nuevoEstado, setNuevoEstado] = useState(siguientes[0] ?? '')
  const [motivo, setMotivo] = useState('')

  // Actuación
  const [actOpen, setActOpen] = useState(false)
  const [actTipo, setActTipo] = useState('')
  const [actDesc, setActDesc] = useState('')

  // Documento
  const [docOpen, setDocOpen] = useState(false)
  const [docNombre, setDocNombre] = useState('')
  const [docTipo, setDocTipo] = useState('OTRO')
  const [docUrl, setDocUrl] = useState('')

  const sem = semaforoDesdeVencimiento(proceso.fechaVencimiento, TERMINALES.includes(proceso.estado))

  async function avanzar() {
    if (!nuevoEstado) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/disc/procesos/${proceso.id}/avanzar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevoEstado, motivoAvance: motivo || undefined }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Error al avanzar'); return }
      setAvanzarOpen(false); setMotivo('')
      router.refresh()
    } finally { setBusy(false) }
  }

  async function crearActuacion() {
    if (!actTipo.trim() || !actDesc.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/disc/procesos/${proceso.id}/actuaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: actTipo, descripcion: actDesc }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Error'); return }
      setActOpen(false); setActTipo(''); setActDesc('')
      router.refresh()
    } finally { setBusy(false) }
  }

  async function crearDocumento() {
    if (!docNombre.trim()) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/disc/procesos/${proceso.id}/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: docNombre, tipo: docTipo, url: docUrl || null }),
      })
      if (!res.ok) { const d = await res.json(); alert(d.error ?? 'Error'); return }
      setDocOpen(false); setDocNombre(''); setDocUrl(''); setDocTipo('OTRO')
      router.refresh()
    } finally { setBusy(false) }
  }

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/admin/disc" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{proceso.numero}</h1>
          <p className="text-slate-500 text-sm mt-1">{TIPO_PROCESO_LABEL[proceso.tipo] ?? proceso.tipo}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-medium">{ESTADO_PROCESO_LABEL[proceso.estado] ?? proceso.estado}</span>
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${SEMAFORO_CLASE[sem]}`}>{SEMAFORO_LABEL[sem]}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: datos */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800">Disciplinado</h2>
            <dl className="text-sm space-y-2">
              <div><dt className="text-slate-400 text-xs">Nombre</dt><dd className="text-slate-900">{proceso.disciplinadoNombre}</dd></div>
              <div><dt className="text-slate-400 text-xs">Cargo</dt><dd className="text-slate-700">{proceso.disciplinadoCargo}</dd></div>
              <div><dt className="text-slate-400 text-xs">Entidad</dt><dd className="text-slate-700">{proceso.disciplinadoEntidad}</dd></div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="font-semibold text-slate-800">Datos del proceso</h2>
            <dl className="text-sm space-y-2">
              <div><dt className="text-slate-400 text-xs">Quejoso</dt><dd className="text-slate-700">{proceso.anonima ? 'Anónimo' : (proceso.quejoso ?? '—')}</dd></div>
              <div><dt className="text-slate-400 text-xs">Fecha de queja</dt><dd className="text-slate-700">{fmt(proceso.fechaQueja)}</dd></div>
              <div><dt className="text-slate-400 text-xs">Vencimiento etapa</dt><dd className="text-slate-700">{proceso.fechaVencimiento ? fmt(proceso.fechaVencimiento) : '—'}</dd></div>
              <div><dt className="text-slate-400 text-xs">Instructor</dt><dd className="text-slate-700">{proceso.instructor ?? 'Sin asignar'}</dd></div>
              <div><dt className="text-slate-400 text-xs">Norma infringida</dt><dd className="text-slate-700">{proceso.normaInfringida ?? '—'}</dd></div>
              <div><dt className="text-slate-400 text-xs">Calificación</dt><dd className="text-slate-700">{proceso.calificacionFalta ? CALIFICACION_LABEL[proceso.calificacionFalta] : '—'}</dd></div>
              {proceso.sancion && <div><dt className="text-slate-400 text-xs">Sanción</dt><dd className="text-slate-700">{SANCION_LABEL[proceso.sancion]}{proceso.sancionDetalle ? ` — ${proceso.sancionDetalle}` : ''}</dd></div>}
            </dl>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
            <h2 className="font-semibold text-slate-800">Hechos</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{proceso.hechos}</p>
          </div>

          {proceso.tutelas.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
              <h2 className="font-semibold text-slate-800">Tutelas relacionadas</h2>
              {proceso.tutelas.map((t) => (
                <Link key={t.id} href={`/admin/disc/tutelas/${t.id}`} className="block text-sm text-blue-600 hover:underline">{t.numero} — {t.accionante}</Link>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha: acciones + timeline + docs */}
        <div className="space-y-6">
          {/* Avanzar */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Etapa procesal</h2>
            {siguientes.length === 0 ? (
              <p className="text-sm text-slate-400">El proceso está en un estado terminal.</p>
            ) : !avanzarOpen ? (
              <button onClick={() => setAvanzarOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                <ArrowRight className="w-4 h-4" /> Avanzar etapa
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nuevo estado</label>
                  <select value={nuevoEstado} onChange={(e) => setNuevoEstado(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                    {siguientes.map((s) => <option key={s} value={s}>{ESTADO_PROCESO_LABEL[s] ?? s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Motivo / observación (opcional)</label>
                  <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={avanzar} disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Confirmar</button>
                  <button onClick={() => setAvanzarOpen(false)} className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg text-sm">Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><Clock className="w-4 h-4" /> Actuaciones</h2>
              <button onClick={() => setActOpen(!actOpen)} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Registrar</button>
            </div>

            {actOpen && (
              <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
                <input value={actTipo} onChange={(e) => setActTipo(e.target.value)} placeholder="Tipo (ej: CITACION)" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm" />
                <textarea value={actDesc} onChange={(e) => setActDesc(e.target.value)} placeholder="Descripción" rows={2} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm" />
                <div className="flex gap-2">
                  <button onClick={crearActuacion} disabled={busy} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50">Guardar</button>
                  <button onClick={() => setActOpen(false)} className="px-3 py-1.5 text-slate-600 text-xs">Cancelar</button>
                </div>
              </div>
            )}

            <ol className="relative border-l border-slate-200 ml-2 space-y-4">
              {proceso.actuaciones.map((a) => (
                <li key={a.id} className="ml-4">
                  <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5px] mt-1.5" />
                  <p className="text-sm font-medium text-slate-800">{ESTADO_PROCESO_LABEL[a.tipo] ?? a.tipo}</p>
                  <p className="text-xs text-slate-600">{a.descripcion}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmt(a.fecha)} · {a.usuario}</p>
                </li>
              ))}
              {proceso.actuaciones.length === 0 && <li className="ml-4 text-sm text-slate-400">Sin actuaciones.</li>}
            </ol>
          </div>

          {/* Documentos */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2"><FileText className="w-4 h-4" /> Documentos</h2>
              <button onClick={() => setDocOpen(!docOpen)} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Adjuntar</button>
            </div>

            {docOpen && (
              <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg">
                <input value={docNombre} onChange={(e) => setDocNombre(e.target.value)} placeholder="Nombre del documento" className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm" />
                <div className="flex gap-2">
                  <select value={docTipo} onChange={(e) => setDocTipo(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm">
                    {TIPOS_DOC.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="URL (opcional)" className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={crearDocumento} disabled={busy} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium disabled:opacity-50">Guardar</button>
                  <button onClick={() => setDocOpen(false)} className="px-3 py-1.5 text-slate-600 text-xs">Cancelar</button>
                </div>
              </div>
            )}

            <ul className="space-y-2">
              {proceso.documentos.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700"><span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 mr-2">{d.tipo}</span>{d.nombre}</span>
                  {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs"><ExternalLink className="w-3 h-3" /> Abrir</a>}
                </li>
              ))}
              {proceso.documentos.length === 0 && <li className="text-sm text-slate-400">Sin documentos.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
