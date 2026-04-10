"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, Save, Filter, Activity, ShieldCheck } from "lucide-react"

export default function MipgEvaluacionClient() {
  const [politicas, setPoliticas] = useState<any[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null) // ID politica actual guardando
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear())
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null)

  useEffect(() => {
    fetchData()
  }, [anioFiltro])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch Paralelo para optimizar carga
      const [resPol, resEval] = await Promise.all([
        fetch(`/api/admin/mipg/politicas`),
        fetch(`/api/admin/mipg/evaluacion?anioVigencia=${anioFiltro}`)
      ])

      if (resPol.ok && resEval.ok) {
        const dataPol = await resPol.json()
        const dataEval = await resEval.json()
        setPoliticas(dataPol)

        // Mapear evaluaciones existentes a un diccionario { politicaId: evaluacion }
        const mapEvals: Record<string, any> = {}
        dataEval.detalle?.forEach((ev: any) => {
          mapEvals[ev.politicaId] = ev
        })
        setEvaluaciones(mapEvals)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (politicaId: string, puntajeStr: string, observaciones: string) => {
    const puntaje = parseInt(puntajeStr)
    if (isNaN(puntaje) || puntaje < 0 || puntaje > 100) {
      showToast("El puntaje debe ser entre 0 y 100", "error")
      return
    }

    setSaving(politicaId)
    try {
      const res = await fetch(`/api/admin/mipg/evaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          politicaId,
          anioVigencia: anioFiltro,
          puntaje,
          observaciones
        })
      })

      if (res.ok) {
        const data = await res.json()
        // Actualizar estado local
        setEvaluaciones(prev => ({ ...prev, [politicaId]: data }))
        showToast("Calificación guardada exitosamente", "success")
      } else {
        throw new Error("Fallo en guardar")
      }
    } catch (error) {
      showToast("Error al guardar calificación", "error")
    } finally {
      setSaving(null)
    }
  }

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Agrupación visual por Dimension para la UI
  const dimensionTracker = new Set<string>()

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl font-medium animate-in fade-in slide-in-from-top-5 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-gov-blue" />
            Matriz de Autodiagnóstico
          </h1>
          <p className="text-gray-500 mt-1">Evalúa y califica las Políticas Institucionales de Gestión (MIPG)</p>
        </div>
        
        <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Vigencia a evaluar:</span>
          <select 
            value={anioFiltro}
            onChange={(e) => setAnioFiltro(Number(e.target.value))}
            className="font-bold text-gov-blue text-base focus:outline-none bg-transparent"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i
              return <option key={year} value={year}>{year}</option>
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
           {[1,2,3,4].map(idx => (
              <div key={idx} className="h-32 bg-gray-100/50 border border-gray-200 rounded-2xl w-full"></div>
           ))}
        </div>
      ) : politicas.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Políticas no configuradas</h3>
          <p className="text-gray-500 mt-2">Se requiere establecer el marco normativo MIPG en la base de datos antes de evaluarlo.</p>
        </div>
      ) : (
        <div className="bg-white border text-left border-gray-200 rounded-3xl overflow-hidden shadow-sm">
           <div className="bg-gray-50 p-5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-500">Listado de Políticas</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-lg text-sm flex gap-2 items-center">
                 Vigencia oficial {anioFiltro}
              </span>
           </div>

           <div className="divide-y divide-gray-100">
             {politicas.map((pol) => {
               const esNuevaDimension = !dimensionTracker.has(pol.dimensionId)
               if (esNuevaDimension) dimensionTracker.add(pol.dimensionId)

               const evalActual = evaluaciones[pol.id]
               const colorAprobacion = (evalActual?.puntaje >= 80) ? 'text-emerald-600 bg-emerald-50' : 
                                       (evalActual?.puntaje >= 60) ? 'text-yellow-600 bg-yellow-50' : 
                                       (evalActual?.puntaje !== undefined) ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'

               return (
                 <div key={pol.id} className="flex flex-col">
                   {/* Separador de Dimensión Orgánica */}
                   {esNuevaDimension && (
                     <div className="bg-slate-800 text-white p-4 pl-6 sticky top-0 z-10 flex items-center gap-3">
                       <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white min-w-8 text-center">{pol.dimension.codigo}</span>
                       <h3 className="font-bold tracking-wide">{pol.dimension.nombre}</h3>
                     </div>
                   )}
                   
                   {/* Fila de Política */}
                   <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8 hover:bg-gray-50/50 transition-colors">
                     {/* Lado Izquierdo: Info de la Política */}
                     <div className="flex-1 space-y-3">
                       <div className="flex items-center gap-3">
                         <span className="px-2 py-1 bg-gov-blue/10 text-gov-blue font-bold text-xs rounded border border-gov-blue/20">
                           {pol.codigo}
                         </span>
                         <h4 className="font-bold text-gray-900 text-lg">{pol.nombre}</h4>
                       </div>
                       <p className="text-gray-500 text-sm leading-relaxed">{pol.descripcion}</p>
                       
                       {/* KPIs Relacionados (Solo informativo) */}
                       {pol.indicadores?.length > 0 && (
                         <div className="pt-2">
                           <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Indicadores Clave soportados</p>
                           <div className="flex flex-wrap gap-2">
                             {pol.indicadores.map((ind: any) => (
                               <span key={ind.id} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full whitespace-nowrap border border-gray-200">
                                 {ind.codigo} - {ind.nombre}
                               </span>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>

                     {/* Lado Derecho: Controles de Evaluación */}
                     <div className="lg:w-96 shrink-0 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                       <form 
                         onSubmit={(e) => {
                           e.preventDefault()
                           const form = e.target as HTMLFormElement
                           handleSave(
                             pol.id, 
                             (form.elements.namedItem('puntaje') as HTMLInputElement).value, 
                             (form.elements.namedItem('observaciones') as HTMLTextAreaElement).value
                           )
                         }}
                         className="flex flex-col gap-4 h-full"
                       >
                         <div>
                           <div className="flex justify-between items-center mb-1.5">
                             <label className="text-sm font-bold text-gray-700">Calificación FURAG (0-100)</label>
                             {evalActual && (
                               <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${colorAprobacion}`}>
                                 Actual: {evalActual.puntaje}
                               </span>
                             )}
                           </div>
                           <input 
                             type="number" 
                             name="puntaje"
                             min="0" max="100" 
                             defaultValue={evalActual?.puntaje ?? ''}
                             placeholder="Ej: 85"
                             required
                             className="w-full h-11 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gov-blue focus:border-gov-blue transition-all bg-white font-bold"
                           />
                         </div>

                         <div className="flex-1">
                           <label className="text-sm font-bold text-gray-700 mb-1.5 block">Observaciones / Soporte Cualitativo</label>
                           <textarea 
                             name="observaciones"
                             defaultValue={evalActual?.observaciones ?? ''}
                             placeholder="Anotaciones extra asociadas a este puntaje..."
                             rows={3}
                             className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-gov-blue focus:border-gov-blue transition-all bg-white resize-none"
                           />
                         </div>

                         <button 
                           type="submit" 
                           disabled={saving === pol.id}
                           className="w-full py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-auto shadow-md"
                         >
                           {saving === pol.id ? (
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           ) : (
                             <>
                              <Save className="w-4 h-4" /> 
                              Guardar Calificación
                             </>
                           )}
                         </button>
                       </form>
                     </div>
                   </div>
                 </div>
               )
             })}
           </div>
        </div>
      )}
    </div>
  )
}
