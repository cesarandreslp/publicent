"use client"

import { useState, useEffect } from "react"
import { Search, Plus, FileText, Link as LinkIcon, Download, Filter } from "lucide-react"

export default function MipgEvidenciasClient() {
  const [evidencias, setEvidencias] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchEvidencias()
  }, [anioFiltro])

  const fetchEvidencias = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/mipg/evidencias?anioVigencia=${anioFiltro}`)
      if (res.ok) {
        const data = await res.json()
        setEvidencias(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bóveda de Evidencias</h1>
          <p className="text-gray-500 mt-1">Gestión centralizada de archivos probatorios para FURAG</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Vigencia:</span>
            <select 
              value={anioFiltro}
              onChange={(e) => setAnioFiltro(Number(e.target.value))}
              className="font-bold text-gov-blue focus:outline-none bg-transparent"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i
                return <option key={year} value={year}>{year}</option>
              })}
            </select>
          </div>
          
          <button className="bg-gov-blue text-white px-4 py-2.5 rounded-xl font-medium shadow-md hover:bg-gov-blue-dark transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Vincular Evidencia
          </button>
        </div>
      </div>

      {/* Tabla de Evidencias */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Registros Documentales ({evidencias.length})
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar evidencia..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-blue/20 w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Cargando Bóveda...</div>
        ) : evidencias.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-blue-50 text-gov-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Bóveda vacía para {anioFiltro}</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              No hay evidencias cargadas para esta vigencia. Comienza vinculando los soportes de tu gestión.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Evidencia</th>
                  <th className="p-4 font-semibold">Indicador Asociado</th>
                  <th className="p-4 font-semibold">Política Orgánica</th>
                  <th className="p-4 font-semibold">Autor</th>
                  <th className="p-4 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evidencias.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                           {ev.archivoUrl ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{ev.nombre}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[250px]">
                            {ev.descripcion || 'Sin descripción'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-mono">
                        {ev.indicador?.codigo}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 max-w-[200px]">
                        {ev.indicador?.nombre}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-xs text-gray-700 line-clamp-2 max-w-[200px]">
                        {ev.indicador?.politica?.nombre}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-sm font-medium text-gray-900">{ev.subidoPor?.nombre}</p>
                      <p className="text-xs text-gray-500">{new Date(ev.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 align-top text-right">
                      {ev.archivoUrl ? (
                         <a href={ev.archivoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gov-blue hover:border-gov-blue hover:shadow-sm transition-all">
                           <Download className="w-4 h-4" />
                         </a>
                      ) : (
                         <a href={ev.enlaceExterno} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gov-blue hover:border-gov-blue hover:shadow-sm transition-all">
                           <LinkIcon className="w-4 h-4" />
                         </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
