"use client"

import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, FileText, Gavel, Info, Plus, Loader2, X, Trash2, Globe2, Scale, Map, KeyRound, Copy, CheckCircle2, ClipboardList, Sparkles, AlertTriangle } from "lucide-react"

type Depositario = {
  id: string; tipoPersona: string; nombre: string; documento: string
  email: string | null; telefono: string | null
  fechaAsignacion: string; fechaFin: string | null
  activo: boolean; polizaVigenteHasta: string | null
  ultimoReporte: string | null; observaciones: string | null
}
type Contrato = {
  id: string; numero: string; tipo: string
  contraparteNombre: string; contraparteDocumento: string
  fechaInicio: string; fechaFin: string | null
  canon: number | null; periodicidad: string | null
  estado: string; polizaNumero: string | null; polizaVigenteHasta: string | null
  observaciones: string | null
}
type Destinacion = {
  id: string; tipo: string; fecha: string
  beneficiario: string | null; valorRealizacion: number | null
  actoAdministrativo: string | null; observaciones: string | null
}

type Bien = {
  id: string; codigo: string; tipo: string
  estadoJuridico: string; estadoFisico: string | null
  descripcion: string
  folioMatricula: string | null; placa: string | null
  ubicacion: string | null; latitud: number | null; longitud: number | null
  avaluoVigente: number | null; monedaAvaluo: string | null; fechaAvaluo: string | null
  numeroProceso: string | null; juzgado: string | null
  observaciones: string | null
  depositarios: Depositario[]
  contratos: Contrato[]
  destinacion: Destinacion | null
  expediente: { id: string; codigo: string; nombre: string } | null
  carpetaFisica: { id: string; codigo: string; titulo: string } | null
}

type Tab = "resumen" | "depositarios" | "contratos" | "destinacion" | "reportes" | "interop"

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" })
}
function fmtMoney(v: number | null, m: string | null) {
  if (v == null) return "—"
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: m || "COP", maximumFractionDigits: 0 }).format(v)
}

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gov-blue focus:outline-none text-sm"

export default function BienDetalleClient({ bien, interopActivo, portalActivo }: { bien: Bien; interopActivo: boolean; portalActivo: boolean }) {
  const [tab, setTab] = useState<Tab>("resumen")

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <Link href="/admin/frisco" className="inline-flex items-center gap-2 text-sm text-gov-blue hover:underline">
        <ArrowLeft className="w-4 h-4" /> Volver a FRISCO
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase">Bien {bien.tipo.replaceAll("_", " ")}</p>
            <h1 className="text-2xl font-bold text-gray-800">{bien.codigo}</h1>
            <p className="text-gray-600 mt-1 max-w-2xl">{bien.descripcion}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {bien.estadoJuridico}
            </span>
            {bien.estadoFisico && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                Físico: {bien.estadoFisico}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex border-b text-sm">
          <TabBtn current={tab} value="resumen"      onClick={setTab} icon={<Info className="w-4 h-4" />}    label="Resumen" />
          <TabBtn current={tab} value="depositarios" onClick={setTab} icon={<Users className="w-4 h-4" />}   label={`Depositarios (${bien.depositarios.length})`} />
          <TabBtn current={tab} value="contratos"    onClick={setTab} icon={<FileText className="w-4 h-4" />} label={`Contratos (${bien.contratos.length})`} />
          <TabBtn current={tab} value="destinacion"  onClick={setTab} icon={<Gavel className="w-4 h-4" />}    label="Destinación" />
          {portalActivo && (
            <TabBtn current={tab} value="reportes" onClick={setTab} icon={<ClipboardList className="w-4 h-4" />} label="Reportes" />
          )}
          {interopActivo && (
            <TabBtn current={tab} value="interop" onClick={setTab} icon={<Globe2 className="w-4 h-4" />} label="Interop" />
          )}
        </div>

        <div className="p-5">
          {tab === "resumen"      && <Resumen bien={bien} />}
          {tab === "depositarios" && <DepositariosTab bien={bien} portalActivo={portalActivo} />}
          {tab === "contratos"    && <ContratosTab bien={bien} />}
          {tab === "destinacion"  && <DestinacionTab bien={bien} />}
          {tab === "reportes"     && portalActivo && <ReportesTab bienId={bien.id} />}
          {tab === "interop"      && interopActivo && <InteropTab bien={bien} />}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ current, value, onClick, icon, label }: {
  current: Tab; value: Tab; onClick: (t: Tab) => void; icon: React.ReactNode; label: string
}) {
  const active = current === value
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-3 inline-flex items-center gap-2 border-b-2 transition-colors ${
        active ? "border-gov-blue text-gov-blue font-semibold" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}{label}
    </button>
  )
}

function Resumen({ bien }: { bien: Bien }) {
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
      <Row k="Folio de matrícula" v={bien.folioMatricula} />
      <Row k="Placa" v={bien.placa} />
      <Row k="Avalúo vigente" v={fmtMoney(bien.avaluoVigente, bien.monedaAvaluo)} />
      <Row k="Fecha de avalúo" v={fmtDate(bien.fechaAvaluo)} />
      <Row k="Ubicación" v={bien.ubicacion} />
      <Row k="Coordenadas" v={bien.latitud != null && bien.longitud != null ? `${bien.latitud}, ${bien.longitud}` : null} />
      <Row k="Número de proceso" v={bien.numeroProceso} />
      <Row k="Juzgado" v={bien.juzgado} />
      <Row k="Expediente" v={bien.expediente ? `${bien.expediente.codigo} — ${bien.expediente.nombre}` : null} />
      <Row k="Carpeta física" v={bien.carpetaFisica ? `${bien.carpetaFisica.codigo} — ${bien.carpetaFisica.titulo}` : null} />
      {bien.observaciones && <Row k="Observaciones" v={bien.observaciones} full />}
    </dl>
  )
}

function Row({ k, v, full }: { k: string; v: string | null; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <dt className="text-xs font-medium text-gray-500 uppercase">{k}</dt>
      <dd className="text-gray-800">{v ?? "—"}</dd>
    </div>
  )
}

// ── Depositarios ─────────────────────────────────────────────────────────────

function DepositariosTab({ bien, portalActivo }: { bien: Bien; portalActivo: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [acceso, setAcceso] = useState<{ depositarioId: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este depositario?")) return
    startTransition(async () => {
      const r = await fetch(`/api/admin/frisco/depositarios/${id}`, { method: "DELETE" })
      if (r.ok) router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gov-blue text-white rounded-lg text-sm">
          <Plus className="w-4 h-4" /> Asignar depositario
        </button>
      </div>
      {bien.depositarios.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-sm">Sin depositarios registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-3 py-2 text-left">Nombre / Doc.</th>
                <th className="px-3 py-2 text-left">Tipo</th>
                <th className="px-3 py-2 text-left">Asignación</th>
                <th className="px-3 py-2 text-left">Fin</th>
                <th className="px-3 py-2 text-left">Póliza vigente</th>
                <th className="px-3 py-2 text-left">Último reporte</th>
                <th className="px-3 py-2 text-center">Activo</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bien.depositarios.map(d => (
                <tr key={d.id} className="hover:bg-blue-50/40">
                  <td className="px-3 py-2">
                    <p className="font-medium text-gray-900">{d.nombre}</p>
                    <p className="text-xs text-gray-500">{d.documento}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{d.tipoPersona}</td>
                  <td className="px-3 py-2 text-gray-700">{fmtDate(d.fechaAsignacion)}</td>
                  <td className="px-3 py-2 text-gray-700">{fmtDate(d.fechaFin)}</td>
                  <td className="px-3 py-2 text-gray-700">{fmtDate(d.polizaVigenteHasta)}</td>
                  <td className="px-3 py-2 text-gray-700">{fmtDate(d.ultimoReporte)}</td>
                  <td className="px-3 py-2 text-center">
                    {d.activo ? <span className="text-emerald-600 font-semibold">Sí</span> : <span className="text-slate-400">No</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-1">
                      {portalActivo && (
                        <button
                          onClick={() => setAcceso({ depositarioId: d.id })}
                          title="Generar acceso al portal externo"
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => eliminar(d.id)} disabled={pending} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && <DepositarioForm bienId={bien.id} onClose={() => setOpen(false)} onDone={() => { setOpen(false); router.refresh() }} />}
      {acceso && (
        <PortalAccesoModal
          depositarioId={acceso.depositarioId}
          tieneEmail={!!bien.depositarios.find(d => d.id === acceso.depositarioId)?.email}
          onClose={() => { setAcceso(null); router.refresh() }}
        />
      )}
    </div>
  )
}

function PortalAccesoModal({ depositarioId, tieneEmail, onClose }: {
  depositarioId: string; tieneEmail: boolean; onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [enviarEmail, setEnviarEmail] = useState(tieneEmail)
  const [dias, setDias] = useState(90)
  const [result, setResult] = useState<{ url: string; expiraEn: string; emailOk: boolean | null; emailError?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function generar() {
    setError(null)
    startTransition(async () => {
      const r = await fetch(`/api/admin/frisco/depositarios/${depositarioId}/portal-acceso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diasVigencia: dias, enviarEmail }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setError(j.error || `Error HTTP ${r.status}`); return }
      setResult({
        url:      j.portalUrl,
        expiraEn: j.acceso.expiraEn,
        emailOk:  j.emailEnviado?.ok ?? null,
        emailError: j.emailEnviado?.error,
      })
    })
  }

  async function copiar() {
    if (!result) return
    await navigator.clipboard.writeText(result.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal title="Acceso al portal de depositario" onClose={onClose}>
      {!result ? (
        <div className="space-y-3">
          <p className="text-gray-700">
            Se generará un enlace personal para que el depositario consulte el bien y registre sus reportes mensuales. Cualquier acceso anterior queda revocado.
          </p>
          <Lbl t="Vigencia (días)">
            <input
              type="number" min={1} max={365} value={dias}
              onChange={(e) => setDias(Number(e.target.value))}
              className={inputCls}
            />
          </Lbl>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enviarEmail} onChange={(e) => setEnviarEmail(e.target.checked)} disabled={!tieneEmail} />
            Enviar enlace por email {!tieneEmail && <span className="text-xs text-gray-400">(depositario sin email)</span>}
          </label>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2 border-t mt-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
            <button onClick={generar} disabled={pending} className="px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium disabled:opacity-60 inline-flex items-center gap-2">
              {pending && <Loader2 className="w-4 h-4 animate-spin" />} Generar acceso
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded text-xs">
            Este enlace sólo se muestra una vez. Cópielo ahora si necesita conservarlo.
          </div>
          <div className="flex items-center gap-2">
            <input readOnly value={result.url} className={`${inputCls} font-mono text-xs`} onFocus={(e) => e.currentTarget.select()} />
            <button onClick={copiar} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 inline-flex items-center gap-1">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-gray-600">Vigente hasta {new Date(result.expiraEn).toLocaleString("es-CO")}.</p>
          {result.emailOk === true && <p className="text-xs text-emerald-700">Email enviado al depositario.</p>}
          {result.emailOk === false && <p className="text-xs text-red-600">No se pudo enviar el email: {result.emailError}</p>}
          <div className="flex justify-end pt-2 border-t mt-2">
            <button onClick={onClose} className="px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium">Listo</button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function DepositarioForm({ bienId, onClose, onDone }: { bienId: string; onClose: () => void; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = {
      bienId,
      tipoPersona: fd.get("tipoPersona"),
      nombre:      String(fd.get("nombre") || "").trim(),
      documento:   String(fd.get("documento") || "").trim(),
      email:       (fd.get("email") as string) || undefined,
      telefono:    (fd.get("telefono") as string) || undefined,
      direccion:   (fd.get("direccion") as string) || undefined,
      fechaAsignacion: new Date(String(fd.get("fechaAsignacion"))).toISOString(),
      polizaVigenteHasta: fd.get("polizaVigenteHasta")
        ? new Date(String(fd.get("polizaVigenteHasta"))).toISOString()
        : undefined,
    }
    Object.keys(payload).forEach(k => (payload[k] === "" || payload[k] === undefined) && delete payload[k])
    startTransition(async () => {
      const r = await fetch("/api/admin/frisco/depositarios", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(j.error || "Error"); return }
      onDone()
    })
  }

  return (
    <Modal title="Asignar depositario" onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Lbl t="Tipo persona *"><select name="tipoPersona" required className={inputCls} defaultValue="NATURAL">
          <option value="NATURAL">Natural</option><option value="JURIDICA">Jurídica</option>
        </select></Lbl>
        <Lbl t="Documento *"><input name="documento" required className={inputCls} /></Lbl>
        <Lbl t="Nombre / Razón social *" full><input name="nombre" required minLength={2} className={inputCls} /></Lbl>
        <Lbl t="Email"><input name="email" type="email" className={inputCls} /></Lbl>
        <Lbl t="Teléfono"><input name="telefono" className={inputCls} /></Lbl>
        <Lbl t="Dirección" full><input name="direccion" className={inputCls} /></Lbl>
        <Lbl t="Fecha de asignación *"><input name="fechaAsignacion" type="date" required className={inputCls} /></Lbl>
        <Lbl t="Póliza vigente hasta"><input name="polizaVigenteHasta" type="date" className={inputCls} /></Lbl>
        {err && <div className="md:col-span-2 text-sm text-red-600">{err}</div>}
        <FooterBtns pending={pending} onClose={onClose} />
      </form>
    </Modal>
  )
}

// ── Contratos ────────────────────────────────────────────────────────────────

function ContratosTab({ bien }: { bien: Bien }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este contrato?")) return
    startTransition(async () => {
      const r = await fetch(`/api/admin/frisco/contratos/${id}`, { method: "DELETE" })
      if (r.ok) router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gov-blue text-white rounded-lg text-sm">
          <Plus className="w-4 h-4" /> Nuevo contrato
        </button>
      </div>
      {bien.contratos.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-sm">Sin contratos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-3 py-2 text-left">N° / Tipo</th>
                <th className="px-3 py-2 text-left">Contraparte</th>
                <th className="px-3 py-2 text-left">Vigencia</th>
                <th className="px-3 py-2 text-right">Canon</th>
                <th className="px-3 py-2 text-center">Estado</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bien.contratos.map(c => (
                <tr key={c.id} className="hover:bg-blue-50/40">
                  <td className="px-3 py-2">
                    <p className="font-medium text-gray-900">{c.numero}</p>
                    <p className="text-xs text-gray-500">{c.tipo}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-gray-800">{c.contraparteNombre}</p>
                    <p className="text-xs text-gray-500">{c.contraparteDocumento}</p>
                  </td>
                  <td className="px-3 py-2 text-gray-700">{fmtDate(c.fechaInicio)} → {fmtDate(c.fechaFin)}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmtMoney(c.canon, null)} {c.periodicidad ? `/${c.periodicidad}` : ""}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">{c.estado}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => eliminar(c.id)} disabled={pending} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && <ContratoForm bienId={bien.id} onClose={() => setOpen(false)} onDone={() => { setOpen(false); router.refresh() }} />}
    </div>
  )
}

function ContratoForm({ bienId, onClose, onDone }: { bienId: string; onClose: () => void; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = {
      bienId,
      numero:               String(fd.get("numero") || "").trim(),
      tipo:                 fd.get("tipo"),
      contraparteNombre:    String(fd.get("contraparteNombre") || "").trim(),
      contraparteDocumento: String(fd.get("contraparteDocumento") || "").trim(),
      contraparteEmail:     (fd.get("contraparteEmail") as string) || undefined,
      contraparteTelefono:  (fd.get("contraparteTelefono") as string) || undefined,
      fechaInicio:          new Date(String(fd.get("fechaInicio"))).toISOString(),
      fechaFin: fd.get("fechaFin") ? new Date(String(fd.get("fechaFin"))).toISOString() : undefined,
      canon:        fd.get("canon") ? Number(fd.get("canon")) : undefined,
      periodicidad: (fd.get("periodicidad") as string) || undefined,
      estado:       (fd.get("estado") as string) || undefined,
      polizaNumero: (fd.get("polizaNumero") as string) || undefined,
    }
    Object.keys(payload).forEach(k => (payload[k] === "" || payload[k] === undefined) && delete payload[k])
    startTransition(async () => {
      const r = await fetch("/api/admin/frisco/contratos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(j.error || "Error"); return }
      onDone()
    })
  }

  return (
    <Modal title="Nuevo contrato" onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Lbl t="Número *"><input name="numero" required className={inputCls} /></Lbl>
        <Lbl t="Tipo *"><select name="tipo" required className={inputCls} defaultValue="">
          <option value="" disabled>Seleccione…</option>
          <option value="ARRENDAMIENTO">Arrendamiento</option>
          <option value="ADMINISTRACION">Administración</option>
          <option value="COMODATO">Comodato</option>
          <option value="OTRO">Otro</option>
        </select></Lbl>
        <Lbl t="Contraparte (nombre) *" full><input name="contraparteNombre" required className={inputCls} /></Lbl>
        <Lbl t="Documento contraparte *"><input name="contraparteDocumento" required className={inputCls} /></Lbl>
        <Lbl t="Email contraparte"><input name="contraparteEmail" type="email" className={inputCls} /></Lbl>
        <Lbl t="Teléfono contraparte"><input name="contraparteTelefono" className={inputCls} /></Lbl>
        <Lbl t="Estado"><select name="estado" className={inputCls} defaultValue="VIGENTE">
          <option value="VIGENTE">Vigente</option><option value="VENCIDO">Vencido</option>
          <option value="TERMINADO">Terminado</option><option value="SUSPENDIDO">Suspendido</option>
        </select></Lbl>
        <Lbl t="Fecha de inicio *"><input name="fechaInicio" type="date" required className={inputCls} /></Lbl>
        <Lbl t="Fecha de fin"><input name="fechaFin" type="date" className={inputCls} /></Lbl>
        <Lbl t="Canon"><input name="canon" type="number" step="0.01" min="0" className={inputCls} /></Lbl>
        <Lbl t="Periodicidad"><select name="periodicidad" className={inputCls} defaultValue="">
          <option value="">—</option>
          <option value="MENSUAL">Mensual</option><option value="TRIMESTRAL">Trimestral</option>
          <option value="SEMESTRAL">Semestral</option><option value="ANUAL">Anual</option>
        </select></Lbl>
        <Lbl t="N° de póliza"><input name="polizaNumero" className={inputCls} /></Lbl>
        {err && <div className="md:col-span-2 text-sm text-red-600">{err}</div>}
        <FooterBtns pending={pending} onClose={onClose} />
      </form>
    </Modal>
  )
}

// ── Destinación ──────────────────────────────────────────────────────────────

function DestinacionTab({ bien }: { bien: Bien }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const d = bien.destinacion

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gov-blue text-white rounded-lg text-sm">
          {d ? "Actualizar destinación" : "Registrar destinación"}
        </button>
      </div>
      {!d ? (
        <p className="text-center text-gray-500 py-8 text-sm">Aún no se registra destinación final.</p>
      ) : (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Row k="Tipo" v={d.tipo} />
          <Row k="Fecha" v={fmtDate(d.fecha)} />
          <Row k="Beneficiario" v={d.beneficiario} />
          <Row k="Valor de realización" v={fmtMoney(d.valorRealizacion, null)} />
          <Row k="Acto administrativo" v={d.actoAdministrativo} full />
          {d.observaciones && <Row k="Observaciones" v={d.observaciones} full />}
        </dl>
      )}
      {editing && (
        <DestinacionForm
          bienId={bien.id}
          initial={d}
          onClose={() => setEditing(false)}
          onDone={() => { setEditing(false); router.refresh() }}
        />
      )}
    </div>
  )
}

function DestinacionForm({ bienId, initial, onClose, onDone }:
  { bienId: string; initial: Destinacion | null; onClose: () => void; onDone: () => void }
) {
  const [pending, startTransition] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = {
      bienId,
      tipo:               fd.get("tipo"),
      fecha:              new Date(String(fd.get("fecha"))).toISOString(),
      beneficiario:       (fd.get("beneficiario") as string) || undefined,
      valorRealizacion:   fd.get("valorRealizacion") ? Number(fd.get("valorRealizacion")) : undefined,
      actoAdministrativo: (fd.get("actoAdministrativo") as string) || undefined,
      observaciones:      (fd.get("observaciones") as string) || undefined,
    }
    Object.keys(payload).forEach(k => (payload[k] === "" || payload[k] === undefined) && delete payload[k])
    startTransition(async () => {
      const r = await fetch("/api/admin/frisco/destinaciones", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(j.error || "Error"); return }
      onDone()
    })
  }

  const fechaInicial = initial?.fecha ? new Date(initial.fecha).toISOString().slice(0, 10) : ""

  return (
    <Modal title={initial ? "Actualizar destinación" : "Registrar destinación"} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Lbl t="Tipo *"><select name="tipo" required className={inputCls} defaultValue={initial?.tipo ?? ""}>
          <option value="" disabled>Seleccione…</option>
          <option value="VICTIMAS">Víctimas</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="SUBASTA">Subasta</option>
          <option value="DONACION">Donación</option>
          <option value="DESTRUCCION">Destrucción</option>
          <option value="DEVOLUCION">Devolución</option>
        </select></Lbl>
        <Lbl t="Fecha *"><input name="fecha" type="date" required defaultValue={fechaInicial} className={inputCls} /></Lbl>
        <Lbl t="Beneficiario" full><input name="beneficiario" defaultValue={initial?.beneficiario ?? ""} className={inputCls} /></Lbl>
        <Lbl t="Valor de realización"><input name="valorRealizacion" type="number" step="0.01" min="0" defaultValue={initial?.valorRealizacion ?? ""} className={inputCls} /></Lbl>
        <Lbl t="Acto administrativo"><input name="actoAdministrativo" defaultValue={initial?.actoAdministrativo ?? ""} className={inputCls} /></Lbl>
        <Lbl t="Observaciones" full><textarea name="observaciones" rows={2} defaultValue={initial?.observaciones ?? ""} className={inputCls} /></Lbl>
        {err && <div className="md:col-span-2 text-sm text-red-600">{err}</div>}
        <FooterBtns pending={pending} onClose={onClose} />
      </form>
    </Modal>
  )
}

// ── shared bits ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 text-sm">{children}</div>
      </div>
    </div>
  )
}

function Lbl({ t, full, children }: { t: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-gray-600">{t}</span>
      {children}
    </label>
  )
}

// ── Reportes del depositario (con análisis IA) ───────────────────────────────

type ReporteAdmin = {
  id: string; periodo: string; estadoBien: string; novedades: string
  createdAt: string
  depositario: { id: string; nombre: string; documento: string }
  analisisIA: {
    urgencia: "NORMAL" | "ATENCION" | "CRITICA"
    etiquetas: string[]
    resumen: string
    confianza: number
    modelo: string
    proveedor: string
    revisadoPor: string | null
    revisadoEn: string | null
  } | null
}

function ReportesTab({ bienId }: { bienId: string }) {
  const [reportes, setReportes] = useState<ReporteAdmin[] | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function recargar() {
    startTransition(async () => {
      const r = await fetch(`/api/admin/frisco/bienes/${bienId}/reportes`)
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setError(j.error || "Error al cargar reportes"); return }
      setReportes(j.reportes as ReporteAdmin[])
      setError(null)
    })
  }
  useEffect(() => { recargar() }, [bienId])  // eslint-disable-line react-hooks/exhaustive-deps

  function override(reporteId: string, urgencia: "NORMAL" | "ATENCION" | "CRITICA") {
    startTransition(async () => {
      const r = await fetch(`/api/admin/frisco/reportes/${reporteId}/analisis`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urgencia }),
      })
      if (r.ok) recargar()
    })
  }

  if (reportes == null && !error) return <p className="text-center text-gray-500 py-8 text-sm">Cargando…</p>
  if (error) return <p className="text-center text-red-600 py-8 text-sm">{error}</p>
  if (reportes!.length === 0) return <p className="text-center text-gray-500 py-8 text-sm">Aún no hay reportes recibidos.</p>

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Reportes mensuales recibidos por el portal externo. La urgencia es <strong>sugerida por IA</strong> — el funcionario puede sobreescribirla.
      </p>
      <div className="space-y-3">
        {reportes!.map(r => <ReporteCard key={r.id} reporte={r} onOverride={override} pending={pending} />)}
      </div>
    </div>
  )
}

function ReporteCard({ reporte, onOverride, pending }: {
  reporte: ReporteAdmin
  onOverride: (id: string, urgencia: "NORMAL" | "ATENCION" | "CRITICA") => void
  pending: boolean
}) {
  const a = reporte.analisisIA
  const fueRevisado = !!a?.revisadoEn

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b flex flex-wrap justify-between items-center gap-2">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{reporte.periodo} — {reporte.depositario.nombre}</p>
          <p className="text-xs text-gray-500">{reporte.depositario.documento} · enviado {fmtDate(reporte.createdAt)} · estado físico: {reporte.estadoBien}</p>
        </div>
        {a && (
          <div className="flex items-center gap-2">
            <UrgenciaBadge urgencia={a.urgencia} />
            {fueRevisado && <span className="text-xs text-emerald-700 font-medium">Revisado</span>}
          </div>
        )}
      </div>
      <div className="p-4 text-sm space-y-2">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-1">Novedades del depositario</p>
          <p className="whitespace-pre-wrap text-gray-800">{reporte.novedades}</p>
        </div>
        {a ? (
          <div className="bg-blue-50/50 border border-blue-100 rounded p-3 space-y-1">
            <p className="text-xs font-medium text-blue-900 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Sugerencia IA · {a.proveedor === "fallback" ? "reglas" : a.proveedor} · confianza {Math.round(a.confianza * 100)}%
            </p>
            <p className="text-sm text-gray-800">{a.resumen}</p>
            {a.etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {a.etiquetas.map(e => (
                  <span key={e} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-medium">
                    {e.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-blue-100">
              <span className="text-xs text-gray-600 self-center">Override urgencia:</span>
              {(["NORMAL", "ATENCION", "CRITICA"] as const).map(u => (
                <button
                  key={u}
                  onClick={() => onOverride(reporte.id, u)}
                  disabled={pending || a.urgencia === u}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-default"
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Análisis IA no disponible para este reporte.
          </p>
        )}
      </div>
    </div>
  )
}

function UrgenciaBadge({ urgencia }: { urgencia: "NORMAL" | "ATENCION" | "CRITICA" }) {
  const map = {
    NORMAL:   "bg-emerald-100 text-emerald-700",
    ATENCION: "bg-amber-100 text-amber-700",
    CRITICA:  "bg-red-100 text-red-700",
  } as const
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[urgencia]}`}>
      {urgencia}
    </span>
  )
}

// ── Interoperabilidad ────────────────────────────────────────────────────────

type InteropState = { pending: boolean; data: unknown; error: string | null; latenciaMs: number | null }
const INTEROP_INIT: InteropState = { pending: false, data: null, error: null, latenciaMs: null }

function InteropTab({ bien }: { bien: Bien }) {
  const [snr,      setSnr]      = useState<InteropState>(INTEROP_INIT)
  const [fiscalia, setFiscalia] = useState<InteropState>(INTEROP_INIT)
  const [igac,     setIgac]     = useState<InteropState>(INTEROP_INIT)

  async function consultar(
    setter: (s: InteropState) => void,
    url: string,
    body: Record<string, unknown>,
  ) {
    setter({ ...INTEROP_INIT, pending: true })
    const t0 = performance.now()
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, bienId: bien.id }),
    })
    const j = await r.json().catch(() => ({}))
    const latencia = Math.round(performance.now() - t0)
    if (!r.ok) {
      setter({ pending: false, data: null, error: j.error || `Error HTTP ${r.status}`, latenciaMs: latencia })
      return
    }
    setter({ pending: false, data: j.data, error: null, latenciaMs: j.latenciaMs ?? latencia })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Las respuestas se registran en bitácora de auditoría (FriscoInteropLog). Servicios actualmente en modo stub.
      </p>

      <InteropCard
        title="SNR — Folio de matrícula"
        icon={<Globe2 className="w-4 h-4" />}
        disabled={!bien.folioMatricula}
        disabledReason="El bien no tiene folio de matrícula registrado."
        state={snr}
        onConsult={() => consultar(setSnr, "/api/admin/frisco/interop/snr", { folioMatricula: bien.folioMatricula })}
        renderData={(d) => <SnrRender data={d as SnrData} />}
      />

      <InteropCard
        title="Fiscalía — Proceso de extinción"
        icon={<Scale className="w-4 h-4" />}
        disabled={!bien.numeroProceso}
        disabledReason="El bien no tiene número de proceso registrado."
        state={fiscalia}
        onConsult={() => consultar(setFiscalia, "/api/admin/frisco/interop/fiscalia", { numeroProceso: bien.numeroProceso })}
        renderData={(d) => <FiscaliaRender data={d as FiscaliaData} />}
      />

      <InteropCard
        title="IGAC — Avalúo catastral"
        icon={<Map className="w-4 h-4" />}
        disabled={!bien.folioMatricula}
        disabledReason="Indique un folio de matrícula o cédula catastral para consultar."
        state={igac}
        onConsult={() => consultar(setIgac, "/api/admin/frisco/interop/igac", { folioMatricula: bien.folioMatricula })}
        renderData={(d) => <IgacRender data={d as IgacData} />}
      />
    </div>
  )
}

function InteropCard({
  title, icon, disabled, disabledReason, state, onConsult, renderData,
}: {
  title: string
  icon: React.ReactNode
  disabled: boolean
  disabledReason: string
  state: InteropState
  onConsult: () => void
  renderData: (data: unknown) => React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <h3 className="text-sm font-semibold text-gray-800 inline-flex items-center gap-2">{icon}{title}</h3>
        <button
          onClick={onConsult}
          disabled={disabled || state.pending}
          title={disabled ? disabledReason : undefined}
          className="px-3 py-1.5 bg-gov-blue hover:bg-blue-800 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {state.pending && <Loader2 className="w-3 h-3 animate-spin" />}
          Consultar
        </button>
      </div>
      <div className="p-4 text-sm">
        {disabled && !state.data && !state.error && (
          <p className="text-gray-500 italic">{disabledReason}</p>
        )}
        {state.error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {state.error}
          </div>
        )}
        {state.data != null && (
          <>
            {renderData(state.data)}
            {state.latenciaMs != null && (
              <p className="text-[11px] text-gray-400 mt-2">Latencia: {state.latenciaMs} ms</p>
            )}
          </>
        )}
        {!disabled && !state.data && !state.error && !state.pending && (
          <p className="text-gray-400 italic">Sin consultas en esta sesión.</p>
        )}
      </div>
    </div>
  )
}

type SnrData = {
  folio: string; estado: string; direccion: string | null; area: number | null
  matriculaInmobiliaria: string
  propietarios: Array<{ nombre: string; documento: string; cuota: string }>
  ultimaAnotacion: { fecha: string; descripcion: string } | null
  gravamenes: string[]
}
function SnrRender({ data }: { data: SnrData }) {
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      <Row k="Folio" v={data.folio} />
      <Row k="Estado" v={data.estado} />
      <Row k="Dirección" v={data.direccion} />
      <Row k="Área" v={data.area != null ? `${data.area} m²` : null} />
      <Row k="Propietarios" v={data.propietarios.map(p => `${p.nombre} (${p.documento}, ${p.cuota})`).join(" · ") || null} full />
      <Row k="Última anotación" v={data.ultimaAnotacion ? `${fmtDate(data.ultimaAnotacion.fecha)} — ${data.ultimaAnotacion.descripcion}` : null} full />
      <Row k="Gravámenes" v={data.gravamenes.join(", ") || null} full />
    </dl>
  )
}

type FiscaliaData = {
  numeroProceso: string; estado: string; delito: string; despacho: string
  fechaInicio: string; fechaUltimaActuacion: string | null
  enExtincionDominio: boolean; bienesAsociados: number
}
function FiscaliaRender({ data }: { data: FiscaliaData }) {
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      <Row k="N° proceso" v={data.numeroProceso} />
      <Row k="Estado" v={data.estado} />
      <Row k="Delito" v={data.delito} />
      <Row k="Despacho" v={data.despacho} />
      <Row k="Fecha inicio" v={fmtDate(data.fechaInicio)} />
      <Row k="Última actuación" v={fmtDate(data.fechaUltimaActuacion)} />
      <Row k="Extinción de dominio" v={data.enExtincionDominio ? "Sí" : "No"} />
      <Row k="Bienes asociados" v={String(data.bienesAsociados)} />
    </dl>
  )
}

type IgacData = {
  cedulaCatastral: string; folioMatricula: string | null
  destinoEconomico: string; area: number; avaluoCatastral: number; vigencia: number
  direccion: string | null; municipio: string; departamento: string
}
function IgacRender({ data }: { data: IgacData }) {
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
      <Row k="Cédula catastral" v={data.cedulaCatastral} />
      <Row k="Folio" v={data.folioMatricula} />
      <Row k="Destino económico" v={data.destinoEconomico} />
      <Row k="Área" v={`${data.area} m²`} />
      <Row k="Avalúo catastral" v={fmtMoney(data.avaluoCatastral, "COP")} />
      <Row k="Vigencia" v={String(data.vigencia)} />
      <Row k="Dirección" v={data.direccion} full />
      <Row k="Municipio" v={`${data.municipio}, ${data.departamento}`} />
    </dl>
  )
}

// ── shared ───────────────────────────────────────────────────────────────────

function FooterBtns({ pending, onClose }: { pending: boolean; onClose: () => void }) {
  return (
    <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
      <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
      <button type="submit" disabled={pending} className="px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium disabled:opacity-60 inline-flex items-center gap-2">
        {pending && <Loader2 className="w-4 h-4 animate-spin" />}Guardar
      </button>
    </div>
  )
}
