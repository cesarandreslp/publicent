"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Landmark, ArrowDownCircle, ArrowUpCircle, RefreshCw, Loader2, X, Plus, CheckCircle2, AlertCircle, Upload, FileText } from "lucide-react"

type TesoCuenta = {
  id: string; nombre: string; banco: string; numeroCuenta: string
  tipo: string; activa: boolean; cuentaContableCodigo: string | null
}
type TesoMovimiento = {
  id: string; cuentaId: string; tipo: string; fecha: string; valor: number
  descripcion: string; numero: string | null; tercero: string | null
  conciliado: boolean
}

const TIPO_LABEL: Record<string, string> = {
  CORRIENTE: "Corriente", AHORROS: "Ahorros",
  INVERSION_TEMPORAL: "Inversión / CDT", FONDOS_ESPECIALES: "Fondos especiales",
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Modal Cuenta ─────────────────────────────────────────────────────────────
function CuentaModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    nombre: "", banco: "", nitBanco: "", numeroCuenta: "", tipo: "CORRIENTE",
    descripcion: "", cuentaContableCodigo: "",
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr("")
    const res = await fetch("/api/admin/teso/cuentas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        nitBanco: form.nitBanco || null,
        descripcion: form.descripcion || null,
        cuentaContableCodigo: form.cuentaContableCodigo || null,
      }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Error al guardar"); return }
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Nueva cuenta bancaria</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nombre interno *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="Cuenta corriente Banco Popular"
                value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Banco *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="Banco Popular" value={form.banco}
                onChange={e => setForm(f => ({ ...f, banco: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIT banco</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="830.000.000-7" value={form.nitBanco}
                onChange={e => setForm(f => ({ ...f, nitBanco: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número de cuenta *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="220-00000-0" value={form.numeroCuenta}
                onChange={e => setForm(f => ({ ...f, numeroCuenta: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {Object.entries(TIPO_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cuenta CGC (111*)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="111005" value={form.cuentaContableCodigo}
                onChange={e => setForm(f => ({ ...f, cuentaContableCodigo: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Cuenta principal de pagos..." value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
            </div>
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal Movimiento ─────────────────────────────────────────────────────────
function MovimientoModal({ cuentas, onClose, onSave }: {
  cuentas: TesoCuenta[]; onClose: () => void; onSave: () => void
}) {
  const hoy = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    cuentaId: cuentas[0]?.id ?? "", tipo: "EGRESO", fecha: hoy,
    valor: "", descripcion: "", numero: "", tercero: "",
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.valor || Number(form.valor) <= 0) { setErr("El valor debe ser mayor a 0"); return }
    setLoading(true); setErr("")
    const res = await fetch("/api/admin/teso/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fecha: new Date(form.fecha + "T12:00:00Z").toISOString(),
        valor: Number(form.valor),
        numero: form.numero || null,
        tercero: form.tercero || null,
      }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Error al guardar"); return }
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Registrar movimiento</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Cuenta *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.cuentaId} onChange={e => setForm(f => ({ ...f, cuentaId: e.target.value }))}>
                {cuentas.filter(c => c.activa).map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.banco}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                <option value="INGRESO">Ingreso (crédito)</option>
                <option value="EGRESO">Egreso (débito)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha *</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor (COP) *</label>
              <input type="number" min="1" step="1" className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="0" value={form.valor}
                onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número (OR/OE)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="OR-2025-001" value={form.numero}
                onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Descripción *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="Pago nómina marzo 2025" value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Tercero</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Nombre del tercero" value={form.tercero}
                onChange={e => setForm(f => ({ ...f, tercero: e.target.value }))} />
            </div>
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal Extracto ───────────────────────────────────────────────────────────
function ExtractoModal({ cuentas, onClose, onSave }: {
  cuentas: TesoCuenta[]; onClose: () => void; onSave: () => void
}) {
  const periodoActual = new Date().toISOString().slice(0, 7)
  const [form, setForm] = useState({
    cuentaId: cuentas[0]?.id ?? "", periodo: periodoActual,
    saldoInicial: "", saldoFinal: "", observacion: "", csv: "",
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  // Parsea el CSV pegado (formato: fecha,descripcion,referencia,debito,credito,saldo)
  function parsearLineas() {
    return form.csv.trim().split("\n").filter(l => l.trim()).map((linea, i) => {
      const partes = linea.split(/[,;|\t]/).map(p => p.trim())
      const fecha = partes[0] ? new Date(partes[0] + "T12:00:00Z").toISOString() : new Date().toISOString()
      return {
        fecha,
        descripcion: partes[1] || `Línea ${i + 1}`,
        referencia: partes[2] || null,
        debito:  partes[3] ? Number(partes[3].replace(/[^0-9.-]/g, "")) || null : null,
        credito: partes[4] ? Number(partes[4].replace(/[^0-9.-]/g, "")) || null : null,
        saldo:   partes[5] ? Number(partes[5].replace(/[^0-9.-]/g, "")) || null : null,
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const lineas = parsearLineas()
    if (lineas.length === 0) { setErr("Pegue al menos una línea del extracto"); return }
    setLoading(true); setErr("")
    const res = await fetch("/api/admin/teso/extractos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cuentaId: form.cuentaId, periodo: form.periodo,
        saldoInicial: Number(form.saldoInicial) || 0,
        saldoFinal: Number(form.saldoFinal) || 0,
        observacion: form.observacion || null,
        lineas,
      }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Error al cargar"); return }
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Cargar extracto bancario</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Cuenta *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.cuentaId} onChange={e => setForm(f => ({ ...f, cuentaId: e.target.value }))}>
                {cuentas.filter(c => c.activa).map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.banco}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Periodo (YYYY-MM) *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                pattern="\d{4}-\d{2}" placeholder="2025-04"
                value={form.periodo} onChange={e => setForm(f => ({ ...f, periodo: e.target.value }))} />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium mb-1">Saldo inicial</label>
              <input type="number" step="1" className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0" value={form.saldoInicial}
                onChange={e => setForm(f => ({ ...f, saldoInicial: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Saldo final</label>
              <input type="number" step="1" className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0" value={form.saldoFinal}
                onChange={e => setForm(f => ({ ...f, saldoFinal: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Líneas del extracto *
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Formato: <code>fecha, descripción, referencia, débito, crédito, saldo</code> · Separador: coma, punto y coma, pipe o tabulación.
            </p>

            {/* Input de archivo */}
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors mb-2">
              <Upload className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-500">Seleccionar archivo CSV / TSV / TXT</span>
              <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = ev => setForm(f => ({ ...f, csv: (ev.target?.result as string) ?? "" }))
                  reader.readAsText(file, "utf-8")
                  e.target.value = "" // permitir re-selección del mismo archivo
                }} />
            </label>

            {/* Vista previa editable */}
            {form.csv ? (
              <div className="relative">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {form.csv.trim().split("\n").filter(Boolean).length} líneas cargadas · puede editar antes de enviar</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, csv: "" }))}
                    className="text-red-400 hover:text-red-600">Limpiar</button>
                </div>
                <textarea rows={8}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-xs"
                  value={form.csv} onChange={e => setForm(f => ({ ...f, csv: e.target.value }))} />
              </div>
            ) : (
              <textarea rows={4}
                className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-xs border-dashed text-slate-400"
                placeholder={"2025-04-01, Transferencia nómina, REF001, 5000000, ,\n2025-04-02, Recaudo predial, , , 200000, "}
                value={form.csv} onChange={e => setForm(f => ({ ...f, csv: e.target.value }))}
                readOnly />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observación</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Extracto mensual Banco Popular" value={form.observacion}
              onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} />
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Cargar extracto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Panel de conciliación ────────────────────────────────────────────────────
function ConciliacionPanel({ cuentaId, cuentaNombre }: { cuentaId: string; cuentaNombre: string }) {
  const [movimientos, setMovimientos] = useState<TesoMovimiento[]>([])
  const [extractoId, setExtractoId] = useState("")
  const [extractos, setExtractos] = useState<{ id: string; periodo: string; lineas: any[] }[]>([])
  const [movSel, setMovSel] = useState<string | null>(null)
  const [lineaSel, setLineaSel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/admin/teso/movimientos?cuentaId=${cuentaId}&conciliado=false`)
      .then(r => r.json()).then(setMovimientos)
    fetch(`/api/admin/teso/extractos?cuentaId=${cuentaId}`)
      .then(r => r.json()).then(setExtractos)
  }, [cuentaId])

  const extractoActual = extractos.find(e => e.id === extractoId)

  useEffect(() => {
    if (!extractoId) return
    fetch(`/api/admin/teso/extractos/${extractoId}`)
      .then(r => r.json())
      .then(data => {
        setExtractos(prev => prev.map(e => e.id === extractoId ? data : e))
      })
  }, [extractoId])

  async function conciliar() {
    if (!movSel || !lineaSel) return
    setLoading(true); setMsg("")
    const res = await fetch("/api/admin/teso/conciliar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movimientoId: movSel, extractoLineaId: lineaSel }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setMsg(data.error ?? "Error"); return }
    setMsg("✓ Conciliado"); setMovSel(null); setLineaSel(null)
    // Refrescar listas
    fetch(`/api/admin/teso/movimientos?cuentaId=${cuentaId}&conciliado=false`)
      .then(r => r.json()).then(setMovimientos)
    if (extractoId)
      fetch(`/api/admin/teso/extractos/${extractoId}`)
        .then(r => r.json())
        .then(data => setExtractos(prev => prev.map(e => e.id === extractoId ? data : e)))
    router.refresh()
  }

  const lineasPendientes = (extractoActual as any)?.lineas?.filter((l: any) => !l.conciliada) ?? []

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">Conciliación — {cuentaNombre}</h3>
      <div>
        <label className="block text-sm font-medium mb-1">Extracto a conciliar</label>
        <select className="border rounded-lg px-3 py-2 text-sm w-full max-w-xs"
          value={extractoId} onChange={e => setExtractoId(e.target.value)}>
          <option value="">Seleccione un extracto...</option>
          {extractos.map(e => <option key={e.id} value={e.id}>{e.periodo}</option>)}
        </select>
      </div>
      {extractoId && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2 text-gray-600">Movimientos sin conciliar ({movimientos.length})</p>
            <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              {movimientos.length === 0
                ? <p className="text-center text-sm text-gray-400 py-6">Sin movimientos pendientes</p>
                : movimientos.map(m => (
                  <button key={m.id} onClick={() => setMovSel(m.id === movSel ? null : m.id)}
                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 text-sm hover:bg-gray-50 transition-colors ${movSel === m.id ? 'bg-blue-50 border-blue-200' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className="truncate mr-2 text-gray-700">{m.descripcion}</span>
                      <span className={`font-medium whitespace-nowrap ${m.tipo === 'INGRESO' ? 'text-green-700' : 'text-red-700'}`}>
                        {m.tipo === 'INGRESO' ? '+' : '-'}{fmt(m.valor)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{fmtDate(m.fecha)}</p>
                  </button>
                ))
              }
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2 text-gray-600">Líneas extracto sin conciliar ({lineasPendientes.length})</p>
            <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              {lineasPendientes.length === 0
                ? <p className="text-center text-sm text-gray-400 py-6">Sin líneas pendientes</p>
                : lineasPendientes.map((l: any) => (
                  <button key={l.id} onClick={() => setLineaSel(l.id === lineaSel ? null : l.id)}
                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 text-sm hover:bg-gray-50 transition-colors ${lineaSel === l.id ? 'bg-emerald-50 border-emerald-200' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className="truncate mr-2 text-gray-700">{l.descripcion}</span>
                      <span className={`font-medium whitespace-nowrap ${l.credito ? 'text-green-700' : 'text-red-700'}`}>
                        {l.credito ? `+${fmt(l.credito)}` : l.debito ? `-${fmt(l.debito)}` : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{fmtDate(l.fecha)}</p>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}
      {extractoId && (
        <div className="flex items-center gap-3">
          <button
            disabled={!movSel || !lineaSel || loading}
            onClick={conciliar}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Conciliar par seleccionado
          </button>
          {msg && <span className="text-sm text-emerald-700 font-medium">{msg}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function TesoreriaClient({
  cuentas: cuentasInit, movimientosRecientes, saldosPorCuenta,
}: {
  cuentas: TesoCuenta[]
  movimientosRecientes: TesoMovimiento[]
  saldosPorCuenta: Record<string, number>
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [modal, setModal] = useState<"cuenta" | "movimiento" | "extracto" | null>(null)
  const [tabConciliar, setTabConciliar] = useState<string | null>(null)
  const [tab, setTab] = useState<"movimientos" | "conciliacion">("movimientos")

  const totalGeneral = Object.values(saldosPorCuenta).reduce((a, b) => a + b, 0)
  const pendientes = movimientosRecientes.filter(m => !m.conciliado).length

  function refresh() {
    setModal(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Landmark className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tesorería</h1>
            <p className="text-sm text-gray-500">Cuentas bancarias, movimientos y conciliación</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal("cuenta")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Nueva cuenta
          </button>
          <button onClick={() => setModal("movimiento")} disabled={cuentasInit.length === 0}
            className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 disabled:opacity-40">
            <RefreshCw className="w-4 h-4" /> Movimiento
          </button>
          <button onClick={() => setModal("extracto")} disabled={cuentasInit.length === 0}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-40">
            <Plus className="w-4 h-4" /> Extracto
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Saldo total en banco</p>
          <p className={`text-2xl font-bold mt-1 ${totalGeneral >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {fmt(totalGeneral)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{cuentasInit.filter(c => c.activa).length} cuenta(s) activa(s)</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Movimientos pendientes de conciliar</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{pendientes}</p>
          <p className="text-xs text-gray-400 mt-1">de {movimientosRecientes.length} recientes</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Cuentas registradas</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{cuentasInit.length}</p>
          <p className="text-xs text-gray-400 mt-1">{cuentasInit.filter(c => !c.activa).length} inactiva(s)</p>
        </div>
      </div>

      {/* Tabla de cuentas */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Cuentas bancarias</h2>
        </div>
        {cuentasInit.length === 0
          ? <p className="text-center text-sm text-gray-400 py-10">No hay cuentas registradas. Cree la primera.</p>
          : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre / Banco</th>
                  <th className="px-4 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-right">Saldo libro</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Conciliar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cuentasInit.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.nombre}</p>
                      <p className="text-xs text-gray-400">{c.banco}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{c.numeroCuenta}</td>
                    <td className="px-4 py-3 text-gray-500">{TIPO_LABEL[c.tipo] ?? c.tipo}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      <span className={saldosPorCuenta[c.id] >= 0 ? 'text-green-700' : 'text-red-700'}>
                        {fmt(saldosPorCuenta[c.id] ?? 0)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {c.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setTabConciliar(tabConciliar === c.id ? null : c.id); setTab("conciliacion") }}
                        className="text-xs text-blue-600 hover:underline">
                        Conciliar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {/* Tabs movimientos / conciliación */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b">
          {(["movimientos", "conciliacion"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === "movimientos" ? "Movimientos recientes" : "Conciliación"}
            </button>
          ))}
        </div>

        {tab === "movimientos" && (
          <div className="overflow-x-auto">
            {movimientosRecientes.length === 0
              ? <p className="text-center text-sm text-gray-400 py-10">Sin movimientos registrados.</p>
              : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">Fecha</th>
                      <th className="px-4 py-3 text-left">Descripción</th>
                      <th className="px-4 py-3 text-left">Cuenta</th>
                      <th className="px-4 py-3 text-left">Tercero</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                      <th className="px-4 py-3 text-center">Conciliado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {movimientosRecientes.map(m => {
                      const cuenta = cuentasInit.find(c => c.id === m.cuentaId)
                      return (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{fmtDate(m.fecha)}</td>
                          <td className="px-4 py-2">
                            <p className="font-medium text-gray-800">{m.descripcion}</p>
                            {m.numero && <p className="text-xs text-gray-400">{m.numero}</p>}
                          </td>
                          <td className="px-4 py-2 text-gray-500 text-xs">{cuenta?.nombre ?? '—'}</td>
                          <td className="px-4 py-2 text-gray-500 text-xs">{m.tercero ?? '—'}</td>
                          <td className="px-4 py-2 text-right font-medium whitespace-nowrap">
                            <span className={`flex items-center justify-end gap-1 ${m.tipo === 'INGRESO' ? 'text-green-700' : 'text-red-700'}`}>
                              {m.tipo === 'INGRESO'
                                ? <ArrowDownCircle className="w-3.5 h-3.5" />
                                : <ArrowUpCircle className="w-3.5 h-3.5" />}
                              {fmt(m.valor)}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {m.conciliado
                              ? <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                              : <AlertCircle className="w-4 h-4 text-amber-400 mx-auto" />}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )
            }
          </div>
        )}

        {tab === "conciliacion" && (
          <div className="p-5">
            {tabConciliar
              ? <ConciliacionPanel
                  cuentaId={tabConciliar}
                  cuentaNombre={cuentasInit.find(c => c.id === tabConciliar)?.nombre ?? ""}
                />
              : (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">Seleccione una cuenta en la tabla de arriba para conciliar.</p>
                </div>
              )
            }
          </div>
        )}
      </div>

      {/* Modales */}
      {modal === "cuenta" && (
        <CuentaModal onClose={() => setModal(null)} onSave={refresh} />
      )}
      {modal === "movimiento" && (
        <MovimientoModal cuentas={cuentasInit} onClose={() => setModal(null)} onSave={refresh} />
      )}
      {modal === "extracto" && (
        <ExtractoModal cuentas={cuentasInit} onClose={() => setModal(null)} onSave={refresh} />
      )}
    </div>
  )
}
