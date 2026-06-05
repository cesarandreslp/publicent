"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Users, Calendar, Plus, X, Loader2, Calculator, Banknote, ListChecks, Download, FileText } from "lucide-react"

type Empleado = {
  id: string; documento: string; nombre: string; cargo: string;
  dependencia: string | null; tipoVinculacion: string; activo: boolean; salarioBasico: number;
}
type PeriodoRes = {
  id: string; codigo: string; anio: number; mes: number; estado: string;
  liquidaciones: number; devengado: number; deducciones: number; aportes: number; neto: number;
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

type CuentaPuc = { id: string; codigo: string; nombre: string }

export default function NominaClient({
  empleados, empleadosActivos, periodos, conceptosTotal, cuentasBanco, contabilidadActiva,
}: {
  empleados: Empleado[]; empleadosActivos: number; periodos: PeriodoRes[]; conceptosTotal: number;
  cuentasBanco: CuentaPuc[]; contabilidadActiva: boolean;
}) {
  const router = useRouter()
  const [modal, setModal] = useState<null | 'empleado' | 'periodo' | 'liquidar' | 'pagar' | 'pasivos'>(null)
  const [accionPeriodoId, setAccionPeriodoId] = useState<string | null>(null)
  const accionPeriodo = periodos.find(p => p.id === accionPeriodoId) ?? null
  const ultimo = periodos[0]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Nómina pública</h1>
          <p className="text-sm text-slate-600">Empleados, periodos mensuales y liquidación · {conceptosTotal} conceptos activos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setModal('empleado')} className="px-3 py-2 text-sm rounded-md border flex items-center gap-1">
            <Plus className="w-4 h-4" /> Empleado
          </button>
          <button onClick={() => setModal('periodo')} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white flex items-center gap-1">
            <Plus className="w-4 h-4" /> Periodo
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 bg-slate-50">
          <div className="text-xs text-slate-500">Empleados activos</div>
          <div className="text-lg font-semibold mt-1">{empleadosActivos}</div>
        </div>
        <div className="rounded-lg border p-3 bg-blue-50">
          <div className="text-xs text-slate-500">Último periodo</div>
          <div className="text-lg font-semibold mt-1">{ultimo?.codigo ?? "—"}</div>
        </div>
        <div className="rounded-lg border p-3 bg-emerald-50">
          <div className="text-xs text-slate-500">Neto pagado último periodo</div>
          <div className="text-lg font-semibold mt-1">{ultimo ? fmt(ultimo.neto) : "—"}</div>
        </div>
        <div className="rounded-lg border p-3 bg-violet-50">
          <div className="text-xs text-slate-500">Aportes patronales último periodo</div>
          <div className="text-lg font-semibold mt-1">{ultimo ? fmt(ultimo.aportes) : "—"}</div>
        </div>
      </div>

      {/* Periodos */}
      <section className="bg-white rounded-lg border">
        <header className="p-4 border-b flex items-center gap-2">
          <Calendar className="w-5 h-5" /> <h2 className="font-semibold">Periodos</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">Código</th><th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Liquidaciones</th>
                <th className="px-3 py-2 text-right">Devengado</th>
                <th className="px-3 py-2 text-right">Deducciones</th>
                <th className="px-3 py-2 text-right">Neto</th>
                <th className="px-3 py-2 text-right">Aportes</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {periodos.length === 0 && (
                <tr><td colSpan={8} className="p-4 text-center text-slate-500">Sin periodos. Crea el primero con &quot;+ Periodo&quot;.</td></tr>
              )}
              {periodos.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{p.codigo}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      p.estado === 'ABIERTO' ? 'bg-amber-100 text-amber-700' :
                      p.estado === 'LIQUIDADO' ? 'bg-blue-100 text-blue-700' :
                      p.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>{p.estado}</span>
                  </td>
                  <td className="px-3 py-2 text-right">{p.liquidaciones}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt(p.devengado)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt(p.deducciones)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmt(p.neto)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-600">{fmt(p.aportes)}</td>
                  <td className="px-3 py-2">
                    {p.estado === 'ABIERTO' && (
                      <button onClick={() => { setAccionPeriodoId(p.id); setModal('liquidar') }}
                        className="px-2 py-1 text-xs bg-violet-600 text-white rounded flex items-center gap-1">
                        <Calculator className="w-3 h-3" /> Liquidar
                      </button>
                    )}
                    {p.estado === 'LIQUIDADO' && contabilidadActiva && (
                      <button onClick={() => { setAccionPeriodoId(p.id); setModal('pagar') }}
                        className="px-2 py-1 text-xs bg-emerald-600 text-white rounded flex items-center gap-1">
                        <Banknote className="w-3 h-3" /> Pagar
                      </button>
                    )}
                    {(p.estado === 'PAGADO' || p.estado === 'CERRADO') && contabilidadActiva && (
                      <button onClick={() => { setAccionPeriodoId(p.id); setModal('pasivos') }}
                        className="px-2 py-1 text-xs bg-amber-600 text-white rounded flex items-center gap-1">
                        <ListChecks className="w-3 h-3" /> Pasivos
                      </button>
                    )}
                    {p.estado === 'LIQUIDADO' && !contabilidadActiva && (
                      <span className="text-xs text-slate-400">Activa contabilidad para pagar</span>
                    )}
                    {p.estado !== 'ABIERTO' && (
                      <a href={`/api/admin/nom/pila?periodoId=${p.id}`}
                        className="ml-1 px-2 py-1 text-xs bg-slate-700 text-white rounded inline-flex items-center gap-1">
                        <Download className="w-3 h-3" /> PILA
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Empleados */}
      <section className="bg-white rounded-lg border">
        <header className="p-4 border-b flex items-center gap-2">
          <Users className="w-5 h-5" /> <h2 className="font-semibold">Empleados</h2>
          <span className="text-xs text-slate-500 ml-auto">{empleados.length} registros</span>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-600">
              <tr>
                <th className="px-3 py-2">Documento</th><th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Cargo</th><th className="px-3 py-2">Vinculación</th>
                <th className="px-3 py-2 text-right">Salario básico</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2 text-right">Certificado</th>
              </tr>
            </thead>
            <tbody>
              {empleados.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-slate-500">Sin empleados. Registra el primero con &quot;+ Empleado&quot;.</td></tr>
              )}
              {empleados.map(e => (
                <tr key={e.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{e.documento}</td>
                  <td className="px-3 py-2">{e.nombre}</td>
                  <td className="px-3 py-2">{e.cargo}{e.dependencia ? ` · ${e.dependencia}` : ''}</td>
                  <td className="px-3 py-2 text-xs">{e.tipoVinculacion}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt(e.salarioBasico)}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${e.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {e.activo ? 'Activo' : 'Retirado'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <a href={`/api/admin/nom/certificado-retenciones?empleadoId=${e.id}&anio=${new Date().getFullYear() - 1}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded inline-flex items-center gap-1 hover:bg-slate-200">
                      <FileText className="w-3 h-3" /> {new Date().getFullYear() - 1}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modal === 'empleado' && <EmpleadoModal onClose={() => setModal(null)} onSaved={() => router.refresh()} />}
      {modal === 'periodo' && <PeriodoModal onClose={() => setModal(null)} onSaved={() => router.refresh()} />}
      {modal === 'liquidar' && accionPeriodo && (
        <LiquidarModal periodoId={accionPeriodo.id}
          onClose={() => { setModal(null); setAccionPeriodoId(null) }}
          onSaved={() => router.refresh()} />
      )}
      {modal === 'pagar' && accionPeriodo && (
        <PagarModal periodo={accionPeriodo} cuentasBanco={cuentasBanco}
          onClose={() => { setModal(null); setAccionPeriodoId(null) }}
          onSaved={() => router.refresh()} />
      )}
      {modal === 'pasivos' && accionPeriodo && (
        <PasivosModal periodo={accionPeriodo} cuentasBanco={cuentasBanco}
          onClose={() => { setModal(null); setAccionPeriodoId(null) }}
          onSaved={() => router.refresh()} />
      )}
    </div>
  )
}

// ─── Modales ────────────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-12 p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-xl w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="px-4 py-3 border-b flex items-center">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

function EmpleadoModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  function submit(fd: FormData) {
    start(async () => {
      setErr(null)
      const body = {
        documento: String(fd.get('documento')),
        tipoDocumento: String(fd.get('tipoDocumento')),
        primerNombre: String(fd.get('primerNombre')),
        primerApellido: String(fd.get('primerApellido')),
        segundoNombre: fd.get('segundoNombre') ? String(fd.get('segundoNombre')) : null,
        segundoApellido: fd.get('segundoApellido') ? String(fd.get('segundoApellido')) : null,
        cargo: String(fd.get('cargo')),
        dependencia: fd.get('dependencia') ? String(fd.get('dependencia')) : null,
        tipoVinculacion: String(fd.get('tipoVinculacion')),
        fechaIngreso: new Date(String(fd.get('fechaIngreso'))).toISOString(),
        salarioBasico: Number(fd.get('salarioBasico')),
        codigoEPS: fd.get('codigoEPS') ? String(fd.get('codigoEPS')) : null,
        codigoAFP: fd.get('codigoAFP') ? String(fd.get('codigoAFP')) : null,
        codigoARL: fd.get('codigoARL') ? String(fd.get('codigoARL')) : null,
        codigoCajaComp: fd.get('codigoCajaComp') ? String(fd.get('codigoCajaComp')) : null,
        claseRiesgoARL: fd.get('claseRiesgoARL') ? Number(fd.get('claseRiesgoARL')) : null,
      }
      const r = await fetch('/api/admin/nom/empleados', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) { setErr((await r.json()).error ?? 'Error'); return }
      onSaved(); onClose()
    })
  }

  return (
    <ModalShell title="Registrar empleado" onClose={onClose}>
      <form action={submit} className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <label>Documento <input name="documento" required className="w-full border rounded p-2" /></label>
          <label>Tipo doc
            <select name="tipoDocumento" required className="w-full border rounded p-2">
              <option value="CC">CC</option><option value="CE">CE</option><option value="PA">PA</option><option value="NIT">NIT</option><option value="TI">TI</option>
            </select>
          </label>
          <label>Primer nombre <input name="primerNombre" required className="w-full border rounded p-2" /></label>
          <label>Segundo nombre <input name="segundoNombre" className="w-full border rounded p-2" /></label>
          <label>Primer apellido <input name="primerApellido" required className="w-full border rounded p-2" /></label>
          <label>Segundo apellido <input name="segundoApellido" className="w-full border rounded p-2" /></label>
          <label className="col-span-2">Cargo <input name="cargo" required className="w-full border rounded p-2" /></label>
          <label className="col-span-2">Dependencia <input name="dependencia" className="w-full border rounded p-2" /></label>
          <label>Vinculación
            <select name="tipoVinculacion" required className="w-full border rounded p-2">
              <option value="PLANTA">PLANTA</option>
              <option value="TRABAJADOR_OFICIAL">TRABAJADOR_OFICIAL</option>
              <option value="CONTRATISTA">CONTRATISTA</option>
              <option value="SUPERNUMERARIO">SUPERNUMERARIO</option>
              <option value="APRENDIZ">APRENDIZ</option>
            </select>
          </label>
          <label>Fecha de ingreso <input name="fechaIngreso" type="date" required className="w-full border rounded p-2" /></label>
          <label className="col-span-2">Salario básico <input name="salarioBasico" type="number" min={1} step={1000} required className="w-full border rounded p-2" /></label>
        </div>

        <fieldset className="border-t pt-3 mt-1">
          <legend className="text-xs font-semibold text-slate-500 mb-2">Códigos PILA (UGPP) — para el archivo plano de aportes</legend>
          <div className="grid grid-cols-2 gap-3">
            <label>Código EPS <input name="codigoEPS" placeholder="EPS037" className="w-full border rounded p-2" /></label>
            <label>Código AFP <input name="codigoAFP" placeholder="230301" className="w-full border rounded p-2" /></label>
            <label>Código ARL <input name="codigoARL" placeholder="14-1" className="w-full border rounded p-2" /></label>
            <label>Código Caja <input name="codigoCajaComp" placeholder="CCF21" className="w-full border rounded p-2" /></label>
            <label className="col-span-2">Clase de riesgo ARL (1–5)
              <input name="claseRiesgoARL" type="number" min={1} max={5} placeholder="1" className="w-full border rounded p-2" />
            </label>
          </div>
        </fieldset>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancelar</button>
          <button disabled={pending} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function PeriodoModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const now = new Date()
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  function submit(fd: FormData) {
    start(async () => {
      setErr(null)
      const body = { anio: Number(fd.get('anio')), mes: Number(fd.get('mes')) }
      const r = await fetch('/api/admin/nom/periodos', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) { setErr((await r.json()).error ?? 'Error'); return }
      onSaved(); onClose()
    })
  }

  return (
    <ModalShell title="Crear periodo" onClose={onClose}>
      <form action={submit} className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <label>Año <input name="anio" type="number" defaultValue={now.getFullYear()} required className="w-full border rounded p-2" /></label>
          <label>Mes <input name="mes" type="number" min={1} max={12} defaultValue={now.getMonth() + 1} required className="w-full border rounded p-2" /></label>
        </div>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancelar</button>
          <button disabled={pending} className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-1">
            {pending && <Loader2 className="w-4 h-4 animate-spin" />} Crear
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function LiquidarModal({ periodoId, onClose, onSaved }: { periodoId: string; onClose: () => void; onSaved: () => void }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const [resumen, setResumen] = useState<any>(null)

  function submit(fd: FormData) {
    start(async () => {
      setErr(null); setResumen(null)
      const body = { periodoId, diasLiquidados: Number(fd.get('diasLiquidados') || 30) }
      const r = await fetch('/api/admin/nom/liquidar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json()
      if (!r.ok) { setErr(j.error ?? 'Error'); return }
      setResumen(j.resumen)
      onSaved()
    })
  }

  return (
    <ModalShell title="Liquidar periodo" onClose={onClose}>
      {resumen ? (
        <div className="space-y-3 text-sm">
          <p className="text-emerald-700 font-medium">✓ {resumen.liquidadas} empleados liquidados</p>
          <ul className="text-xs space-y-1 text-slate-600">
            <li>Devengado: {fmt(resumen.totalDevengado)}</li>
            <li>Deducciones: {fmt(resumen.totalDeducciones)}</li>
            <li>Aportes patronales: {fmt(resumen.totalAportes)}</li>
            <li className="font-semibold text-slate-900">Neto: {fmt(resumen.totalNeto)}</li>
          </ul>
          <div className="flex justify-end">
            <button onClick={onClose} className="px-3 py-2 border rounded">Cerrar</button>
          </div>
        </div>
      ) : (
        <form action={submit} className="space-y-3 text-sm">
          <label>Días liquidados <input name="diasLiquidados" type="number" min={1} max={31} defaultValue={30} className="w-full border rounded p-2" /></label>
          <p className="text-xs text-slate-600">Se aplicará el catálogo de conceptos vigente a todos los empleados activos al cierre del periodo.</p>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancelar</button>
            <button disabled={pending} className="px-3 py-2 bg-violet-600 text-white rounded flex items-center gap-1">
              {pending && <Loader2 className="w-4 h-4 animate-spin" />} Liquidar
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  )
}

function PagarModal({ periodo, cuentasBanco, onClose, onSaved }: {
  periodo: PeriodoRes; cuentasBanco: CuentaPuc[];
  onClose: () => void; onSaved: () => void;
}) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const [resultado, setResultado] = useState<any>(null)

  function submit(fd: FormData) {
    start(async () => {
      setErr(null); setResultado(null)
      const body = {
        periodoId: periodo.id,
        numero: String(fd.get('numero')),
        fecha: new Date(String(fd.get('fecha'))).toISOString(),
        cuentaBancoId: String(fd.get('cuentaBancoId')),
      }
      const r = await fetch('/api/admin/nom/pagar', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json()
      if (!r.ok) { setErr(j.error ?? 'Error'); return }
      setResultado(j)
      onSaved()
    })
  }

  const hoy = new Date().toISOString().slice(0, 10)

  return (
    <ModalShell title={`Pagar nómina ${periodo.codigo}`} onClose={onClose}>
      {resultado ? (
        <div className="space-y-3 text-sm">
          <p className="text-emerald-700 font-medium">✓ Comprobante {resultado.comprobante.numero} generado</p>
          <ul className="text-xs space-y-1 text-slate-600">
            <li>Empleados: {resultado.empleados}</li>
            <li>Asientos: {resultado.asientos}</li>
            <li>Total débito: {fmt(resultado.totalDebito)}</li>
            <li>Total crédito: {fmt(resultado.totalCredito)}</li>
            <li>Neto pagado al banco: {fmt(resultado.totalNeto)}</li>
            <li>Deducciones a terceros: {fmt(resultado.totalDeducciones)}</li>
          </ul>
          <p className="text-xs text-slate-500">El periodo quedó marcado como PAGADO y cada liquidación apunta al comprobante.</p>
          <div className="flex justify-end">
            <button onClick={onClose} className="px-3 py-2 border rounded">Cerrar</button>
          </div>
        </div>
      ) : (
        <form action={submit} className="space-y-3 text-sm">
          <div className="rounded-md bg-slate-50 border p-3 text-xs space-y-1">
            <div>Empleados a pagar: <b>{periodo.liquidaciones}</b></div>
            <div>Neto del periodo: <b>{fmt(periodo.neto)}</b></div>
            <div>Deducciones del periodo: <b>{fmt(periodo.deducciones)}</b></div>
          </div>
          <label>Número del comprobante
            <input name="numero" required defaultValue={`NOM-${periodo.codigo}`} className="w-full border rounded p-2 font-mono" />
          </label>
          <label>Fecha de pago
            <input name="fecha" type="date" required defaultValue={hoy} className="w-full border rounded p-2" />
          </label>
          <label>Cuenta bancaria (PUC 111*)
            <select name="cuentaBancoId" required className="w-full border rounded p-2">
              <option value="">— Selecciona —</option>
              {cuentasBanco.map(c => (
                <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>
              ))}
            </select>
          </label>
          <p className="text-xs text-slate-500">Se generará un único comprobante de egreso agregando todas las liquidaciones del periodo. El neto se descuenta del banco; las deducciones del empleado y aportes patronales quedan como pasivos (2505/2510/2425/2436) para pagarlas en obligaciones posteriores.</p>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancelar</button>
            <button disabled={pending} className="px-3 py-2 bg-emerald-600 text-white rounded flex items-center gap-1">
              {pending && <Loader2 className="w-4 h-4 animate-spin" />} Pagar
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  )
}

// ─── Pasivos del periodo ─────────────────────────────────────────────────────

type PasivoFila = { cuentaCodigo: string; cuentaNombre: string; generado: number; pagado: number; saldo: number }
type PagoPasivo = { id: string; cuentaCodigo: string; tercero: string; terceroNit: string | null; valor: number; fecha: string; comprobanteId: string | null; observacion: string | null }

function PasivosModal({ periodo, cuentasBanco, onClose, onSaved }: {
  periodo: PeriodoRes; cuentasBanco: CuentaPuc[];
  onClose: () => void; onSaved: () => void;
}) {
  const [filas, setFilas] = useState<PasivoFila[]>([])
  const [pagos, setPagos] = useState<PagoPasivo[]>([])
  const [totalSaldo, setTotalSaldo] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pagarFila, setPagarFila] = useState<PasivoFila | null>(null)

  async function cargar() {
    setLoading(true)
    const r = await fetch(`/api/admin/nom/pasivos-pendientes?periodoId=${periodo.id}`)
    const j = await r.json()
    if (r.ok) {
      setFilas(j.filas ?? [])
      setPagos(j.pagos ?? [])
      setTotalSaldo(j.totalSaldo ?? 0)
    }
    setLoading(false)
  }

  useEffect(() => { void cargar() }, [periodo.id])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-12 p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-3xl w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <header className="px-4 py-3 border-b flex items-center">
          <h3 className="font-semibold">Pasivos de nómina — {periodo.codigo}</h3>
          <button onClick={cargar} className="ml-auto mr-2 text-xs px-2 py-1 border rounded">Refrescar</button>
          <button onClick={onClose} className="text-slate-500"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-4 space-y-4 text-sm">
          {pagarFila ? (
            <PagarPasivoForm fila={pagarFila} periodo={periodo} cuentasBanco={cuentasBanco}
              onCancel={() => setPagarFila(null)}
              onSaved={async () => { setPagarFila(null); await cargar(); onSaved() }}
            />
          ) : (
            <>
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs">
                <b>Saldo total pendiente:</b> {fmt(totalSaldo)} · Cancela cada pasivo eligiendo el tercero receptor (EPS, AFP, ARL, DIAN, parafiscales).
              </div>
              {loading && <p className="text-xs text-slate-500">Cargando…</p>}
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-600">
                  <tr>
                    <th className="px-2 py-1 text-left">Cuenta</th>
                    <th className="px-2 py-1 text-left">Nombre</th>
                    <th className="px-2 py-1 text-right">Generado</th>
                    <th className="px-2 py-1 text-right">Pagado</th>
                    <th className="px-2 py-1 text-right">Saldo</th>
                    <th className="px-2 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {filas.length === 0 && !loading && (
                    <tr><td colSpan={6} className="p-3 text-center text-slate-500">No hay pasivos generados. ¿El periodo ya se pagó?</td></tr>
                  )}
                  {filas.map(f => (
                    <tr key={f.cuentaCodigo} className="border-t">
                      <td className="px-2 py-1 font-mono">{f.cuentaCodigo}</td>
                      <td className="px-2 py-1">{f.cuentaNombre}</td>
                      <td className="px-2 py-1 text-right tabular-nums">{fmt(f.generado)}</td>
                      <td className="px-2 py-1 text-right tabular-nums text-emerald-700">{fmt(f.pagado)}</td>
                      <td className="px-2 py-1 text-right tabular-nums font-semibold">{fmt(f.saldo)}</td>
                      <td className="px-2 py-1 text-right">
                        {f.saldo > 0.5 ? (
                          <button onClick={() => setPagarFila(f)} className="px-2 py-1 text-xs bg-emerald-600 text-white rounded">Pagar</button>
                        ) : (
                          <span className="text-xs text-slate-400">✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagos.length > 0 && (
                <section>
                  <h4 className="font-semibold text-xs text-slate-700 mb-1">Pagos registrados</h4>
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-2 py-1 text-left">Cuenta</th>
                        <th className="px-2 py-1 text-left">Tercero</th>
                        <th className="px-2 py-1 text-left">Fecha</th>
                        <th className="px-2 py-1 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map(p => (
                        <tr key={p.id} className="border-t">
                          <td className="px-2 py-1 font-mono">{p.cuentaCodigo}</td>
                          <td className="px-2 py-1">{p.tercero}{p.terceroNit ? ` · NIT ${p.terceroNit}` : ''}</td>
                          <td className="px-2 py-1">{new Date(p.fecha).toLocaleDateString('es-CO')}</td>
                          <td className="px-2 py-1 text-right tabular-nums">{fmt(Number(p.valor))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PagarPasivoForm({ fila, periodo, cuentasBanco, onCancel, onSaved }: {
  fila: PasivoFila; periodo: PeriodoRes; cuentasBanco: CuentaPuc[];
  onCancel: () => void; onSaved: () => void;
}) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  const hoy = new Date().toISOString().slice(0, 10)

  function submit(fd: FormData) {
    start(async () => {
      setErr(null)
      const body = {
        periodoId: periodo.id,
        cuentaCodigo: fila.cuentaCodigo,
        tercero: String(fd.get('tercero')),
        terceroNit: fd.get('terceroNit') ? String(fd.get('terceroNit')) : null,
        valor: Number(fd.get('valor')),
        fecha: new Date(String(fd.get('fecha'))).toISOString(),
        cuentaBancoId: String(fd.get('cuentaBancoId')),
        numero: String(fd.get('numero')),
        observacion: fd.get('observacion') ? String(fd.get('observacion')) : null,
      }
      const r = await fetch('/api/admin/nom/pagar-pasivo', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      if (!r.ok) { setErr((await r.json()).error ?? 'Error'); return }
      onSaved()
    })
  }

  return (
    <form action={submit} className="space-y-3 text-sm">
      <div className="rounded-md bg-slate-50 border p-3 text-xs">
        <div>Cuenta: <b>{fila.cuentaCodigo}</b> · {fila.cuentaNombre}</div>
        <div>Saldo disponible: <b>{fmt(fila.saldo)}</b></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2">Tercero (EPS / AFP / DIAN / …)
          <input name="tercero" required className="w-full border rounded p-2" />
        </label>
        <label>NIT (opcional)
          <input name="terceroNit" className="w-full border rounded p-2" />
        </label>
        <label>Fecha
          <input name="fecha" type="date" required defaultValue={hoy} className="w-full border rounded p-2" />
        </label>
        <label>Valor a pagar
          <input name="valor" type="number" step={1} min={1} max={fila.saldo} required defaultValue={fila.saldo} className="w-full border rounded p-2" />
        </label>
        <label>Número del comprobante
          <input name="numero" required defaultValue={`PP-${periodo.codigo}-${fila.cuentaCodigo}`} className="w-full border rounded p-2 font-mono text-xs" />
        </label>
        <label className="col-span-2">Cuenta banco (PUC 111*)
          <select name="cuentaBancoId" required className="w-full border rounded p-2">
            <option value="">— Selecciona —</option>
            {cuentasBanco.map(c => <option key={c.id} value={c.id}>{c.codigo} · {c.nombre}</option>)}
          </select>
        </label>
        <label className="col-span-2">Observación
          <input name="observacion" className="w-full border rounded p-2" />
        </label>
      </div>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">Cancelar</button>
        <button disabled={pending} className="px-3 py-2 bg-emerald-600 text-white rounded flex items-center gap-1">
          {pending && <Loader2 className="w-4 h-4 animate-spin" />} Pagar
        </button>
      </div>
    </form>
  )
}
