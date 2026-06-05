'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scale, FileWarning, ClipboardCheck, AlertTriangle, Plus, Search } from 'lucide-react'
import {
  TIPO_PROCESO_LABEL, ESTADO_PROCESO_LABEL, ESTADO_TUTELA_LABEL,
  semaforoDesdeVencimiento, SEMAFORO_CLASE, SEMAFORO_LABEL,
} from '@/lib/disc-labels'

interface ProcesoRow {
  id: string; numero: string; tipo: string; estado: string
  disciplinadoNombre: string; disciplinadoCargo: string
  instructor: string | null; fechaVencimiento: string | null; actuaciones: number
}
interface TutelaRow {
  id: string; numero: string; accionante: string; accionado: string
  derechoVulnerado: string; estado: string; fechaVencimiento: string | null; funcionario: string | null
}
interface VisitaRow {
  id: string; numero: string; entidadVisitada: string; fecha: string
  objetivo: string; estadoSeguimiento: string | null; funcionario: string | null
}

interface Props {
  procesos: ProcesoRow[]
  tutelas: TutelaRow[]
  visitas: VisitaRow[]
  kpis: { total: number; abiertos: number; vencidos: number; tutelasActivas: number; visitas: number }
}

type Tab = 'procesos' | 'tutelas' | 'visitas'

const TERMINALES = ['EJECUTORIADO', 'ARCHIVADO']

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value.toLocaleString('es-CO')}</p>
      </div>
    </div>
  )
}

export default function DiscClient({ procesos, tutelas, visitas, kpis }: Props) {
  const [tab, setTab] = useState<Tab>('procesos')
  const [q, setQ] = useState('')

  const filtro = (texto: string) => texto.toLowerCase().includes(q.toLowerCase())

  const procesosF = procesos.filter((p) => !q || filtro(p.numero) || filtro(p.disciplinadoNombre))
  const tutelasF = tutelas.filter((t) => !q || filtro(t.numero) || filtro(t.accionante) || filtro(t.accionado))
  const visitasF = visitas.filter((v) => !q || filtro(v.numero) || filtro(v.entidadVisitada))

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'procesos', label: 'Procesos', count: procesos.length },
    { id: 'tutelas', label: 'Tutelas', count: tutelas.length },
    { id: 'visitas', label: 'Visitas', count: visitas.length },
  ]

  const nuevoHref = `/admin/disc/${tab}/nuevo`
  const nuevoLabel = tab === 'procesos' ? 'Nuevo proceso' : tab === 'tutelas' ? 'Nueva tutela' : 'Nueva visita'

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Función disciplinaria</h1>
        <p className="text-slate-500 text-sm mt-1">Procesos disciplinarios, tutelas y visitas preventivas (Ley 1952/2019)</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={<Scale className="w-5 h-5 text-blue-600" />} label="Procesos abiertos" value={kpis.abiertos} color="bg-blue-50" />
        <Kpi icon={<AlertTriangle className="w-5 h-5 text-red-600" />} label="Procesos vencidos" value={kpis.vencidos} color="bg-red-50" />
        <Kpi icon={<FileWarning className="w-5 h-5 text-purple-600" />} label="Tutelas activas" value={kpis.tutelasActivas} color="bg-purple-50" />
        <Kpi icon={<ClipboardCheck className="w-5 h-5 text-emerald-600" />} label="Visitas registradas" value={kpis.visitas} color="bg-emerald-50" />
      </div>

      {/* Tabs + acciones */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label} <span className="text-xs text-slate-400">({t.count})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar…"
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <Link href={nuevoHref} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> {nuevoLabel}
          </Link>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {tab === 'procesos' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Disciplinado</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Términos</th>
                <th className="px-4 py-3 font-medium">Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procesosF.map((p) => {
                const sem = semaforoDesdeVencimiento(p.fechaVencimiento, TERMINALES.includes(p.estado))
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/disc/procesos/${p.id}`} className="text-blue-600 font-medium hover:underline">{p.numero}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900">{p.disciplinadoNombre}</p>
                      <p className="text-xs text-slate-400">{p.disciplinadoCargo}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{TIPO_PROCESO_LABEL[p.tipo] ?? p.tipo}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{ESTADO_PROCESO_LABEL[p.estado] ?? p.estado}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${SEMAFORO_CLASE[sem]}`}>{SEMAFORO_LABEL[sem]}</span></td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.instructor ?? '—'}</td>
                  </tr>
                )
              })}
              {procesosF.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sin procesos.</td></tr>}
            </tbody>
          </table>
        )}

        {tab === 'tutelas' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Accionante</th>
                <th className="px-4 py-3 font-medium">Accionado</th>
                <th className="px-4 py-3 font-medium">Derecho</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Términos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tutelasF.map((t) => {
                const terminal = ['EJECUTORIADA', 'CUMPLIDA', 'CERRADA'].includes(t.estado)
                const sem = semaforoDesdeVencimiento(t.fechaVencimiento, terminal)
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/disc/tutelas/${t.id}`} className="text-blue-600 font-medium hover:underline">{t.numero}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900">{t.accionante}</td>
                    <td className="px-4 py-3 text-slate-600">{t.accionado}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[200px] truncate">{t.derechoVulnerado}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{ESTADO_TUTELA_LABEL[t.estado] ?? t.estado}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${SEMAFORO_CLASE[sem]}`}>{SEMAFORO_LABEL[sem]}</span></td>
                  </tr>
                )
              })}
              {tutelasF.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sin tutelas.</td></tr>}
            </tbody>
          </table>
        )}

        {tab === 'visitas' && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Entidad visitada</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Objetivo</th>
                <th className="px-4 py-3 font-medium">Seguimiento</th>
                <th className="px-4 py-3 font-medium">Funcionario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visitasF.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/disc/visitas/${v.id}`} className="text-blue-600 font-medium hover:underline">{v.numero}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-900">{v.entidadVisitada}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{new Date(v.fecha).toLocaleDateString('es-CO')}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs max-w-[220px] truncate">{v.objetivo}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{v.estadoSeguimiento ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{v.funcionario ?? '—'}</td>
                </tr>
              ))}
              {visitasF.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sin visitas.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
