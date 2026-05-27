"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Wallet, Plus, X, Loader2, ArrowRight } from "lucide-react"

type Rubro = { id: string; codigo: string; nombre: string; tipo: string }
type Fila = { rubroId: string; codigo: string; nombre: string; tipo: string; apropiado: number; comprometido: number; obligado: number; pagado: number; disponible: number }
type Cdp = { id: string; numero: string; fecha: string; valor: number; objeto: string; rubro: { codigo: string; nombre: string }; _count: { rps: number } }
type Rp = { id: string; numero: string; fecha: string; valor: number; objeto: string; cdp: { numero: string; rubro: { codigo: string } }; tercero: { razonSocial: string } | null; _count: { obligaciones: number } }
type Tercero = { id: string; documento: string; razonSocial: string }
type CuentaPuc = { id: string; codigo: string; nombre: string }

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

export default function PresupuestoClient({
  vigencia, filas, rubrosMov, cdpsRecientes, rpsRecientes, terceros, cuentasBanco,
}: {
  vigencia: number; filas: Fila[]; rubrosMov: Rubro[];
  cdpsRecientes: Cdp[]; rpsRecientes: Rp[]; terceros: Tercero[]; cuentasBanco: CuentaPuc[];
}) {
  const router = useRouter()
  const [paso, setPaso] = useState<null | 'rubro' | 'apropiacion' | 'cdp' | 'rp' | 'obligacion' | 'pago'>(null)

  const totales = useMemo(() => filas.reduce(
    (s, r) => ({ apropiado: s.apropiado + r.apropiado, comprometido: s.comprometido + r.comprometido, obligado: s.obligado + r.obligado, pagado: s.pagado + r.pagado }),
    { apropiado: 0, comprometido: 0, obligado: 0, pagado: 0 }
  ), [filas])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="w-6 h-6" /> Ejecución presupuestal</h1>
          <p className="text-sm text-slate-600">Vigencia {vigencia} · cadena CDP → RP → Obligación → Pago</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setPaso('rubro')} className="px-3 py-2 text-sm rounded-md border">+ Rubro</button>
          <button onClick={() => setPaso('apropiacion')} className="px-3 py-2 text-sm rounded-md border">+ Apropiación</button>
          <button onClick={() => setPaso('cdp')} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white">+ CDP</button>
          <button onClick={() => setPaso('rp')} className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white">+ RP</button>
          <button onClick={() => setPaso('obligacion')} className="px-3 py-2 text-sm rounded-md bg-violet-600 text-white">+ Obligación</button>
          <button onClick={() => setPaso('pago')} className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white">+ Pago</button>
        </div>
      </div>

      {/* KPIs ejecución */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Apropiado", totales.apropiado, "bg-slate-50"],
          ["Comprometido", totales.comprometido, "bg-blue-50"],
          ["Obligado", totales.obligado, "bg-violet-50"],
          ["Pagado", totales.pagado, "bg-emerald-50"],
        ].map(([label, value, cls]) => (
          <div key={label as string} className={`rounded-lg border p-3 ${cls}`}>
            <div className="text-xs text-slate-500">{label as string}</div>
            <div className="text-lg font-semibold mt-1">{fmt(Number(value))}</div>
          </div>
        ))}
      </div>

      {/* Tabla por rubro */}
      <div className="rounded-lg border bg-white">
        <div className="p-3 border-b font-semibold text-sm">Ejecución por rubro</div>
        {!filas.length ? (
          <div className="p-6 text-sm text-slate-500">Sin apropiaciones en la vigencia {vigencia}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="text-left px-3 py-2">Rubro</th>
                  <th className="text-right px-3 py-2">Apropiado</th>
                  <th className="text-right px-3 py-2">Comprometido</th>
                  <th className="text-right px-3 py-2">Obligado</th>
                  <th className="text-right px-3 py-2">Pagado</th>
                  <th className="text-right px-3 py-2">Disponible</th>
                  <th className="text-right px-3 py-2">% Ejec</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(r => {
                  const pct = r.apropiado > 0 ? (r.pagado / r.apropiado) * 100 : 0
                  return (
                    <tr key={r.rubroId} className="border-t">
                      <td className="px-3 py-2"><span className="font-mono">{r.codigo}</span> — {r.nombre}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.apropiado)}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.comprometido)}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.obligado)}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.pagado)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmt(r.disponible)}</td>
                      <td className="px-3 py-2 text-right text-xs">{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ListaSimple
          titulo="Últimos CDP"
          items={cdpsRecientes.map(c => ({
            key: c.id,
            principal: `${c.numero} · ${fmt(Number(c.valor))}`,
            secundario: `${c.rubro.codigo} — ${c.objeto}`,
            extra: `${c._count.rps} RPs · ${new Date(c.fecha).toLocaleDateString("es-CO")}`,
          }))}
        />
        <ListaSimple
          titulo="Últimos RP"
          items={rpsRecientes.map(r => ({
            key: r.id,
            principal: `${r.numero} · ${fmt(Number(r.valor))}`,
            secundario: `${r.tercero?.razonSocial ?? '—'} · CDP ${r.cdp.numero}`,
            extra: `${r._count.obligaciones} obligaciones · ${new Date(r.fecha).toLocaleDateString("es-CO")}`,
          }))}
        />
      </div>

      {paso === 'rubro' && <RubroModal onClose={() => setPaso(null)} onSaved={() => { setPaso(null); router.refresh() }} />}
      {paso === 'apropiacion' && <ApropiacionModal vigencia={vigencia} rubros={rubrosMov} onClose={() => setPaso(null)} onSaved={() => { setPaso(null); router.refresh() }} />}
      {paso === 'cdp' && <CdpModal vigencia={vigencia} rubros={rubrosMov} onClose={() => setPaso(null)} onSaved={() => { setPaso(null); router.refresh() }} />}
      {paso === 'rp' && <RpModal cdps={cdpsRecientes} terceros={terceros} onClose={() => setPaso(null)} onSaved={() => { setPaso(null); router.refresh() }} />}
      {paso === 'obligacion' && <ObligacionModal rps={rpsRecientes} onClose={() => setPaso(null)} onSaved={() => { setPaso(null); router.refresh() }} />}
      {paso === 'pago' && <PagoModal cuentasBanco={cuentasBanco} onClose={() => setPaso(null)} onSaved={() => { setPaso(null); router.refresh() }} />}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

function ListaSimple({ titulo, items }: { titulo: string; items: { key: string; principal: string; secundario: string; extra: string }[] }) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="p-3 border-b font-semibold text-sm">{titulo}</div>
      {!items.length ? (
        <div className="p-6 text-sm text-slate-500">Sin registros.</div>
      ) : (
        <ul className="divide-y">
          {items.map(it => (
            <li key={it.key} className="p-3 text-sm">
              <div className="font-medium">{it.principal}</div>
              <div className="text-slate-600 line-clamp-1">{it.secundario}</div>
              <div className="text-xs text-slate-500 mt-1">{it.extra}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Modal({ title, onClose, wide, children }: { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-3">{children}</div>
      </div>
    </div>
  )
}

function postJson<T>(url: string, body: unknown, onSaved: () => void, setError: (s: string) => void, start: (cb: () => void) => void) {
  setError("")
  start(async () => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setError(j.error ?? "Error")
      return
    }
    onSaved()
  })
}

// ─── Modales por paso ────────────────────────────────────────────────────────

function RubroModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [codigo, setCodigo] = useState("")
  const [nombre, setNombre] = useState("")
  const [tipo, setTipo] = useState<'GASTO' | 'INGRESO'>("GASTO")
  const [nivel, setNivel] = useState(3)
  const [fuente, setFuente] = useState("")
  const [hoja, setHoja] = useState(true)
  const [pending, start] = useTransition()
  const [error, setError] = useState("")

  return (
    <Modal title="Nuevo rubro" onClose={onClose}>
      <Input label="Código" value={codigo} onChange={setCodigo} placeholder="A.2.1.1.01" />
      <Input label="Nombre" value={nombre} onChange={setNombre} />
      <div className="grid grid-cols-2 gap-2">
        <Select label="Tipo" value={tipo} onChange={v => setTipo(v as 'GASTO' | 'INGRESO')} options={[['GASTO','Gasto'],['INGRESO','Ingreso']]} />
        <Input label="Nivel" type="number" value={String(nivel)} onChange={v => setNivel(Number(v))} />
      </div>
      <Input label="Fuente" value={fuente} onChange={setFuente} placeholder="SGP / Propios / …" />
      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={hoja} onChange={e => setHoja(e.target.checked)} /> Permite movimientos (hoja)</label>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Actions onClose={onClose} pending={pending} onSubmit={() => postJson("/api/admin/psu/rubros", {
        codigo, nombre, tipo, nivel, fuente: fuente || null, permiteMovimientos: hoja,
      }, onSaved, setError, start)} />
    </Modal>
  )
}

function ApropiacionModal({ vigencia, rubros, onClose, onSaved }: { vigencia: number; rubros: Rubro[]; onClose: () => void; onSaved: () => void }) {
  const [rubroId, setRubroId] = useState("")
  const [valor, setValor] = useState(0)
  const [adic, setAdic] = useState(0)
  const [red, setRed] = useState(0)
  const [pending, start] = useTransition()
  const [error, setError] = useState("")

  return (
    <Modal title={`Apropiación ${vigencia}`} onClose={onClose}>
      <RubroSelect rubros={rubros} value={rubroId} onChange={setRubroId} />
      <Input label="Apropiación inicial" type="number" value={String(valor)} onChange={v => setValor(Number(v))} />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Adiciones" type="number" value={String(adic)} onChange={v => setAdic(Number(v))} />
        <Input label="Reducciones" type="number" value={String(red)} onChange={v => setRed(Number(v))} />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Actions onClose={onClose} pending={pending} disabled={!rubroId || !valor} onSubmit={() => postJson("/api/admin/psu/apropiaciones", {
        rubroId, vigencia, apropiacionInicial: valor, adiciones: adic, reducciones: red,
      }, onSaved, setError, start)} />
    </Modal>
  )
}

function CdpModal({ vigencia, rubros, onClose, onSaved }: { vigencia: number; rubros: Rubro[]; onClose: () => void; onSaved: () => void }) {
  const [numero, setNumero] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [rubroId, setRubroId] = useState("")
  const [valor, setValor] = useState(0)
  const [objeto, setObjeto] = useState("")
  const [pending, start] = useTransition()
  const [error, setError] = useState("")

  return (
    <Modal title="Nuevo CDP" onClose={onClose}>
      <Input label="Número" value={numero} onChange={setNumero} placeholder="CDP-2026-001" />
      <Input label="Fecha" type="date" value={fecha} onChange={setFecha} />
      <RubroSelect rubros={rubros} value={rubroId} onChange={setRubroId} />
      <Input label="Valor" type="number" value={String(valor)} onChange={v => setValor(Number(v))} />
      <Textarea label="Objeto" value={objeto} onChange={setObjeto} />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Actions onClose={onClose} pending={pending} disabled={!numero || !rubroId || !valor || !objeto} onSubmit={() => postJson("/api/admin/psu/cdp", {
        numero, fecha: new Date(fecha).toISOString(), vigencia, rubroId, valor, objeto,
      }, onSaved, setError, start)} />
    </Modal>
  )
}

function RpModal({ cdps, terceros, onClose, onSaved }: { cdps: Cdp[]; terceros: Tercero[]; onClose: () => void; onSaved: () => void }) {
  const [numero, setNumero] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [cdpId, setCdpId] = useState("")
  const [terceroId, setTerceroId] = useState("")
  const [valor, setValor] = useState(0)
  const [objeto, setObjeto] = useState("")
  const [pending, start] = useTransition()
  const [error, setError] = useState("")

  return (
    <Modal title="Nuevo RP (compromiso)" onClose={onClose}>
      <Input label="Número" value={numero} onChange={setNumero} placeholder="RP-2026-001" />
      <Input label="Fecha" type="date" value={fecha} onChange={setFecha} />
      <Select label="CDP" value={cdpId} onChange={setCdpId} options={[["", "— seleccione —"], ...cdps.map<[string,string]>(c => [c.id, `${c.numero} · ${c.rubro.codigo} · ${fmt(Number(c.valor))}`])]} />
      <Select label="Tercero (opcional)" value={terceroId} onChange={setTerceroId} options={[["", "—"], ...terceros.map<[string,string]>(t => [t.id, `${t.documento} · ${t.razonSocial}`])]} />
      <Input label="Valor" type="number" value={String(valor)} onChange={v => setValor(Number(v))} />
      <Textarea label="Objeto" value={objeto} onChange={setObjeto} />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Actions onClose={onClose} pending={pending} disabled={!numero || !cdpId || !valor || !objeto} onSubmit={() => postJson("/api/admin/psu/rp", {
        numero, fecha: new Date(fecha).toISOString(), cdpId, terceroId: terceroId || null, valor, objeto,
      }, onSaved, setError, start)} />
    </Modal>
  )
}

function ObligacionModal({ rps, onClose, onSaved }: { rps: Rp[]; onClose: () => void; onSaved: () => void }) {
  const [numero, setNumero] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [rpId, setRpId] = useState("")
  const [valor, setValor] = useState(0)
  const [concepto, setConcepto] = useState("")
  const [pending, start] = useTransition()
  const [error, setError] = useState("")

  return (
    <Modal title="Nueva obligación" onClose={onClose}>
      <Input label="Número" value={numero} onChange={setNumero} placeholder="OBL-2026-001" />
      <Input label="Fecha" type="date" value={fecha} onChange={setFecha} />
      <Select label="RP" value={rpId} onChange={setRpId} options={[["", "— seleccione —"], ...rps.map<[string,string]>(r => [r.id, `${r.numero} · ${r.tercero?.razonSocial ?? "—"} · ${fmt(Number(r.valor))}`])]} />
      <Input label="Valor" type="number" value={String(valor)} onChange={v => setValor(Number(v))} />
      <Textarea label="Concepto" value={concepto} onChange={setConcepto} />
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Actions onClose={onClose} pending={pending} disabled={!numero || !rpId || !valor || !concepto} onSubmit={() => postJson("/api/admin/psu/obligaciones", {
        numero, fecha: new Date(fecha).toISOString(), rpId, valor, concepto,
      }, onSaved, setError, start)} />
    </Modal>
  )
}

function PagoModal({ cuentasBanco, onClose, onSaved }: { cuentasBanco: CuentaPuc[]; onClose: () => void; onSaved: () => void }) {
  const [numero, setNumero] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [obligacionId, setObligacionId] = useState("")
  const [valor, setValor] = useState(0)
  const [medioPago, setMedioPago] = useState<'TRANSFERENCIA' | 'CHEQUE' | 'EFECTIVO' | 'OTRO'>("TRANSFERENCIA")
  const [referencia, setReferencia] = useState("")
  const [cuentaBancoId, setCuentaBancoId] = useState("")
  const [generarComp, setGenerarComp] = useState(true)
  const [pending, start] = useTransition()
  const [error, setError] = useState("")

  return (
    <Modal title="Registrar pago" onClose={onClose} wide>
      <div className="grid grid-cols-2 gap-2">
        <Input label="Número" value={numero} onChange={setNumero} placeholder="PG-2026-001" />
        <Input label="Fecha" type="date" value={fecha} onChange={setFecha} />
      </div>
      <Input label="Obligación ID (cuid)" value={obligacionId} onChange={setObligacionId} placeholder="Pegar id de la obligación" />
      <div className="grid grid-cols-2 gap-2">
        <Input label="Valor" type="number" value={String(valor)} onChange={v => setValor(Number(v))} />
        <Select label="Medio de pago" value={medioPago} onChange={v => setMedioPago(v as typeof medioPago)} options={[["TRANSFERENCIA","Transferencia"],["CHEQUE","Cheque"],["EFECTIVO","Efectivo"],["OTRO","Otro"]]} />
      </div>
      <Input label="Referencia" value={referencia} onChange={setReferencia} placeholder="Egreso/Cheque #" />
      <Select label="Cuenta de banco (PUC)" value={cuentaBancoId} onChange={setCuentaBancoId} options={[["", "—"], ...cuentasBanco.map<[string,string]>(c => [c.id, `${c.codigo} · ${c.nombre}`])]} />
      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={generarComp} onChange={e => setGenerarComp(e.target.checked)} /> Generar comprobante contable automáticamente</label>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <Actions onClose={onClose} pending={pending} disabled={!numero || !obligacionId || !valor} onSubmit={() => postJson("/api/admin/psu/pagos", {
        numero, fecha: new Date(fecha).toISOString(), obligacionId, valor, medioPago,
        referencia: referencia || null,
        cuentaBancoId: cuentaBancoId || null,
        generarComprobante: generarComp,
      }, onSaved, setError, start)} />
    </Modal>
  )
}

// ─── Inputs reusables ────────────────────────────────────────────────────────

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="text-sm block">
      {label}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full border rounded-md px-2 py-1" />
    </label>
  )
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-sm block">
      {label}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className="mt-1 w-full border rounded-md px-2 py-1" />
    </label>
  )
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="text-sm block">
      {label}
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-1 w-full border rounded-md px-2 py-1">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

function RubroSelect({ rubros, value, onChange }: { rubros: Rubro[]; value: string; onChange: (v: string) => void }) {
  return (
    <Select label="Rubro" value={value} onChange={onChange} options={[["", "— seleccione —"], ...rubros.map<[string,string]>(r => [r.id, `${r.codigo} · ${r.nombre}`])]} />
  )
}

function Actions({ onClose, onSubmit, pending, disabled }: { onClose: () => void; onSubmit: () => void; pending: boolean; disabled?: boolean }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border">Cancelar</button>
      <button onClick={onSubmit} disabled={pending || disabled} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50 flex items-center gap-1">
        {pending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
