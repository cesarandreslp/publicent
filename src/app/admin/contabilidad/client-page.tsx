"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Plus, X, Loader2, FileText } from "lucide-react"

type Cuenta = { id: string; codigo: string; nombre: string; naturaleza: 'DEBITO' | 'CREDITO' }
type Periodo = { id: string; codigo: string; anio: number; mes: number | null; estado: 'ABIERTO' | 'CERRADO' | 'AJUSTE'; _count: { comprobantes: number } }
type Comprobante = {
  id: string; numero: string; tipo: string; fecha: string; descripcion: string;
  estado: string; totalDebito: number; totalCredito: number;
  periodo: { codigo: string }; _count: { asientos: number }
}
type BalanceRow = { codigo: string; nombre: string; tipo: string; debito: number; credito: number; saldo: number }

const TIPOS_COMPROBANTE = ["CONTABLE", "EGRESO", "INGRESO", "AJUSTE", "APERTURA", "CIERRE"] as const

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

function badgeEstadoPeriodo(estado: string) {
  return ({ ABIERTO: "bg-emerald-100 text-emerald-700", CERRADO: "bg-slate-200 text-slate-700", AJUSTE: "bg-amber-100 text-amber-700" } as Record<string, string>)[estado] ?? "bg-slate-100"
}

export default function ContabilidadDashboardClient({
  periodos, periodoActivo, totalCuentas, cuentasMov, ultimosComprobantes, balance,
}: {
  periodos: Periodo[]
  periodoActivo: Periodo | null
  totalCuentas: number
  cuentasMov: Cuenta[]
  ultimosComprobantes: Comprobante[]
  balance: BalanceRow[]
}) {
  const router = useRouter()
  const [openComp, setOpenComp] = useState(false)
  const [openPer, setOpenPer] = useState(false)

  const totales = useMemo(() => balance.reduce(
    (s, r) => ({ debito: s.debito + r.debito, credito: s.credito + r.credito }),
    { debito: 0, credito: 0 }
  ), [balance])

  const saldosPorClase = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of balance) {
      const clase = r.codigo[0] || "?"
      m.set(clase, (m.get(clase) ?? 0) + r.saldo)
    }
    return m
  }, [balance])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Contabilidad pública</h1>
          <p className="text-sm text-slate-600">Plan Único de Cuentas (CGN) — {totalCuentas} cuentas activas.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOpenPer(true)} className="px-3 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50">Nuevo periodo</button>
          <button onClick={() => setOpenComp(true)} disabled={!periodoActivo || periodoActivo.estado === 'CERRADO'} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Comprobante
          </button>
        </div>
      </div>

      {/* KPIs por clase */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[["1", "Activos"], ["2", "Pasivos"], ["3", "Patrimonio"], ["4", "Ingresos"], ["5", "Gastos"]].map(([c, label]) => (
          <div key={c} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="text-xs text-slate-500">Clase {c} — {label}</div>
            <div className="text-lg font-semibold mt-1">{fmt(saldosPorClase.get(c) ?? 0)}</div>
          </div>
        ))}
      </div>

      {/* Periodo activo */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs text-slate-500">Periodo activo</div>
            <div className="text-lg font-semibold">
              {periodoActivo ? periodoActivo.codigo : "Sin periodo abierto"}
              {periodoActivo && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${badgeEstadoPeriodo(periodoActivo.estado)}`}>
                  {periodoActivo.estado}
                </span>
              )}
            </div>
          </div>
          <select
            value={periodoActivo?.id ?? ""}
            onChange={() => { /* puro display — server toma el ABIERTO */ }}
            className="border border-slate-300 rounded-md px-2 py-1 text-sm"
          >
            {periodos.map(p => (
              <option key={p.id} value={p.id}>{p.codigo} ({p.estado})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Balance del periodo */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white">
          <div className="p-3 border-b font-semibold text-sm">Balance del periodo activo</div>
          {!balance.length ? (
            <div className="p-6 text-sm text-slate-500">Sin movimientos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Cuenta</th>
                    <th className="text-right px-3 py-2">Débitos</th>
                    <th className="text-right px-3 py-2">Créditos</th>
                    <th className="text-right px-3 py-2">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {balance.map(r => (
                    <tr key={r.codigo} className="border-t">
                      <td className="px-3 py-2"><span className="font-mono">{r.codigo}</span> — {r.nombre}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.debito)}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.credito)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmt(r.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-slate-50 font-semibold">
                    <td className="px-3 py-2">Totales</td>
                    <td className="px-3 py-2 text-right">{fmt(totales.debito)}</td>
                    <td className="px-3 py-2 text-right">{fmt(totales.credito)}</td>
                    <td className="px-3 py-2 text-right">{Math.abs(totales.debito - totales.credito) < 0.005 ? "✓ cuadrado" : "⚠ descuadre"}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Últimos comprobantes */}
        <div className="rounded-lg border border-slate-200 bg-white">
          <div className="p-3 border-b font-semibold text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Últimos comprobantes</div>
          {!ultimosComprobantes.length ? (
            <div className="p-6 text-sm text-slate-500">Aún no hay comprobantes.</div>
          ) : (
            <ul className="divide-y">
              {ultimosComprobantes.map(c => (
                <li key={c.id} className="p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono">{c.numero}</span>
                    <span className="text-xs text-slate-500">{new Date(c.fecha).toLocaleDateString("es-CO")}</span>
                  </div>
                  <div className="text-slate-700 line-clamp-1">{c.descripcion}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {c.tipo} · {c.periodo.codigo} · {c._count.asientos} asientos · {fmt(Number(c.totalDebito))}
                    {c.estado === 'ANULADO' && <span className="ml-2 text-red-600">ANULADO</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {openComp && periodoActivo && (
        <ComprobanteModal
          periodoId={periodoActivo.id}
          cuentas={cuentasMov}
          onClose={() => setOpenComp(false)}
          onSaved={() => { setOpenComp(false); router.refresh() }}
        />
      )}
      {openPer && (
        <PeriodoModal onClose={() => setOpenPer(false)} onSaved={() => { setOpenPer(false); router.refresh() }} />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function PeriodoModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const now = new Date()
  const [anio, setAnio] = useState(now.getFullYear())
  const [mes, setMes] = useState<number | "">(now.getMonth() + 1)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    setError(null)
    const a = Number(anio)
    const m = mes === "" ? null : Number(mes)
    const codigo = m ? `${a}-${String(m).padStart(2, '0')}` : `${a}`
    const fechaInicio = new Date(Date.UTC(a, (m ?? 1) - 1, 1)).toISOString()
    const fechaFin = m
      ? new Date(Date.UTC(a, m, 0, 23, 59, 59)).toISOString()
      : new Date(Date.UTC(a, 11, 31, 23, 59, 59)).toISOString()

    start(async () => {
      const r = await fetch("/api/admin/cp/periodos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, anio: a, mes: m, fechaInicio, fechaFin }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j.error ?? "Error al crear periodo")
        return
      }
      onSaved()
    })
  }

  return (
    <Modal title="Nuevo periodo" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">Año
            <input type="number" value={anio} onChange={e => setAnio(Number(e.target.value))} className="mt-1 w-full border rounded-md px-2 py-1" />
          </label>
          <label className="text-sm">Mes (vacío = anual)
            <input type="number" min={1} max={12} value={mes} onChange={e => setMes(e.target.value === "" ? "" : Number(e.target.value))} className="mt-1 w-full border rounded-md px-2 py-1" />
          </label>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border">Cancelar</button>
          <button onClick={submit} disabled={pending} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white flex items-center gap-1">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />} Crear
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ComprobanteModal({ periodoId, cuentas, onClose, onSaved }:
  { periodoId: string; cuentas: Cuenta[]; onClose: () => void; onSaved: () => void }) {
  const [numero, setNumero] = useState("")
  const [tipo, setTipo] = useState<typeof TIPOS_COMPROBANTE[number]>("CONTABLE")
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [descripcion, setDescripcion] = useState("")
  const [lineas, setLineas] = useState([
    { cuentaId: "", debito: 0, credito: 0, descripcion: "" },
    { cuentaId: "", debito: 0, credito: 0, descripcion: "" },
  ])
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const totales = useMemo(() => lineas.reduce(
    (s, l) => ({ d: s.d + Number(l.debito || 0), c: s.c + Number(l.credito || 0) }),
    { d: 0, c: 0 }
  ), [lineas])
  const cuadrado = Math.abs(totales.d - totales.c) < 0.005 && totales.d > 0

  const setLinea = (i: number, patch: Partial<typeof lineas[0]>) => {
    setLineas(ls => ls.map((l, idx) => idx === i ? { ...l, ...patch } : l))
  }

  const submit = () => {
    setError(null)
    start(async () => {
      const r = await fetch("/api/admin/cp/comprobantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numero, tipo, fecha: new Date(fecha).toISOString(), descripcion, periodoId,
          asientos: lineas
            .filter(l => l.cuentaId && (Number(l.debito) > 0 || Number(l.credito) > 0))
            .map(l => ({
              cuentaId: l.cuentaId,
              debito: Number(l.debito || 0),
              credito: Number(l.credito || 0),
              descripcion: l.descripcion || null,
            })),
        }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j.error ?? "Error al registrar comprobante")
        return
      }
      onSaved()
    })
  }

  return (
    <Modal title="Nuevo comprobante" onClose={onClose} wide>
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label className="text-sm">Número
            <input value={numero} onChange={e => setNumero(e.target.value)} className="mt-1 w-full border rounded-md px-2 py-1" placeholder="CC-2026-001" />
          </label>
          <label className="text-sm">Tipo
            <select value={tipo} onChange={e => setTipo(e.target.value as typeof TIPOS_COMPROBANTE[number])} className="mt-1 w-full border rounded-md px-2 py-1">
              {TIPOS_COMPROBANTE.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="text-sm">Fecha
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="mt-1 w-full border rounded-md px-2 py-1" />
          </label>
          <label className="text-sm col-span-2 md:col-span-4">Descripción
            <input value={descripcion} onChange={e => setDescripcion(e.target.value)} className="mt-1 w-full border rounded-md px-2 py-1" />
          </label>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr>
                <th className="text-left px-2 py-1">Cuenta</th>
                <th className="text-right px-2 py-1 w-32">Débito</th>
                <th className="text-right px-2 py-1 w-32">Crédito</th>
                <th className="text-left px-2 py-1">Detalle</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="px-2 py-1">
                    <select value={l.cuentaId} onChange={e => setLinea(i, { cuentaId: e.target.value })} className="w-full border rounded-md px-1 py-1">
                      <option value="">— seleccione —</option>
                      {cuentas.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1"><input type="number" min={0} step="0.01" value={l.debito} onChange={e => setLinea(i, { debito: Number(e.target.value) })} className="w-full border rounded-md px-1 py-1 text-right" /></td>
                  <td className="px-2 py-1"><input type="number" min={0} step="0.01" value={l.credito} onChange={e => setLinea(i, { credito: Number(e.target.value) })} className="w-full border rounded-md px-1 py-1 text-right" /></td>
                  <td className="px-2 py-1"><input value={l.descripcion} onChange={e => setLinea(i, { descripcion: e.target.value })} className="w-full border rounded-md px-1 py-1" /></td>
                  <td className="px-2 py-1">
                    {lineas.length > 2 && (
                      <button onClick={() => setLineas(ls => ls.filter((_, idx) => idx !== i))} className="text-red-600 hover:bg-red-50 rounded p-1"><X className="w-4 h-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t font-semibold">
                <td className="px-2 py-1 text-right">Totales</td>
                <td className="px-2 py-1 text-right">{fmt(totales.d)}</td>
                <td className="px-2 py-1 text-right">{fmt(totales.c)}</td>
                <td className="px-2 py-1 text-xs">{cuadrado ? "✓ partida doble" : "⚠ no cuadra"}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button onClick={() => setLineas(ls => [...ls, { cuentaId: "", debito: 0, credito: 0, descripcion: "" }])} className="text-sm px-2 py-1 border rounded-md">+ Agregar línea</button>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border">Cancelar</button>
          <button onClick={submit} disabled={pending || !cuadrado || !numero || !descripcion} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50 flex items-center gap-1">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />} Registrar
          </button>
        </div>
      </div>
    </Modal>
  )
}

function Modal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${wide ? 'max-w-4xl' : 'max-w-md'} max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
