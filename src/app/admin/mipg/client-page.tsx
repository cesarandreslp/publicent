"use client"

import { useState, useEffect } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Target, Activity, CheckCircle, AlertTriangle } from "lucide-react"

export default function MipgClientPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [anio, setAnio] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchData()
  }, [anio])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/mipg/evaluacion?anioVigencia=${anio}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Fallback visual durante la carga
  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-100 rounded-xl w-full"></div>
      </div>
    )
  }

  const radialData = data?.datosRadiales || []
  const hasData = radialData.length > 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard MIPG</h1>
          <p className="text-gray-500 mt-1">Índice de Desempeño Institucional e indicadores estratégicos</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Selector de Vigencia */}
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Vigencia:</span>
            <select 
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="font-bold text-gov-blue focus:outline-none bg-transparent"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i
                return <option key={year} value={year}>{year}</option>
              })}
            </select>
          </div>

          <a 
            href={`/api/admin/mipg/exportar?anioVigencia=${anio}`} 
             target="_blank" 
            className="bg-white border text-gray-700 border-gray-200/80 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-gray-50 hover:text-gov-blue hover:border-gov-blue transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Exportar FURAG
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="w-24 h-24" />
          </div>
          <p className="text-gray-500 text-sm font-medium">Índice de Desempeño (IDI)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-gov-blue">{data?.promedioIDI || 0}</span>
            <span className="text-gray-400 font-medium">/ 100</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <Activity className="w-4 h-4" />
            <span>Actualizado en tiempo real</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-200/40">
          <p className="text-gray-500 text-sm font-medium">Políticas Evaluadas</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">{data?.evaluacionesTotales || 0}</span>
            <span className="text-gray-400 font-medium">políticas</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Evidencias subidas confirmadas</span>
          </div>
        </div>

        <div className="bg-linear-to-br from-gov-blue to-gov-blue-dark rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20">
          <p className="text-blue-100 text-sm font-medium">Estado del FURAG</p>
          {hasData ? (
             <div className="mt-3">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-500/30">
                 En Progreso
               </span>
               <p className="mt-3 text-sm text-blue-100">Evaluación activa para la vigencia actual.</p>
             </div>
          ) : (
            <div className="mt-3">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-semibold border border-yellow-500/30">
                 Pendiente
               </span>
               <p className="mt-3 text-sm text-blue-100">Aún no se han evaluado políticas este año.</p>
             </div>
          )}
        </div>
      </div>

      {/* Gráfico Analítico */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Desempeño Institucional por Dimensión</h2>
        
        {hasData ? (
          <div className="w-full h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radialData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis 
                  dataKey="dimension" 
                  tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickCount={6}
                />
                <Radar 
                  name="Puntaje" 
                  dataKey="puntajePromedio" 
                  stroke="#1a56db" 
                  fill="#1a56db" 
                  fillOpacity={0.5} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <AlertTriangle className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Sin datos registrados</h3>
            <p className="text-gray-500 max-w-sm text-center mt-2 text-sm">
              No hay evaluaciones registradas para la vigencia {anio}. Ve a "Autodiagnóstico" para comenzar a evaluar las políticas.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
