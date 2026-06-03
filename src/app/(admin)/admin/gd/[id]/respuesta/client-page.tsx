"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, PenTool, CheckCircle } from "lucide-react"
import { BlockEditor } from "@/components/admin/editor/block-editor"

type RadicadoOrigen = any // Lo simplificamos para la interfaz
type Plantilla = any
type Dependencia = any

interface Props {
  radicadoOrigen: RadicadoOrigen
  plantillas: Plantilla[]
  dependencias: Dependencia[]
}

export default function RespuestaRadicadoClient({ radicadoOrigen, plantillas, dependencias }: Props) {
  const router = useRouter()
  
  // Estado del formulario
  const [plantillaId, setPlantillaId] = useState("")
  const [contenido, setContenido] = useState("<p>Escriba su respuesta aquí...</p>")
  const [asunto, setAsunto] = useState(`Respuesta a: ${radicadoOrigen.asunto}`)
  
  // TRD
  const [dependenciaId, setDependenciaId] = useState(radicadoOrigen.dependenciaId || "")
  const [serieId, setSerieId] = useState("")
  const [subserieId, setSubserieId] = useState("")
  const [tipoDocumentalId, setTipoDocumentalId] = useState("")
  
  const [loading, setLoading] = useState(false)

  // Actualizar contenido cuando cambia la plantilla
  useEffect(() => {
    if (plantillaId) {
      const p = plantillas.find(x => x.id === plantillaId)
      if (p) setContenido(p.contenido)
    }
  }, [plantillaId, plantillas])

  const depSeleccionada = dependencias.find((d: any) => d.id === dependenciaId)
  const serieSeleccionada = depSeleccionada?.series.find((s: any) => s.id === serieId)
  const subserieSeleccionada = serieSeleccionada?.subseries.find((s: any) => s.id === subserieId)

  async function handleSubmit() {
    if (!dependenciaId || !contenido || contenido === "<p></p>") {
      alert("Por favor complete los campos obligatorios (Dependencia y Contenido)")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/gd/firmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          radicadoOrigenId: radicadoOrigen.id,
          asunto,
          contenidoHtml: contenido,
          trd: {
            dependenciaId,
            subserieId: subserieId || null,
            tipoDocumentalId: tipoDocumentalId || null
          }
        })
      })

      if (!res.ok) throw new Error(await res.text())
      
      const data = await res.json()
      // Redirigir al nuevo radicado de salida
      router.push(`/admin/gd/${data.nuevoRadicadoId}`)
    } catch (err: any) {
      alert("Error al generar la firma: " + err.message)
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gov-blue focus:ring-1 focus:ring-gov-blue"
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5"

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Generar Respuesta Oficial</h1>
            <p className="text-xs text-gray-500">Radicado de origen: <span className="font-bold">{radicadoOrigen.numero}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gov-blue hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {loading ? "Firmando..." : <><PenTool className="w-4 h-4" /> Firmar y Radicar Salida</>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar de Configuración ── */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto space-y-6 shrink-0">
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-gov-blue" />
              Metadatos del Documento
            </h3>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Plantilla Institucional</label>
                <select value={plantillaId} onChange={(e) => setPlantillaId(e.target.value)} className={inputCls}>
                  <option value="">Documento en blanco</option>
                  {plantillas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Asunto *</label>
                <textarea 
                  value={asunto} 
                  onChange={(e) => setAsunto(e.target.value)}
                  className={inputCls} 
                  rows={2} 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Clasificación TRD</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Dependencia *</label>
                <select value={dependenciaId} onChange={(e) => { setDependenciaId(e.target.value); setSerieId(""); setSubserieId("") }} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {dependencias.map(d => <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Serie</label>
                <select value={serieId} onChange={(e) => { setSerieId(e.target.value); setSubserieId("") }} disabled={!depSeleccionada} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {depSeleccionada?.series.map((s: any) => <option key={s.id} value={s.id}>{s.codigo} - {s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Subserie</label>
                <select value={subserieId} onChange={(e) => { setSubserieId(e.target.value) }} disabled={!serieSeleccionada} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {serieSeleccionada?.subseries.map((s: any) => <option key={s.id} value={s.id}>{s.codigo} - {s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tipo Documental</label>
                <select value={tipoDocumentalId} onChange={(e) => { setTipoDocumentalId(e.target.value) }} disabled={!subserieSeleccionada} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {subserieSeleccionada?.tiposDoc.map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Editor Canvas ── */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          <div className="max-w-4xl mx-auto">
            <BlockEditor content={contenido} onChange={setContenido} placeholder="Comience a redactar el documento oficial aquí..." />
          </div>
        </div>
      </div>
    </div>
  )
}
