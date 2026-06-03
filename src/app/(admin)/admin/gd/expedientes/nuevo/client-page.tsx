"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FolderPlus, Save, CheckCircle } from "lucide-react"

type Dependencia = any // simplificado para UI

export default function NuevoExpedienteClient({ dependencias }: { dependencias: Dependencia[] }) {
  const router = useRouter()
  
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [dependenciaId, setDependenciaId] = useState("")
  const [serieId, setSerieId] = useState("")
  const [subserieId, setSubserieId] = useState("")
  
  const [loading, setLoading] = useState(false)

  const depSeleccionada = dependencias.find((d: any) => d.id === dependenciaId)
  const serieSeleccionada = depSeleccionada?.series.find((s: any) => s.id === serieId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!dependenciaId || !nombre) {
      alert("Completar campos obligatorios")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/gd/expedientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, descripcion, dependenciaId, serieId, subserieId
        })
      })

      if (!res.ok) throw new Error(await res.text())
      
      router.push("/admin/gd/expedientes")
      router.refresh()
    } catch (err: any) {
      alert("Error: " + err.message)
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gov-blue/50 focus:border-gov-blue transition-colors"
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5"

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/gd/expedientes" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FolderPlus className="w-6 h-6 text-gov-blue" />
            Apertura de Expediente Físico/Electrónico
          </h1>
          <p className="text-gray-500 text-sm mt-1">Conforme un nuevo expediente acorde a la clasificación TRD vigente.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Datos Generales */}
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <CheckCircle className="w-4 h-4 text-gov-blue" /> 1. Datos Generales
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Nombre del Expediente *</label>
                <input 
                  type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Contratos de Prestación de Servicios 2026 - Juan Pérez"
                  className={inputCls} 
                />
              </div>
              <div>
                <label className={labelCls}>Descripción u Objeto</label>
                <textarea 
                  value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3}
                  className={inputCls} placeholder="Opcional. Detalles adicionales descriptivos."
                />
              </div>
            </div>
          </div>

          {/* TRD */}
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
              <CheckCircle className="w-4 h-4 text-gov-blue" /> 2. Clasificación Documental (TRD)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Dependencia Productora *</label>
                <select required value={dependenciaId} onChange={(e) => { setDependenciaId(e.target.value); setSerieId(""); setSubserieId("") }} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {dependencias.map(d => <option key={d.id} value={d.id}>{d.codigo} - {d.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Serie</label>
                <select value={serieId} onChange={(e) => { setSerieId(e.target.value); setSubserieId("") }} disabled={!depSeleccionada} className={inputCls}>
                  <option value="">Ninguna</option>
                  {depSeleccionada?.series.map((s: any) => <option key={s.id} value={s.id}>{s.codigo} - {s.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Subserie</label>
                <select value={subserieId} onChange={(e) => { setSubserieId(e.target.value) }} disabled={!serieSeleccionada} className={inputCls}>
                  <option value="">Ninguna</option>
                  {serieSeleccionada?.subseries.map((s: any) => <option key={s.id} value={s.id}>{s.codigo} - {s.nombre}</option>)}
                </select>
              </div>
            </div>
          </div>
          
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3">
          <Link href="/admin/gd/expedientes" className="px-5 py-2.5 text-gray-600 hover:bg-gray-200 font-semibold rounded-xl text-sm transition-colors">
            Cancelar
          </Link>
          <button 
            type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-gov-blue hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-900/20 disabled:opacity-50 transition-all"
          >
            {loading ? "Creando..." : <><Save className="w-4 h-4" /> Conformar Expediente</>}
          </button>
        </div>
      </form>
    </div>
  )
}
