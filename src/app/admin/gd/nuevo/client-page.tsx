"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText, User, Paperclip, CheckCircle,
  ChevronRight, ChevronLeft, ArrowLeft, Eye, Trash2
} from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Depedencia {
  id: string; codigo: string; nombre: string
  series: {
    id: string; codigo: string; nombre: string
    subseries: {
      id: string; codigo: string; nombre: string
      tiposDoc: { id: string; nombre: string; diasTramite: number }[]
    }[]
  }[]
}

interface Props {
  dependencias: Depedencia[]
  tramitadores: { id: string; nombre: string; apellido: string; cargo?: string | null }[]
}

const TIPOS = ["ENTRADA", "SALIDA", "INTERNO", "PQRS", "RESOLUCION", "COMUNICADO"]
const MEDIOS = ["WEB", "PRESENCIAL", "CORREO", "EMAIL_ELECTRONICO", "OFICIO", "OTRO"]
const PRIORIDADES = ["BAJA", "NORMAL", "ALTA", "URGENTE"]

const PASOS = [
  { id: 1, label: "Tipo y Clasificación", icon: FileText },
  { id: 2, label: "Remitente", icon: User },
  { id: 3, label: "Documentos", icon: Paperclip },
  { id: 4, label: "Confirmación", icon: CheckCircle },
]

// ─── Componente ───────────────────────────────────────────────────────────────

export default function NuevoRadicadoClient({ dependencias, tramitadores }: Props) {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  // Formulario
  const [tipo, setTipo] = useState("ENTRADA")
  const [medioRecepcion, setMedioRecepcion] = useState("WEB")
  const [prioridad, setPrioridad] = useState("NORMAL")
  const [asunto, setAsunto] = useState("")
  const [observacion, setObservacion] = useState("")
  const [dependenciaId, setDependenciaId] = useState("")
  const [serieId, setSerieId] = useState("")
  const [subserieId, setSubserieId] = useState("")
  const [tipoDocumentalId, setTipoDocumentalId] = useState("")
  const [tramitadorId, setTramitadorId] = useState("")

  // Remitente
  const [remitenteNombre, setRemitenteNombre] = useState("")
  const [remitenteDoc, setRemitenteDoc] = useState("")
  const [remitenteEmail, setRemitenteEmail] = useState("")
  const [remitenteTel, setRemitenteTel] = useState("")
  const [remitenteDireccion, setRemitenteDireccion] = useState("")
  const [remitenteTipo, setRemitenteTipo] = useState("CIUDADANO")

  // Archivos
  const [archivos, setArchivos] = useState<File[]>([])

  // Derivados
  const depSeleccionada = dependencias.find((d) => d.id === dependenciaId)
  const serieSeleccionada = depSeleccionada?.series.find((s) => s.id === serieId)
  const subserieSeleccionada = serieSeleccionada?.subseries.find((s) => s.id === subserieId)

  // Preview del consecutivo
  async function handlePreview() {
    if (!dependenciaId || !tipo) return
    const dep = dependencias.find((d) => d.id === dependenciaId)
    if (!dep) return
    const res = await fetch(`/api/admin/gd/consecutivo?tipo=${tipo}&codigoDep=${dep.codigo}`)
    const data = await res.json()
    setPreview(data.preview)
  }

  // Enviar
  async function handleSubmit() {
    setLoading(true)
    try {
      // 1. Crear el radicado base
      const res = await fetch("/api/admin/gd/radicados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          medioRecepcion,
          prioridad,
          asunto,
          observacion,
          dependenciaId,
          subserieId: subserieId || null,
          tipoDocumentalId: tipoDocumentalId || null,
          tramitadorId: tramitadorId || null,
          remitente: {
            tipoPersona: remitenteTipo,
            nombre: remitenteNombre,
            documento: remitenteDoc,
            email: remitenteEmail,
            telefono: remitenteTel,
            direccion: remitenteDireccion,
          },
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const radicado = await res.json()

      // 2. Subir archivos si existen
      if (archivos.length > 0) {
        for (let i = 0; i < archivos.length; i++) {
          const file = archivos[i]
          const isPrincipal = i === 0 // El primer archivo se marca como principal
          
          const fd = new FormData()
          fd.append("file", file)
          fd.append("radicadoId", radicado.id)
          fd.append("esPrincipal", isPrincipal ? "true" : "false")
          fd.append("folios", "1") // Por default 1, expandible después

          await fetch("/api/admin/gd/documentos", {
            method: "POST",
            body: fd,
          })
        }
      }

      router.push(`/admin/gd/${radicado.id}`)
    } catch (err: any) {
      alert("Error al crear el radicado o subir archivos: " + (err.message || "Error desconocido"))
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
  const labelCls = "block text-xs text-slate-400 mb-1.5 font-medium"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Nuevo Radicado</h1>
            <p className="text-slate-400 text-xs">El número oficial se generará automáticamente al guardar</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Indicador de pasos */}
        <div className="flex items-center gap-2">
          {PASOS.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => p.id < paso && setPaso(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  paso === p.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : paso > p.id
                    ? "bg-green-700/40 text-green-300"
                    : "bg-white/5 text-slate-500"
                }`}
              >
                <p.icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
              {i < PASOS.length - 1 && <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* ── Paso 1: Tipo y Clasificación ── */}
        {paso === 1 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Tipo y Clasificación TRD</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Tipo de Radicado *</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={inputCls}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Medio de Recepción</label>
                <select value={medioRecepcion} onChange={(e) => setMedioRecepcion(e.target.value)} className={inputCls}>
                  {MEDIOS.map((m) => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Prioridad</label>
                <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className={inputCls}>
                  {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Asunto *</label>
              <input value={asunto} onChange={(e) => setAsunto(e.target.value)}
                placeholder="Describa brevemente el asunto del documento..." className={inputCls} />
            </div>

            {/* Selector TRD */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-slate-300">Clasificación TRD (Archivo General de la Nación)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Dependencia *</label>
                  <select value={dependenciaId}
                    onChange={(e) => { setDependenciaId(e.target.value); setSerieId(""); setSubserieId(""); setTipoDocumentalId("") }}
                    className={inputCls}
                  >
                    <option value="">Seleccionar dependencia...</option>
                    {dependencias.map((d) => <option key={d.id} value={d.id}>{d.codigo} — {d.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Serie</label>
                  <select value={serieId}
                    onChange={(e) => { setSerieId(e.target.value); setSubserieId(""); setTipoDocumentalId("") }}
                    disabled={!depSeleccionada}
                    className={inputCls}
                  >
                    <option value="">Seleccionar serie...</option>
                    {depSeleccionada?.series.map((s) => <option key={s.id} value={s.id}>{s.codigo} — {s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Subserie</label>
                  <select value={subserieId}
                    onChange={(e) => { setSubserieId(e.target.value); setTipoDocumentalId("") }}
                    disabled={!serieSeleccionada}
                    className={inputCls}
                  >
                    <option value="">Seleccionar subserie...</option>
                    {serieSeleccionada?.subseries.map((s) => <option key={s.id} value={s.id}>{s.codigo} — {s.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo Documental</label>
                  <select value={tipoDocumentalId}
                    onChange={(e) => setTipoDocumentalId(e.target.value)}
                    disabled={!subserieSeleccionada}
                    className={inputCls}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {subserieSeleccionada?.tiposDoc.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre} ({t.diasTramite} días)</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Tramitador responsable</label>
              <select value={tramitadorId} onChange={(e) => setTramitadorId(e.target.value)} className={inputCls}>
                <option value="">(Asignado a mí por defecto)</option>
                {tramitadores.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre} {t.apellido}{t.cargo ? ` — ${t.cargo}` : ""}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Observaciones internas</label>
              <textarea value={observacion} onChange={(e) => setObservacion(e.target.value)}
                rows={3} placeholder="Notas internas (no visibles al ciudadano)..." className={inputCls} />
            </div>

            {/* Preview del número */}
            <div className="flex items-center gap-3">
              <button onClick={handlePreview}
                disabled={!dependenciaId}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm text-slate-300 disabled:opacity-40 transition-all"
              >
                <Eye className="w-4 h-4" /> Preview del número
              </button>
              {preview && (
                <span className="font-mono text-cyan-400 text-sm bg-cyan-900/30 px-3 py-1 rounded-lg">
                  {preview}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Paso 2: Remitente ── */}
        {paso === 2 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Datos del Remitente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tipo de Persona *</label>
                <select value={remitenteTipo} onChange={(e) => setRemitenteTipo(e.target.value)} className={inputCls}>
                  {["CIUDADANO", "EMPRESA", "FUNCIONARIO", "ENTIDAD_PUBLICA", "ANONIMO"].map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Nombre completo / Razón social *</label>
                <input value={remitenteNombre} onChange={(e) => setRemitenteNombre(e.target.value)}
                  placeholder="Nombre del remitente..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Número de documento</label>
                <input value={remitenteDoc} onChange={(e) => setRemitenteDoc(e.target.value)}
                  placeholder="CC, NIT, CE..." className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input type="email" value={remitenteEmail} onChange={(e) => setRemitenteEmail(e.target.value)}
                  placeholder="correo@ejemplo.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input value={remitenteTel} onChange={(e) => setRemitenteTel(e.target.value)}
                  placeholder="3001234567" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Dirección</label>
                <input value={remitenteDireccion} onChange={(e) => setRemitenteDireccion(e.target.value)}
                  placeholder="Dirección de residencia o empresa" className={inputCls} />
              </div>
            </div>
          </div>
        )}

        {/* ── Paso 3: Documentos ── */}
        {paso === 3 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Documentos Adjuntos</h2>
            
            <div className="border-2 border-dashed border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors rounded-xl p-8 text-center relative cursor-pointer group">
              <input
                type="file"
                multiple
                title="Seleccionar archivos"
                onChange={(e) => {
                  if (e.target.files) {
                    setArchivos((prev) => [...prev, ...Array.from(e.target.files!)])
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Paperclip className="w-10 h-10 mx-auto text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="text-slate-300 font-medium text-sm mb-1">
                Arrastre y suelte sus documentos aquí o haga clic para explorar
              </p>
              <p className="text-slate-500 text-xs">
                El primer documento será marcado como <span className="font-semibold text-emerald-400">Principal</span>. Los demás como <span className="font-semibold text-slate-400">Anexos</span>.
              </p>
            </div>

            {archivos.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-semibold text-white px-1">Archivos seleccionados ({archivos.length})</p>
                <div className="grid gap-2">
                  {archivos.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg shrink-0 ${i === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50 text-slate-400"}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm text-slate-200 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {i === 0 ? <span className="text-emerald-400 font-medium">Documento principal</span> : "Anexo"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setArchivos((prev) => prev.filter((_, index) => index !== i))}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Paso 4: Confirmación ── */}
        {paso === 4 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">Confirmación del Radicado</h2>
            {preview && (
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4">
                <p className="text-xs text-blue-400 mb-1 font-medium uppercase tracking-wider">Número AGN a asignar</p>
                <p className="font-mono text-2xl font-bold text-cyan-400">{preview}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Tipo", tipo],
                ["Medio de recepción", medioRecepcion.replace("_", " ")],
                ["Prioridad", prioridad],
                ["Asunto", asunto],
                ["Dependencia TRD", depSeleccionada ? `${depSeleccionada.codigo} — ${depSeleccionada.nombre}` : "—"],
                ["Remitente", remitenteNombre || "—"],
                ["Email remitente", remitenteEmail || "—"],
              ].map(([k, v]) => (
                <div key={k} className="bg-white/5 rounded-xl p-3">
                  <p className="text-slate-400 text-xs mb-0.5">{k}</p>
                  <p className="text-white font-medium truncate">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Navegación ── */}
        <div className="flex justify-between">
          <button
            onClick={() => setPaso((p) => Math.max(1, p - 1))}
            disabled={paso === 1}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {paso < 4 ? (
            <button
              onClick={() => {
                if (paso === 1 && dependenciaId) handlePreview()
                setPaso((p) => Math.min(4, p + 1))
              }}
              disabled={paso === 1 && (!asunto || !dependenciaId)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold disabled:opacity-40"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !asunto || !dependenciaId || !remitenteNombre}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-bold disabled:opacity-40 shadow-lg shadow-green-900/30"
            >
              {loading ? "Generando..." : (<><CheckCircle className="w-4 h-4" /> Confirmar y Radicar</>)}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
