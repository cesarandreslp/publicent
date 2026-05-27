"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FileText, Download, Loader2, X, Trash2 } from "lucide-react"

type Periodo = { id: string; codigo: string; anio: number; mes: number; estado: string }
type Reporte = {
  id: string; tipo: string; vigencia: number | null; periodoContableId: string | null;
  totales: any; generadoEn: string; observacion: string | null;
}

const TIPOS_LABEL: Record<string, string> = {
  CHIP_BALANCE: "CHIP — Balance General",
  CHIP_ACTIVIDAD: "CHIP — Estado de Actividad",
  FUT_INGRESOS: "FUT — Ingresos",
  FUT_GASTOS: "FUT — Gastos (ejecución)",
  LEY_617: "Indicador Ley 617",
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

export default function ReportesControlClient({
  periodos, reportes, vigenciaActual,
}: { periodos: Periodo[]; reportes: Reporte[]; vigenciaActual: number }) {
  const router = useRouter()
  const [modal, setModal] = useState<null | string>(null)

  function totalResumen(r: Reporte): string {
    if (!r.totales) return "—"
    if (r.tipo === 'CHIP_BALANCE') return `A: ${fmt(r.totales.activo)} · P+P: ${fmt(r.totales.pasivoMasPatrimonio)}`
    if (r.tipo === 'CHIP_ACTIVIDAD') return `Ing: ${fmt(r.totales.ingresos)} · Exc: ${fmt(r.totales.excedente)}`
    if (r.tipo === 'FUT_GASTOS') return `Apropiado ${fmt(r.totales.apropiado)} · Pagado ${fmt(r.totales.pagado)}`
    if (r.tipo === 'FUT_INGRESOS') return `Aforado: ${fmt(r.totales.aforadoDefinitivo)}`
    if (r.tipo === 'LEY_617') return `${(r.totales.indicador * 100).toFixed(2)}% · ${r.totales.cumple ? '✓ cumple' : '✗ excede'}`
    return "—"
  }

  async function descargar(r: Reporte) {
    const res = await fetch(`/api/admin/rc/reportes/${r.id}`)
    const j = await res.json()
    const blob = new Blob([JSON.stringify(j.reporte.datos, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${r.tipo}_${r.vigencia ?? r.periodoContableId ?? ''}_${new Date(r.generadoEn).toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este reporte generado?")) return
    await fetch(`/api/admin/rc/reportes/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" /> Reportes a entes de control</h1>
          <p className="text-sm text-slate-600">Snapshots para CHIP (CGN), FUT (DNP) y Ley 617</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal('CHIP_BALANCE')} className="px-3 py-2 text-sm rounded-md border">+ CHIP Balance</button>
          <button onClick={() => setModal('CHIP_ACTIVIDAD')} className="px-3 py-2 text-sm rounded-md border">+ CHIP Actividad</button>
          <button onClick={() => setModal('FUT_GASTOS')} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">+ FUT Gastos</button>
          <button onClick={() => setModal('FUT_INGRESOS')} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">+ FUT Ingresos</button>
          <button onClick={() => setModal('LEY_617')} className="px-3 py-2 text-sm rounded-md bg-violet-600 text-white">+ Ley 617</button>
        </div>
      </div>

      <section className="bg-white rounded-lg border">
        <header className="p-4 border-b flex items-center gap-2">
          <FileText className="w-5 h-5" /> <h2 className="font-semibold">Reportes generados</h2>
          <span className="text-xs text-slate-500 ml-auto">{reportes.length} snapshots</span>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Corte</th>
                <th className="px-3 py-2">Resumen</th>
                <th className="px-3 py-2">Generado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {reportes.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-slate-500">Aún no se han generado reportes.</td></tr>
              )}
              {reportes.map(r => {
                const periodo = periodos.find(p => p.id === r.periodoContableId)
                return (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{TIPOS_LABEL[r.tipo] ?? r.tipo}</td>
                    <td className="px-3 py-2 font-mono text-xs">{r.vigencia ?? periodo?.codigo ?? '—'}</td>
                    <td className="px-3 py-2 text-xs">{totalResumen(r)}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{new Date(r.generadoEn).toLocaleString('es-CO')}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => descargar(r)} className="px-2 py-1 text-xs border rounded flex items-center gap-1">
                          <Download className="w-3 h-3" /> JSON
                        </button>
                        <button onClick={() => eliminar(r.id)} className="px-2 py-1 text-xs border rounded text-red-600">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <GenerarModal tipo={modal} periodos={periodos} vigenciaActual={vigenciaActual}
          onClose={() => setModal(null)} onSaved={() => router.refresh()} />
      )}
    </div>
  )
}

function GenerarModal({ tipo, periodos, vigenciaActual, onClose, onSaved }: {
  tipo: string; periodos: Periodo[]; vigenciaActual: number;
  onClose: () => void; onSaved: () => void;
}) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const requierePeriodo = tipo.startsWith('CHIP')
  const requiereVigencia = !requierePeriodo

  function submit(fd: FormData) {
    start(async () => {
      setErr(null)
      const body: any = { tipo }
      if (requierePeriodo) body.periodoContableId = String(fd.get('periodoContableId'))
      if (requiereVigencia) body.vigencia = Number(fd.get('vigencia'))
      if (tipo === 'LEY_617') {
        const icld = fd.get('icldManual')
        if (icld) body.icldManual = Number(icld)
        const tope = fd.get('topeCategoria')
        if (tope) body.topeCategoria = Number(tope)
      }
      const obs = fd.get('observacion')
      if (obs) body.observacion = String(obs)
      const r = await fetch('/api/admin/rc/generar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) { setErr((await r.json()).error ?? 'Error'); return }
      onSaved(); onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-12 p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="px-4 py-3 border-b flex items-center">
          <h3 className="font-semibold">Generar: {TIPOS_LABEL[tipo]}</h3>
          <button onClick={onClose} className="ml-auto text-slate-500"><X className="w-4 h-4" /></button>
        </header>
        <form action={submit} className="p-4 space-y-3 text-sm">
          {requierePeriodo && (
            <label>Periodo contable
              <select name="periodoContableId" required className="w-full border rounded p-2">
                <option value="">— Selecciona —</option>
                {periodos.map(p => <option key={p.id} value={p.id}>{p.codigo} · {p.estado}</option>)}
              </select>
            </label>
          )}
          {requiereVigencia && (
            <label>Vigencia
              <input name="vigencia" type="number" required defaultValue={vigenciaActual} className="w-full border rounded p-2" />
            </label>
          )}
          {tipo === 'LEY_617' && (
            <>
              <label>ICLD manual (opcional)
                <input name="icldManual" type="number" step={1000} className="w-full border rounded p-2" />
                <span className="text-xs text-slate-500">Si se omite, se calcula sumando rubros CCPET 1.1.*</span>
              </label>
              <label>Tope categoría
                <select name="topeCategoria" defaultValue="0.037" className="w-full border rounded p-2">
                  <option value="0.015">1.5% (categoría especial/1)</option>
                  <option value="0.020">2.0% (categoría 2)</option>
                  <option value="0.025">2.5% (categoría 3)</option>
                  <option value="0.030">3.0% (categoría 4)</option>
                  <option value="0.035">3.5% (categoría 5)</option>
                  <option value="0.037">3.7% (categoría 6)</option>
                </select>
              </label>
            </>
          )}
          <label>Observación (opcional)
            <input name="observacion" className="w-full border rounded p-2" />
          </label>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancelar</button>
            <button disabled={pending} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1">
              {pending && <Loader2 className="w-4 h-4 animate-spin" />} Generar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
