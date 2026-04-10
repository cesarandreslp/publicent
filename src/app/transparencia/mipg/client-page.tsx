"use client"

import { useState } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Target, ShieldCheck, FileText } from "lucide-react"

export default function TransparenciaMipgClient({ 
  datosRadiales, 
  evaluacionesTotales, 
  promedioIDI, 
  anio 
}: { 
  datosRadiales: any[]
  evaluacionesTotales: number
  promedioIDI: number
  anio: number
}) {
  const [selectedDimension, setSelectedDimension] = useState<any>(null)

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Intro */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gov-blue/10 text-gov-blue rounded-full text-sm font-bold mb-6 border border-gov-blue/20">
            <ShieldCheck className="w-4 h-4" /> Vigencia {anio}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Gestión Transparente y Orientada a Resultados
          </h2>
          <p className="mt-6 text-xl text-gray-600 leading-relaxed">
            El <strong className="text-gray-900">Índice de Desempeño Institucional (IDI)</strong> refleja nuestro compromiso con la mejora continua, midiendo el impacto de nuestras políticas a través del modelo FURAG.
          </p>
        </section>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Lado Izquierdo: Gráfico Radial */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Desempeño por Dimensiones Orgánicas</h3>
            {datosRadiales.length > 0 ? (
              <div className="w-full h-[400px] md:h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={datosRadiales}>
                    <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                    />
                    <Radar 
                      name="Puntaje" 
                      dataKey="puntajePromedio" 
                      stroke="#00BFA6" 
                      fill="#00BFA6" 
                      fillOpacity={0.6} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No hay evaluaciones públicas para la vigencia {anio}.</p>
              </div>
            )}
          </div>

          {/* Lado Derecho: KPIs y Detalles */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-linear-to-br from-gov-blue to-gov-blue-dark rounded-3xl p-8 text-white shadow-lg overflow-hidden relative">
              <div className="absolute -top-12 -right-12 text-white/10">
                <Target className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <p className="text-blue-200 font-medium text-lg">Índice Institucional M.I.P.G</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-7xl font-black tracking-tighter">{promedioIDI || 0}</span>
                  <span className="text-2xl text-blue-200 pb-2">/ 100</span>
                </div>
                <div className="mt-8 pt-6 border-t border-white/20">
                   <div className="flex items-center gap-3">
                     <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                       <FileText className="w-6 h-6 text-white" />
                     </div>
                     <div>
                       <p className="text-sm text-blue-200">Políticas Certificadas</p>
                       <p className="text-xl font-bold">{evaluacionesTotales}</p>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-4">¿Qué es esto?</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                El <strong>Modelo Integrado de Planeación y Gestión (MIPG)</strong> es un marco de referencia diseñado para que las entidades públicas dirijan, planeen, ejecuten, hagan seguimiento, evalúen y controlen su gestión.
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">
                Esta calificación proviene de la matriz de autodiagnóstico donde se recaban las evidencias que dan cumplimiento al Formulario Único de Reporte de Avances de la Gestión (FURAG).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
