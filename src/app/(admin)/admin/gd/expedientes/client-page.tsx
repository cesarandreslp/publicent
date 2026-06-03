"use client"

import { useState } from "react"
import Link from "next/link"
import { Folder, Search, Plus, Archive, ShieldCheck, ChevronRight } from "lucide-react"

type Expediente = any // Simplificado para props

export default function ExpedientesClient({ expedientes }: { expedientes: Expediente[] }) {
  const [q, setQ] = useState("")

  const filtered = expedientes.filter(e => 
    e.nombre.toLowerCase().includes(q.toLowerCase()) || 
    e.codigo.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Archive className="w-6 h-6 text-gov-blue" />
            Expedientes Electrónicos
          </h1>
          <p className="text-gray-500 text-sm mt-1">Acuerdo 006 del AGN: Conformación de expedientes y cierre con Índice Electrónico.</p>
        </div>
        <Link 
          href="/admin/gd/expedientes/nuevo" 
          className="flex items-center gap-2 px-4 py-2 bg-gov-blue hover:bg-blue-800 text-white rounded-lg text-sm transition-colors font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Crear Expediente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre..." 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gov-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Código / Nombre</th>
                <th className="px-6 py-4">Clasificación TRD</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Radicados</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${exp.estado === 'CERRADO' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{exp.codigo}</p>
                        <p className="text-gray-500 text-xs truncate max-w-[200px]" title={exp.nombre}>{exp.nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-800 font-medium">{exp.dependencia.codigo}</p>
                    <p className="text-gray-500 text-xs">{exp.serie?.nombre || "Sin Serie"} - {exp.subserie?.nombre || "Sin Subserie"}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      exp.estado === 'ABIERTO' ? 'bg-green-100 text-green-700' : 
                      exp.estado === 'CERRADO' ? 'bg-gray-200 text-gray-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {exp.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gov-blue">{exp._count.radicados}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/gd/expedientes/${exp.id}`} className="inline-flex items-center gap-1 text-gov-blue hover:text-blue-800 font-medium py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                      Ver detalle <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No se encontraron expedientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
