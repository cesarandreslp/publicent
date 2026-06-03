"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, FileText, CheckCircle, FolderLock, Plus, ShieldCheck, Download } from "lucide-react"

type Expediente = any
type Radicado = any

interface Props {
  expediente: Expediente
  radicadosDisponibles: Radicado[]
}

export default function ExpedienteDetalleClient({ expediente, radicadosDisponibles }: Props) {
  const router = useRouter()
  const [radicadoSeleccionado, setRadicadoSeleccionado] = useState("")
  const [loading, setLoading] = useState(false)
  
  const isCerrado = expediente.estado === "CERRADO"

  async function handleVincular(e: React.FormEvent) {
    e.preventDefault()
    if (!radicadoSeleccionado) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/gd/expedientes/${expediente.id}/radicados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ radicadoId: radicadoSeleccionado })
      })
      if (!res.ok) throw new Error(await res.text())
      
      setRadicadoSeleccionado("")
      router.refresh()
    } catch (err: any) {
      alert("Error vinculando: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCierre() {
    if (!confirm("¿Está seguro de conformar el índice electrónico AGN y CERRAR el expediente? Esta acción sella los documentos y no se podrán agregar más radicados al expediente.")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/gd/expedientes/${expediente.id}/cierre`, { method: "POST" })
      if (!res.ok) throw new Error(await res.text())
      
      alert("¡Expediente cerrado con éxito! Índice electrónico generado y firmado.")
      router.refresh()
    } catch (err: any) {
      alert("Error en el cierre: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin/gd/expedientes" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {isCerrado ? <FolderLock className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5 text-green-500" />}
              {expediente.codigo}
            </h1>
            <p className="text-xs text-gray-500">{expediente.nombre}</p>
          </div>
        </div>
        {!isCerrado && (
          <button 
            onClick={handleCierre} disabled={loading || expediente.radicados.length === 0}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg text-white font-bold text-sm transition-colors shadow-md disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" /> Cierre AGN y Firmar Índice
          </button>
        )}
      </div>

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Metadatos y Acciones */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">Detalle del Expediente</h3>
            <div className="space-y-3 text-sm">
              <div><p className="text-gray-500 text-xs">Clasificación TRD</p><p className="font-semibold">{expediente.dependencia.codigo} - {expediente.serie?.nombre || ""} - {expediente.subserie?.nombre || ""}</p></div>
              <div><p className="text-gray-500 text-xs">Estado</p>
                <span className={`px-2.5 py-1 rounded inline-block mt-1 text-xs font-bold ${isCerrado ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                  {expediente.estado}
                </span>
              </div>
              <div><p className="text-gray-500 text-xs">Apertura</p><p className="font-medium">{new Date(expediente.fechaApertura).toLocaleDateString()}</p></div>
              {isCerrado && <div><p className="text-gray-500 text-xs">Cierre</p><p className="font-medium text-amber-700">{new Date(expediente.fechaCierre).toLocaleDateString()}</p></div>}
              {expediente.descripcion && <div><p className="text-gray-500 text-xs">Descripción</p><p className="text-gray-700">{expediente.descripcion}</p></div>}
            </div>
          </div>

          {expediente.indices.length > 0 && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
              <h3 className="font-bold text-emerald-900 border-b border-emerald-200/50 pb-3 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Índice Electrónico Sellado
              </h3>
              <div className="space-y-3 text-sm">
                <div><p className="text-emerald-700 text-xs">Código Criptográfico (SHA-256)</p>
                  <p className="font-mono text-xs bg-emerald-100/50 p-2 rounded truncate break-all mt-1" title={expediente.indices[0].hashCierre}>{expediente.indices[0].hashCierre}</p>
                </div>
                <div><p className="text-emerald-700 text-xs">Sello Digital Por</p><p className="font-semibold text-emerald-900">{expediente.indices[0].firmante.nombre} {expediente.indices[0].firmante.apellido}</p></div>
                
                <div className="pt-2">
                  <a href={expediente.indices[0].documentoUrl} target="_blank" className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold transition-all shadow-md">
                    <Download className="w-4 h-4" /> Bajar Expediente Foliado
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Radicados del Expediente */}
        <div className="lg:col-span-2 space-y-6">
          {!isCerrado && (
            <form onSubmit={handleVincular} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vincular Radicado al Expediente</label>
                <select value={radicadoSeleccionado} onChange={e => setRadicadoSeleccionado(e.target.value)} disabled={loading} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gov-blue">
                  <option value="">Seleccione un radicado suelto...</option>
                  {radicadosDisponibles.map((r) => (
                    <option key={r.id} value={r.id}>{r.numero} - {r.asunto.substring(0, 40)}...</option>
                  ))}
                </select>
              </div>
              <button disabled={!radicadoSeleccionado || loading} type="submit" className="px-5 py-2 bg-gov-blue text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Adjuntar
              </button>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gov-blue" />
                Radicados y Documentos ({expediente.radicados.length})
              </h3>
            </div>
            <div className="p-0">
              {expediente.radicados.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No hay documentos electrónicos en este expediente.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {expediente.radicados.map((r: any) => (
                    <div key={r.id} className="p-6 hover:bg-blue-50/30 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <Link href={`/admin/gd/${r.id}`} className="text-gov-blue font-bold hover:underline flex items-center gap-2">
                            {r.numero}
                            <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full uppercase">{r.tipo}</span>
                          </Link>
                          <p className="text-gray-800 text-sm mt-1">{r.asunto}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>{new Date(r.createdAt).toLocaleDateString()}</p>
                          <p className="mt-1">{r.documentos.length} documento(s)</p>
                        </div>
                      </div>
                      
                      {/* Documentos del Radicado */}
                      {r.documentos.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                          {r.documentos.map((doc: any) => (
                            <div key={doc.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-semibold text-gray-700">{doc.nombre}</span>
                                {doc.esPrincipal && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Principal</span>}
                              </div>
                              <span className="text-[10px] text-gray-400">{doc.folios} folios</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
