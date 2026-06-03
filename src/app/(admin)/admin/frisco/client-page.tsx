"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Building2, Plus, Search, ChevronRight, X, Loader2, Sparkles, ShieldAlert } from "lucide-react"

type Bien = {
  id: string
  codigo: string
  tipo: string
  estadoJuridico: string
  estadoFisico: string | null
  descripcion: string
  folioMatricula: string | null
  placa: string | null
  avaluoVigente: number | null
  monedaAvaluo: string | null
  ubicacion: string | null
  createdAt: string
  _count: { depositarios: number; contratos: number }
  destinacion: { tipo: string; fecha: string } | null
}

type Kpis = { total: number; enProceso: number; cautelar: number; extinto: number; devuelto: number }

const TIPOS_BIEN = [
  "INMUEBLE_URBANO", "INMUEBLE_RURAL", "VEHICULO", "SEMOVIENTE",
  "ESTABLECIMIENTO_COMERCIO", "EMBARCACION", "AERONAVE", "OBRA_ARTE",
  "TITULO_VALOR", "EMPRESA", "OTRO",
] as const

const ESTADOS_JURIDICOS = ["EN_PROCESO", "CAUTELAR", "EXTINTO", "DEVUELTO"] as const

function fmtMoney(v: number | null, moneda: string | null) {
  if (v == null) return "—"
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda || "COP", maximumFractionDigits: 0 }).format(v)
}

function badgeEstado(estado: string) {
  const map: Record<string, string> = {
    EN_PROCESO: "bg-amber-100 text-amber-700",
    CAUTELAR:   "bg-blue-100 text-blue-700",
    EXTINTO:    "bg-emerald-100 text-emerald-700",
    DEVUELTO:   "bg-slate-200 text-slate-700",
  }
  return map[estado] ?? "bg-slate-100 text-slate-700"
}

export default function FriscoDashboardClient({
  kpis,
  bienesIniciales,
}: {
  kpis: Kpis
  bienesIniciales: Bien[]
}) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState<string>("")
  const [estadoFiltro, setEstadoFiltro] = useState<string>("")
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = bienesIniciales.filter(b => {
    if (tipoFiltro && b.tipo !== tipoFiltro) return false
    if (estadoFiltro && b.estadoJuridico !== estadoFiltro) return false
    if (q) {
      const qq = q.toLowerCase()
      return (
        b.codigo.toLowerCase().includes(qq) ||
        b.descripcion.toLowerCase().includes(qq) ||
        (b.placa?.toLowerCase().includes(qq) ?? false) ||
        (b.folioMatricula?.toLowerCase().includes(qq) ?? false)
      )
    }
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gov-blue" />
            FRISCO — Bienes intervenidos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Registro y administración de bienes con extinción de dominio o medida cautelar.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Registrar bien
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Total bienes" value={kpis.total} color="text-gov-blue" />
        <KpiCard label="En proceso"   value={kpis.enProceso} color="text-amber-600" />
        <KpiCard label="Cautelar"     value={kpis.cautelar}  color="text-blue-600" />
        <KpiCard label="Extinto"      value={kpis.extinto}   color="text-emerald-600" />
        <KpiCard label="Devuelto"     value={kpis.devuelto}  color="text-slate-600" />
      </div>

      <AlertasPolizasPanel />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por código, descripción, placa o folio..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gov-blue"
            />
          </div>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_BIEN.map(t => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
          </select>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
          >
            <option value="">Todos los estados</option>
            {ESTADOS_JURIDICOS.map(e => <option key={e} value={e}>{e.replaceAll("_", " ")}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Código / Descripción</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3 text-center">Estado jurídico</th>
                <th className="px-6 py-3 text-right">Avalúo</th>
                <th className="px-6 py-3 text-center">Depos. / Contr.</th>
                <th className="px-6 py-3 text-center">Destinación</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-blue-50/40">
                  <td className="px-6 py-3">
                    <p className="font-semibold text-gray-900">{b.codigo}</p>
                    <p className="text-gray-500 text-xs truncate max-w-[260px]" title={b.descripcion}>
                      {b.descripcion}
                    </p>
                  </td>
                  <td className="px-6 py-3 text-gray-700">{b.tipo.replaceAll("_", " ")}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeEstado(b.estadoJuridico)}`}>
                      {b.estadoJuridico}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-700">
                    {fmtMoney(b.avaluoVigente, b.monedaAvaluo)}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-700">
                    {b._count.depositarios} / {b._count.contratos}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-700">
                    {b.destinacion ? b.destinacion.tipo : "—"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link
                      href={`/admin/frisco/bienes/${b.id}`}
                      className="inline-flex items-center gap-1 text-gov-blue hover:text-blue-800 font-medium py-1 px-2 rounded-lg hover:bg-blue-50"
                    >
                      Detalle <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No se encontraron bienes con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <NuevoBienModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

type AlertaPolizaUI = {
  depositarioId: string; depositario: string; email: string | null
  bienCodigo: string; bienTipo: string; polizaVigenteHasta: string; diasRestantes: number
}

function AlertasPolizasPanel() {
  const [alertas, setAlertas] = useState<AlertaPolizaUI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/frisco/alertas-polizas?diasAnticipacion=30")
      .then(r => r.json())
      .then(j => setAlertas(j.alertas ?? []))
      .catch(() => setAlertas([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (alertas.length === 0) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <h2 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
        <ShieldAlert className="w-5 h-5" /> Pólizas próximas a vencer ({alertas.length})
      </h2>
      <div className="space-y-1.5">
        {alertas.slice(0, 8).map(a => (
          <div key={a.depositarioId} className="flex items-center justify-between gap-3 text-sm bg-white rounded-lg px-3 py-2 border border-amber-100">
            <span className="min-w-0">
              <span className="font-medium">{a.bienCodigo}</span>
              <span className="text-slate-500"> — {a.depositario}</span>
            </span>
            <span className={`shrink-0 font-semibold ${a.diasRestantes <= 5 ? "text-red-600" : "text-amber-700"}`}>
              {a.diasRestantes < 0 ? "VENCIDA" : `${a.diasRestantes} días`}
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

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  )
}

function NuevoBienModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [analizando, setAnalizando] = useState(false)
  const [iaBadge, setIaBadge] = useState<string | null>(null)

  // Campos que la IA puede rellenar (controlados)
  const [campos, setCampos] = useState({
    tipo: "", folioMatricula: "", placa: "", numeroProceso: "", ubicacion: "", descripcion: "",
  })
  const set = (k: string, v: string) => setCampos(c => ({ ...c, [k]: v }))

  async function sugerirConIA() {
    if (campos.descripcion.length < 10) return
    setAnalizando(true)
    setIaBadge(null)
    try {
      const res = await fetch("/api/admin/frisco/bienes/ia-sugerir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: campos.descripcion }),
      })
      if (!res.ok) return
      const { sugerencia } = await res.json()
      setCampos(c => ({
        ...c,
        tipo:          sugerencia.tipo          ?? c.tipo,
        folioMatricula: sugerencia.folioMatricula ?? c.folioMatricula,
        placa:          sugerencia.placa          ?? c.placa,
        numeroProceso:  sugerencia.numeroProceso  ?? c.numeroProceso,
        ubicacion:      sugerencia.ubicacion      ?? c.ubicacion,
      }))
      setIaBadge(`IA (${sugerencia.proveedor}, confianza ${Math.round((sugerencia.confianza ?? 0) * 100)}%)`)
    } finally {
      setAnalizando(false)
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const payload: Record<string, unknown> = {
      codigo:         String(fd.get("codigo") || "").trim(),
      tipo:           campos.tipo || undefined,
      descripcion:    campos.descripcion.trim(),
      estadoJuridico: fd.get("estadoJuridico") || undefined,
      folioMatricula: campos.folioMatricula || undefined,
      placa:          campos.placa || undefined,
      ubicacion:      campos.ubicacion || undefined,
      avaluoVigente:  fd.get("avaluoVigente") ? Number(fd.get("avaluoVigente")) : undefined,
      numeroProceso:  campos.numeroProceso || undefined,
      juzgado:        (fd.get("juzgado") as string) || undefined,
    }
    Object.keys(payload).forEach(k => (payload[k] === "" || payload[k] === undefined) && delete payload[k])

    startTransition(async () => {
      const res = await fetch("/api/admin/frisco/bienes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "Error al crear bien")
        return
      }
      onCreated()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Registrar bien</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Field label="Código *">
            <input name="codigo" required maxLength={60} className={inputCls} />
          </Field>
          <Field label="Tipo *">
            <select
              value={campos.tipo}
              onChange={e => set("tipo", e.target.value)}
              required className={inputCls}
            >
              <option value="" disabled>Seleccione…</option>
              {TIPOS_BIEN.map(t => <option key={t} value={t}>{t.replaceAll("_", " ")}</option>)}
            </select>
          </Field>

          {/* Descripción + botón IA */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Descripción *</span>
              <button
                type="button"
                onClick={sugerirConIA}
                disabled={analizando || campos.descripcion.length < 10}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-40 transition"
              >
                {analizando
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Sparkles className="w-3 h-3" />
                }
                {analizando ? "Analizando…" : "Sugerir con IA"}
              </button>
            </div>
            <textarea
              required minLength={3} maxLength={5000} rows={3}
              value={campos.descripcion}
              onChange={e => set("descripcion", e.target.value)}
              placeholder="Describe el bien para que la IA sugiera tipo, placa, folio y más…"
              className={inputCls}
            />
            {iaBadge && (
              <p className="text-xs text-violet-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Campos sugeridos por {iaBadge} — revisa antes de guardar
              </p>
            )}
          </div>

          <Field label="Estado jurídico">
            <select name="estadoJuridico" className={inputCls} defaultValue="EN_PROCESO">
              {ESTADOS_JURIDICOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="Folio de matrícula">
            <input value={campos.folioMatricula} onChange={e => set("folioMatricula", e.target.value)} maxLength={60} className={inputCls} />
          </Field>
          <Field label="Placa">
            <input value={campos.placa} onChange={e => set("placa", e.target.value)} maxLength={20} className={inputCls} />
          </Field>
          <Field label="Avalúo vigente (COP)">
            <input name="avaluoVigente" type="number" step="0.01" min="0" className={inputCls} />
          </Field>
          <Field label="Ubicación" full>
            <input value={campos.ubicacion} onChange={e => set("ubicacion", e.target.value)} maxLength={500} className={inputCls} />
          </Field>
          <Field label="Número de proceso">
            <input value={campos.numeroProceso} onChange={e => set("numeroProceso", e.target.value)} maxLength={80} className={inputCls} />
          </Field>
          <Field label="Juzgado">
            <input name="juzgado" maxLength={200} className={inputCls} />
          </Field>

          {error && (
            <div className="md:col-span-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white rounded-lg text-sm font-medium disabled:opacity-60 inline-flex items-center gap-2"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-1 focus:ring-gov-blue focus:outline-none"

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  )
}
