"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import { Building2, ShieldCheck, CalendarCheck, AlertCircle, Loader2, CheckCircle2, Upload, X, FileImage, FileText } from "lucide-react"

type Bien = {
  id: string; codigo: string; descripcion: string; tipo: string
  folioMatricula: string | null; placa: string | null
  ubicacion: string | null; estadoJuridico: string; estadoFisico: string | null
}
type Depositario = {
  id: string; nombre: string; documento: string
  fechaAsignacion: string; fechaFin: string | null
  polizaVigenteHasta: string | null; ultimoReporte: string | null
}
type Reporte = {
  id: string; periodo: string; estadoBien: string
  novedades: string; fotoUrl: string | null; adjuntoUrl: string | null; createdAt: string
}
type Data = {
  depositario: Depositario; bien: Bien; reportes: Reporte[]
  expiraEn: string; periodoActual: string; yaReporto: boolean
}

const ESTADOS_FISICOS = ["BUENO", "REGULAR", "MALO", "PERDIDO", "DESTRUIDO"] as const

function fmtDate(s: string | null) {
  if (!s) return "—"
  return new Date(s).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "2-digit" })
}

type UploadState = { url: string; nombre: string } | null

export default function PortalDepositarioClient({ token, data }: { token: string; data: Data }) {
  const router = useRouter()
  const [submitted, setSubmitted]   = useState(data.yaReporto)
  const [error, setError]           = useState<string | null>(null)
  const [pending, startTransition]  = useTransition()
  const [fotoUpload, setFotoUpload]     = useState<UploadState>(null)
  const [adjUpload, setAdjUpload]       = useState<UploadState>(null)
  const [uploadingFoto, setUploadingFoto]   = useState(false)
  const [uploadingAdj, setUploadingAdj]     = useState(false)
  const [uploadErrorFoto, setUploadErrorFoto] = useState<string | null>(null)
  const [uploadErrorAdj, setUploadErrorAdj]   = useState<string | null>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)
  const adjInputRef  = useRef<HTMLInputElement>(null)

  async function handleFileUpload(
    file: File,
    tipo: "foto" | "adjunto"
  ) {
    const setUploading = tipo === "foto" ? setUploadingFoto : setUploadingAdj
    const setResult    = tipo === "foto" ? setFotoUpload    : setAdjUpload
    const setErr       = tipo === "foto" ? setUploadErrorFoto : setUploadErrorAdj

    setUploading(true)
    setErr(null)
    setResult(null)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const r = await fetch(`/api/portal/frisco/${token}/upload`, { method: "POST", body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setErr(j.error || `Error al subir (${r.status})`); return }
      setResult({ url: j.url as string, nombre: file.name })
    } catch {
      setErr("Error de conexión al subir el archivo.")
    } finally {
      setUploading(false)
    }
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const payload = {
      estadoBien: fd.get("estadoBien"),
      novedades:  String(fd.get("novedades") || "").trim(),
      fotoUrl:    fotoUpload?.url ?? undefined,
      adjuntoUrl: adjUpload?.url  ?? undefined,
    }
    startTransition(async () => {
      const r = await fetch(`/api/portal/frisco/${token}/reporte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setError(j.error || `Error HTTP ${r.status}`); return }
      setSubmitted(true)
      router.refresh()
    })
  }

  const polizaVencida =
    data.depositario.polizaVigenteHasta &&
    new Date(data.depositario.polizaVigenteHasta).getTime() < Date.now()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <p className="text-xs uppercase tracking-wider text-blue-200">Portal de depositario</p>
          <h1 className="text-2xl font-bold">FRISCO — Seguimiento del bien custodiado</h1>
          <p className="text-blue-100 text-sm mt-1">Acceso vigente hasta {fmtDate(data.expiraEn)}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Datos del depositario */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" /> Sus datos como custodio
              </h2>
              <p className="text-slate-600 mt-1">{data.depositario.nombre} — {data.depositario.documento}</p>
            </div>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 mt-4 text-sm">
            <Row k="Inicio de custodia" v={fmtDate(data.depositario.fechaAsignacion)} />
            <Row k="Fin previsto" v={fmtDate(data.depositario.fechaFin)} />
            <Row k="Último reporte" v={fmtDate(data.depositario.ultimoReporte)} />
            <Row k="Póliza vigente hasta" v={fmtDate(data.depositario.polizaVigenteHasta)} />
          </dl>
          {polizaVencida && (
            <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded text-sm inline-flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Su póliza venció. Por favor renuévela.
            </div>
          )}
        </section>

        {/* Bien custodiado */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" /> Bien bajo su custodia
          </h2>
          <p className="text-slate-600 mt-1">{data.bien.codigo} — {data.bien.tipo.replaceAll("_", " ")}</p>
          <p className="text-slate-700 mt-1">{data.bien.descripcion}</p>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
            <Row k="Folio de matrícula" v={data.bien.folioMatricula} />
            <Row k="Placa" v={data.bien.placa} />
            <Row k="Ubicación" v={data.bien.ubicacion} full />
            <Row k="Estado jurídico" v={data.bien.estadoJuridico} />
            <Row k="Estado físico registrado" v={data.bien.estadoFisico} />
          </dl>
        </section>

        {/* Reporte mensual */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-700" /> Reporte mensual — {data.periodoActual}
          </h2>
          {submitted ? (
            <div className="mt-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded inline-flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> El reporte de este mes ya fue registrado.
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600">Estado actual del bien *</span>
                <select name="estadoBien" required defaultValue="" className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50">
                  <option value="" disabled>Seleccione…</option>
                  {ESTADOS_FISICOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </label>

              {/* Upload foto */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600">Foto del bien (opcional)</span>
                {fotoUpload ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <FileImage className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 text-xs truncate flex-1">{fotoUpload.nombre}</span>
                    <button type="button" onClick={() => { setFotoUpload(null); if (fotoInputRef.current) fotoInputRef.current.value = "" }}
                      className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploadingFoto
                      ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      : <Upload className="w-4 h-4 text-slate-400" />}
                    <span className="text-slate-500 text-xs">{uploadingFoto ? "Subiendo…" : "Seleccionar imagen (JPG, PNG, PDF · máx 10 MB)"}</span>
                    <input ref={fotoInputRef} type="file" className="hidden"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      disabled={uploadingFoto}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "foto") }} />
                  </label>
                )}
                {uploadErrorFoto && <p className="text-red-600 text-xs">{uploadErrorFoto}</p>}
              </div>

              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs font-medium text-slate-600">Novedades *</span>
                <textarea name="novedades" required minLength={5} maxLength={4000} rows={4}
                  placeholder="Detalle cualquier novedad: daños, intentos de ocupación, requerimientos de mantenimiento, etc."
                  className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50" />
              </label>

              {/* Upload adjunto */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs font-medium text-slate-600">Documento adjunto (opcional)</span>
                {adjUpload ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 text-xs truncate flex-1">{adjUpload.nombre}</span>
                    <button type="button" onClick={() => { setAdjUpload(null); if (adjInputRef.current) adjInputRef.current.value = "" }}
                      className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    {uploadingAdj
                      ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      : <Upload className="w-4 h-4 text-slate-400" />}
                    <span className="text-slate-500 text-xs">{uploadingAdj ? "Subiendo…" : "Seleccionar archivo (imágenes o PDF · máx 10 MB)"}</span>
                    <input ref={adjInputRef} type="file" className="hidden"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      disabled={uploadingAdj}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "adjunto") }} />
                  </label>
                )}
                {uploadErrorAdj && <p className="text-red-600 text-xs">{uploadErrorAdj}</p>}
              </div>
              {error && (
                <div className="md:col-span-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
              )}
              <div className="md:col-span-2 flex justify-end pt-2 border-t">
                <button type="submit" disabled={pending || uploadingFoto || uploadingAdj}
                  className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg font-medium disabled:opacity-60 inline-flex items-center gap-2">
                  {pending && <Loader2 className="w-4 h-4 animate-spin" />} Enviar reporte
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Historial */}
        {data.reportes.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="text-lg font-semibold text-slate-800">Historial de reportes</h2>
            <ul className="mt-3 divide-y">
              {data.reportes.map(r => (
                <li key={r.id} className="py-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{r.periodo}</span>
                    <span className="text-slate-500">Estado: {r.estadoBien}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{r.novedades}</p>
                  {(r.fotoUrl || r.adjuntoUrl) && (
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {r.fotoUrl && (
                        <a href={r.fotoUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-700 underline">
                          <FileImage className="w-3.5 h-3.5" /> Ver foto
                        </a>
                      )}
                      {r.adjuntoUrl && (
                        <a href={r.adjuntoUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-700 underline">
                          <FileText className="w-3.5 h-3.5" /> Ver adjunto
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="text-center text-xs text-slate-500 pt-4">
          Este enlace es personal e intransferible. Si no es usted, ignore esta página.
        </footer>
      </main>
    </div>
  )
}

function Row({ k, v, full }: { k: string; v: string | null; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-3" : ""}>
      <dt className="text-xs font-medium text-slate-500 uppercase">{k}</dt>
      <dd className="text-slate-800">{v ?? "—"}</dd>
    </div>
  )
}
