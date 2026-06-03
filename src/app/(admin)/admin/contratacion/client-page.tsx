"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Loader2, X, ChevronDown, ChevronUp, Paperclip, GitMerge, CalendarClock, Sparkles } from "lucide-react"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Proceso = {
  id: string; numero: string; modalidad: string; estado: string; objeto: string
  vigencia: number; valorEstimado: number; cdpNumero: string | null
  dependencia: string | null; supervisorNombre: string | null
  fechaCierre: string | null; _count: { contratos: number; documentos: number }
}
type Contrato = {
  id: string; numero: string; tipo: string; estado: string
  contratistaNombre: string; contratistaDoc: string
  valorContrato: number; valorAdiciones: number
  fechaSuscripcion: string; fechaTerminacion: string | null
  proceso: { numero: string; objeto: string }
}

const MODALIDAD_LABEL: Record<string, string> = {
  LICITACION_PUBLICA: "Licitación pública",
  SELECCION_ABREVIADA: "Selección abreviada",
  CONCURSO_MERITOS: "Concurso de méritos",
  CONTRATACION_DIRECTA: "Contratación directa",
  MINIMA_CUANTIA: "Mínima cuantía",
  ASOCIACION_PUBLICO_PRIVADA: "APP",
}
const ESTADO_PROCESO_COLOR: Record<string, string> = {
  PLANEACION:   "bg-gray-100 text-gray-700",
  CONVOCATORIA: "bg-blue-100 text-blue-800",
  EVALUACION:   "bg-yellow-100 text-yellow-800",
  ADJUDICADO:   "bg-purple-100 text-purple-800",
  CONTRATADO:   "bg-green-100 text-green-800",
  LIQUIDADO:    "bg-slate-100 text-slate-700",
  DESIERTO:     "bg-orange-100 text-orange-800",
  REVOCADO:     "bg-red-100 text-red-800",
}
const ESTADO_CONTRATO_COLOR: Record<string, string> = {
  SUSCRITO:     "bg-blue-100 text-blue-800",
  EN_EJECUCION: "bg-green-100 text-green-800",
  SUSPENDIDO:   "bg-yellow-100 text-yellow-800",
  TERMINADO:    "bg-slate-100 text-slate-700",
  LIQUIDADO:    "bg-gray-100 text-gray-600",
  INCUMPLIDO:   "bg-red-100 text-red-800",
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Modal Proceso ────────────────────────────────────────────────────────────
function ProcesoModal({ vigenciaActual, onClose, onSave }: {
  vigenciaActual: number; onClose: () => void; onSave: () => void
}) {
  const [form, setForm] = useState({
    numero: "", modalidad: "CONTRATACION_DIRECTA", objeto: "",
    vigencia: vigenciaActual, valorEstimado: "",
    cdpNumero: "", dependencia: "", supervisorNombre: "", supervisorCargo: "",
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [iaLoading, setIaLoading] = useState(false)
  const [iaInfo, setIaInfo] = useState<{ razon: string; confianza: number; proveedor: string } | null>(null)

  async function sugerirIA() {
    if (form.objeto.trim().length < 10 || !form.valorEstimado || Number(form.valorEstimado) <= 0) {
      setErr("Para sugerir con IA, complete el objeto (mín. 10 caracteres) y el valor estimado."); return
    }
    setIaLoading(true); setErr(""); setIaInfo(null)
    try {
      const res = await fetch("/api/admin/contratacion/procesos/sugerir-modalidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: form.objeto, valorEstimado: Number(form.valorEstimado) }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error ?? "Error al sugerir"); return }
      const s = data.sugerencia
      setForm(p => ({
        ...p,
        modalidad: s.modalidad,
        supervisorNombre: s.supervisorNombre || p.supervisorNombre,
      }))
      setIaInfo({ razon: s.razon, confianza: s.confianza, proveedor: s.proveedor })
    } catch {
      setErr("Error de conexión con la IA")
    } finally {
      setIaLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.valorEstimado || Number(form.valorEstimado) <= 0) { setErr("El valor estimado debe ser mayor a 0"); return }
    setLoading(true); setErr("")
    const res = await fetch("/api/admin/contratacion/procesos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        valorEstimado: Number(form.valorEstimado),
        cdpNumero: form.cdpNumero || null,
        dependencia: form.dependencia || null,
        supervisorNombre: form.supervisorNombre || null,
        supervisorCargo: form.supervisorCargo || null,
      }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Error al guardar"); return }
    onSave()
  }

  const f = (k: keyof typeof form, val: string) => setForm(p => ({ ...p, [k]: val }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Nuevo proceso contractual</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Número *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="PC-2025-001" value={form.numero} onChange={e => f('numero', e.target.value)} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">Modalidad *</label>
                <button type="button" onClick={sugerirIA} disabled={iaLoading}
                  className="text-xs inline-flex items-center gap-1 text-violet-600 hover:text-violet-800 disabled:opacity-50">
                  {iaLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Sugerir con IA
                </button>
              </div>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.modalidad} onChange={e => f('modalidad', e.target.value)}>
                {Object.entries(MODALIDAD_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Objeto *</label>
              <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="Contratación de servicios de..." value={form.objeto}
                onChange={e => f('objeto', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vigencia *</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.vigencia} onChange={e => f('vigencia', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor estimado (COP) *</label>
              <input type="number" min="1" step="1" className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="0" value={form.valorEstimado} onChange={e => f('valorEstimado', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">N° CDP</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="CDP-2025-001" value={form.cdpNumero} onChange={e => f('cdpNumero', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dependencia</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Despacho del personero" value={form.dependencia} onChange={e => f('dependencia', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supervisor</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Nombre completo" value={form.supervisorNombre} onChange={e => f('supervisorNombre', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cargo supervisor</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Personero municipal" value={form.supervisorCargo} onChange={e => f('supervisorCargo', e.target.value)} />
            </div>
          </div>
          {iaInfo && (
            <div className="text-xs bg-violet-50 border border-violet-200 rounded-lg px-3 py-2 text-violet-800">
              <span className="inline-flex items-center gap-1 font-medium"><Sparkles className="w-3 h-3" /> Sugerencia IA</span>
              {" "}({Math.round(iaInfo.confianza * 100)}% · {iaInfo.proveedor}): {iaInfo.razon}
              <span className="block text-violet-600 mt-0.5">Revise antes de guardar — la IA sugiere, usted decide.</span>
            </div>
          )}
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Crear proceso
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal Contrato ───────────────────────────────────────────────────────────
function ContratoModal({ proceso, onClose, onSave }: {
  proceso: Proceso; onClose: () => void; onSave: () => void
}) {
  const hoy = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    numero: "", tipo: "PRESTACION_SERVICIOS",
    contratistaNombre: "", contratistaDoc: "", contratistaEmail: "",
    valorContrato: "", plazoMeses: "", fechaSuscripcion: hoy,
    rpNumero: "", supervisorNombre: "", observacion: "",
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr("")
    const res = await fetch("/api/admin/contratacion/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        procesoId: proceso.id,
        numero: form.numero,
        tipo: form.tipo,
        contratistaNombre: form.contratistaNombre,
        contratistaDoc: form.contratistaDoc,
        contratistaEmail: form.contratistaEmail || null,
        valorContrato: Number(form.valorContrato),
        plazoMeses: form.plazoMeses ? Number(form.plazoMeses) : null,
        fechaSuscripcion: new Date(form.fechaSuscripcion + "T12:00:00Z").toISOString(),
        rpNumero: form.rpNumero || null,
        supervisorNombre: form.supervisorNombre || null,
        observacion: form.observacion || null,
      }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Error al guardar"); return }
    onSave()
  }

  const f = (k: keyof typeof form, val: string) => setForm(p => ({ ...p, [k]: val }))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold">Suscribir contrato</h2>
            <p className="text-xs text-gray-500">Proceso {proceso.numero}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Número contrato *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="C-2025-042" value={form.numero} onChange={e => f('numero', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.tipo} onChange={e => f('tipo', e.target.value)}>
                {['PRESTACION_SERVICIOS','COMPRAVENTA','SUMINISTRO','OBRA_PUBLICA','CONSULTORIA','INTERADMINISTRATIVO','CONCESION','ARRENDAMIENTO','COMODATO','CONVENIO','OTRO'].map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Nombre contratista *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="Razón social o nombre completo" value={form.contratistaNombre}
                onChange={e => f('contratistaNombre', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIT / CC *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="900.123.456-7" value={form.contratistaDoc}
                onChange={e => f('contratistaDoc', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email contratista</label>
              <input type="email" className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="correo@empresa.com" value={form.contratistaEmail}
                onChange={e => f('contratistaEmail', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor contrato (COP) *</label>
              <input type="number" min="1" step="1" className="w-full border rounded-lg px-3 py-2 text-sm" required
                placeholder="0" value={form.valorContrato} onChange={e => f('valorContrato', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plazo (meses)</label>
              <input type="number" min="1" className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="6" value={form.plazoMeses} onChange={e => f('plazoMeses', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha suscripción *</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" required
                value={form.fechaSuscripcion} onChange={e => f('fechaSuscripcion', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">N° RP</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="RP-2025-001" value={form.rpNumero} onChange={e => f('rpNumero', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supervisor</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Nombre del supervisor" value={form.supervisorNombre}
                onChange={e => f('supervisorNombre', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Observaciones</label>
              <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.observacion} onChange={e => f('observacion', e.target.value)} />
            </div>
          </div>
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Suscribir contrato
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Modal Documento ──────────────────────────────────────────────────────────
function DocumentoModal({ procesoId, contratoId, onClose, onSave }: {
  procesoId?: string; contratoId?: string; onClose: () => void; onSave: () => void
}) {
  const [form, setForm] = useState({
    tipo: "ESTUDIO_PREVIO", nombre: "", url: "", observacion: "",
    fechaDoc: new Date().toISOString().slice(0, 10),
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr("")
    const res = await fetch("/api/admin/contratacion/documentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        procesoId: procesoId ?? null,
        contratoId: contratoId ?? null,
        tipo: form.tipo,
        nombre: form.nombre,
        url: form.url || null,
        observacion: form.observacion || null,
        fechaDoc: new Date(form.fechaDoc + "T12:00:00Z").toISOString(),
      }),
    })
    setLoading(false)
    if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Error"); return }
    onSave()
  }

  const TIPOS_DOC = ['ESTUDIO_PREVIO','AVISO_CONVOCATORIA','PLIEGO_CONDICIONES','ADENDA','PROPUESTA_OFERENTE','INFORME_EVALUACION','ACTO_ADJUDICACION','CONTRATO','POLIZA','ACTA_INICIO','INFORME_SUPERVISION','ACTA_SUSPENSION','ACTA_REINICIO','ACTA_TERMINACION','ACTA_LIQUIDACION','OTRO']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Agregar documento</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              {TIPOS_DOC.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nombre / descripción *</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" required
              placeholder="Estudio previo y de conveniencia" value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL (SECOP / nube)</label>
            <input type="url" className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://www.secop.gov.co/..." value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha documento</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.fechaDoc} onChange={e => setForm(f => ({ ...f, fechaDoc: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observación</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.observacion} onChange={e => setForm(f => ({ ...f, observacion: e.target.value }))} />
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

// ─── Fila expandible de proceso ───────────────────────────────────────────────
function ProcesoFila({ proceso, onRefresh }: { proceso: Proceso; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [modalContrato, setModalContrato] = useState(false)
  const [modalDoc, setModalDoc] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)

  async function cambiarEstado(estado: string) {
    setCambiandoEstado(true)
    await fetch(`/api/admin/contratacion/procesos/${proceso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    setCambiandoEstado(false)
    onRefresh()
  }

  const ESTADOS_PROCESO = ['PLANEACION','CONVOCATORIA','EVALUACION','ADJUDICADO','CONTRATADO','LIQUIDADO','DESIERTO','REVOCADO']

  return (
    <>
      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            <div>
              <p className="font-medium text-gray-900">{proceso.numero}</p>
              <p className="text-xs text-gray-500">{MODALIDAD_LABEL[proceso.modalidad] ?? proceso.modalidad}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{proceso.objeto}</td>
        <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(proceso.valorEstimado)}</td>
        <td className="px-4 py-3 text-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_PROCESO_COLOR[proceso.estado] ?? 'bg-gray-100'}`}>
            {proceso.estado.replace(/_/g, ' ')}
          </span>
        </td>
        <td className="px-4 py-3 text-center text-sm text-gray-500">
          {proceso._count.contratos} / {proceso._count.documentos}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="bg-gray-50 px-6 py-4 border-b">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-gray-600">Cambiar estado:</span>
                {ESTADOS_PROCESO.map(e => (
                  <button key={e} disabled={cambiandoEstado || proceso.estado === e}
                    onClick={() => cambiarEstado(e)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                      ${proceso.estado === e
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-white text-gray-600'}`}>
                    {e.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={(ev) => { ev.stopPropagation(); setModalContrato(true) }}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700">
                  <Plus className="w-3.5 h-3.5" /> Suscribir contrato
                </button>
                <button onClick={(ev) => { ev.stopPropagation(); setModalDoc(true) }}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700">
                  <Paperclip className="w-3.5 h-3.5" /> Agregar documento
                </button>
              </div>
              {proceso.cdpNumero && (
                <p className="text-xs text-gray-500">CDP: {proceso.cdpNumero} · Dependencia: {proceso.dependencia ?? '—'} · Supervisor: {proceso.supervisorNombre ?? '—'}</p>
              )}
            </div>
          </td>
        </tr>
      )}
      {modalContrato && (
        <tr><td colSpan={5}>
          <ContratoModal proceso={proceso} onClose={() => setModalContrato(false)} onSave={() => { setModalContrato(false); onRefresh() }} />
        </td></tr>
      )}
      {modalDoc && (
        <tr><td colSpan={5}>
          <DocumentoModal procesoId={proceso.id} onClose={() => setModalDoc(false)} onSave={() => { setModalDoc(false); onRefresh() }} />
        </td></tr>
      )}
    </>
  )
}

// ─── Panel de alertas de vencimiento ──────────────────────────────────────────

type AlertaContratoUI = {
  contratoId: string; numero: string; contratista: string
  supervisor: string | null; fechaTerminacion: string; diasRestantes: number
}

function AlertasVencimientoPanel() {
  const [alertas, setAlertas] = useState<AlertaContratoUI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/contratacion/alertas-vencimiento?diasAnticipacion=30")
      .then(r => r.json())
      .then(j => setAlertas(j.alertas ?? []))
      .catch(() => setAlertas([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || alertas.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h2 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
        <CalendarClock className="w-5 h-5" /> Contratos próximos a terminar ({alertas.length})
      </h2>
      <div className="space-y-1.5">
        {alertas.slice(0, 8).map(a => (
          <div key={a.contratoId} className="flex items-center justify-between gap-3 text-sm bg-white rounded-lg px-3 py-2 border border-amber-100">
            <span className="min-w-0 truncate">
              <span className="font-medium">{a.numero}</span>
              <span className="text-slate-500"> — {a.contratista}</span>
              {a.supervisor && <span className="text-slate-400 text-xs"> · Sup: {a.supervisor}</span>}
            </span>
            <span className={`shrink-0 font-semibold ${a.diasRestantes <= 5 ? "text-red-600" : "text-amber-700"}`}>
              {a.diasRestantes < 0 ? "VENCIDO" : `${a.diasRestantes} días`}
            </span>
          </div>
        ))}
        {alertas.length > 8 && (
          <p className="text-xs text-amber-700 pt-1">y {alertas.length - 8} más…</p>
        )}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ContratacionClient({ procesos, contratosRecientes, vigenciaActual, kpis }: {
  procesos: Proceso[]
  contratosRecientes: Contrato[]
  vigenciaActual: number
  kpis: { totalProcesos: number; totalContratos: number; valorTotal: number }
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [modalProceso, setModalProceso] = useState(false)
  const [tab, setTab] = useState<"procesos" | "contratos">("procesos")
  const [filtroEstado, setFiltroEstado] = useState("")

  function refresh() {
    setModalProceso(false)
    startTransition(() => router.refresh())
  }

  const procesosFiltrados = filtroEstado
    ? procesos.filter(p => p.estado === filtroEstado)
    : procesos

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitMerge className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contratación pública</h1>
            <p className="text-sm text-gray-500">Vigencia {vigenciaActual} · Ley 80 / Ley 1150</p>
          </div>
        </div>
        <button onClick={() => setModalProceso(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Nuevo proceso
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Procesos vigencia {vigenciaActual}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{kpis.totalProcesos}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Contratos suscritos (total)</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{kpis.totalContratos}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Valor total contratado</p>
          <p className="text-2xl font-bold mt-1 text-green-700">{fmt(kpis.valorTotal)}</p>
        </div>
      </div>

      <AlertasVencimientoPanel />

      {/* Tabs */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b items-center justify-between px-4">
          <div className="flex">
            {(["procesos", "contratos"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t === "procesos" ? `Procesos (${procesos.length})` : `Contratos recientes`}
              </button>
            ))}
          </div>
          {tab === "procesos" && (
            <select className="border rounded-lg px-2 py-1 text-xs text-gray-600 mr-2"
              value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {['PLANEACION','CONVOCATORIA','EVALUACION','ADJUDICADO','CONTRATADO','LIQUIDADO','DESIERTO','REVOCADO'].map(e => (
                <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
              ))}
            </select>
          )}
        </div>

        {tab === "procesos" && (
          procesosFiltrados.length === 0
            ? <p className="text-center text-sm text-gray-400 py-10">No hay procesos registrados para esta vigencia.</p>
            : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Proceso / Modalidad</th>
                    <th className="px-4 py-3 text-left">Objeto</th>
                    <th className="px-4 py-3 text-right">Valor estimado</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Contratos / Docs</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {procesosFiltrados.map(p => (
                    <ProcesoFila key={p.id} proceso={p} onRefresh={refresh} />
                  ))}
                </tbody>
              </table>
            )
        )}

        {tab === "contratos" && (
          contratosRecientes.length === 0
            ? <p className="text-center text-sm text-gray-400 py-10">Sin contratos registrados.</p>
            : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Número</th>
                    <th className="px-4 py-3 text-left">Contratista</th>
                    <th className="px-4 py-3 text-left">Proceso</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Suscripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contratosRecientes.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{c.numero}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800">{c.contratistaNombre}</p>
                        <p className="text-xs text-gray-400">{c.contratistaDoc}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.proceso.numero}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        {fmt(c.valorContrato + c.valorAdiciones)}
                        {c.valorAdiciones > 0 && (
                          <p className="text-xs text-amber-600">+{fmt(c.valorAdiciones)} adiciones</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_CONTRATO_COLOR[c.estado] ?? 'bg-gray-100'}`}>
                          {c.estado.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs">
                        {fmtDate(c.fechaSuscripcion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        )}
      </div>

      {modalProceso && (
        <ProcesoModal vigenciaActual={vigenciaActual} onClose={() => setModalProceso(false)} onSave={refresh} />
      )}
    </div>
  )
}
