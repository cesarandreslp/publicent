"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Folder, Inbox, Search, MapPin, Hand, CheckCircle, Database, PackageOpen } from "lucide-react"

type Carpeta = any
type Prestamo = any

export default function ArchivoFisicoClient({ carpetas, expedientes, prestamos }: { carpetas: Carpeta[], expedientes: any[], prestamos: Prestamo[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<"carpetas"|"nuevo"|"prestamos">("carpetas")

  // Estado formulario Nuevo
  const [f, setF] = useState({
    edificio: "Entidad Principal", piso: "Piso 1", bodega: "Archivo Central",
    estante: "Estante A", entrepano: "Entrepaño 1",
    caja: "", carpeta: "", titulo: "", expedienteId: ""
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/gd/archivo/carpetas", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f)
      })
      if (!res.ok) throw new Error(await res.text())
      alert("Topología y Carpeta Física guardada correctamente")
      setTab("carpetas")
      router.refresh()
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-gov-blue" />
          Módulo de Archivo Físico e Inventario
        </h1>
        <p className="text-gray-500 text-sm mt-1">Gestión topográfica, ubicación de expedientes papel y control de préstamos.</p>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("carpetas")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab==="carpetas" ? 'bg-white shadow text-gov-blue' : 'text-gray-600 hover:text-gray-900'}`}>Inventario Topográfico</button>
        <button onClick={() => setTab("nuevo")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab==="nuevo" ? 'bg-white shadow text-gov-blue' : 'text-gray-600 hover:text-gray-900'}`}>Ingresar Carpeta</button>
        <button onClick={() => setTab("prestamos")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab==="prestamos" ? 'bg-white shadow text-gov-blue' : 'text-gray-600 hover:text-gray-900'}`}>Préstamos Activos</button>
      </div>

      {tab === "carpetas" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carpetas.map(c => (
              <div key={c.id} className="border border-gray-100 bg-gray-50 rounded-xl p-4 hover:border-gov-blue/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 text-gov-blue font-bold">
                    <Folder className="w-5 h-5 text-amber-500" />
                    {c.codigo}
                  </div>
                  {c.prestamos.length > 0 && <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full font-bold">PRESTADA</span>}
                </div>
                <p className="text-sm font-medium text-gray-900 mt-2">{c.titulo}</p>
                
                <div className="mt-4 space-y-1 bg-white p-3 rounded-md border border-gray-100 text-xs text-gray-600">
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" /> {c.caja.entrepano.estante.bodega.piso.edificio.nombre} - {c.caja.entrepano.estante.bodega.piso.nombre}</p>
                  <p className="flex items-center gap-1.5"><PackageOpen className="w-3 h-3 text-gray-400" /> Bodega: {c.caja.entrepano.estante.bodega.nombre}</p>
                  <p className="flex items-center gap-1.5 text-gray-800 font-medium ml-4">↳ {c.caja.entrepano.estante.codigo} &gt; {c.caja.entrepano.codigo} &gt; Caja {c.caja.codigo}</p>
                </div>

                {c.expediente && (
                  <div className="mt-3 text-xs bg-blue-50 text-blue-800 p-2 rounded flex items-center gap-2 border border-blue-100 mb-3">
                    <CheckCircle className="w-3 h-3" /> Vinculada: {c.expediente.codigo}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={async () => {
                      if (!confirm("¿Solicitar préstamo físico de esta carpeta?")) return
                      setLoading(true)
                      try {
                        const res = await fetch("/api/admin/gd/archivo/prestamos", {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ carpetaId: c.id })
                        })
                        if (!res.ok) throw new Error(await res.text())
                        alert("Préstamo registrado.")
                        router.refresh()
                      } catch(err:any) { alert("Error: " + err.message) }
                      finally { setLoading(false) }
                    }}
                    disabled={loading || c.prestamos.length > 0} 
                    className="flex items-center gap-1.5 text-xs font-bold text-gov-blue hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                  >
                    <Hand className="w-3 h-3" /> Solicitar Carpeta
                  </button>
                </div>
              </div>
            ))}
            {carpetas.length === 0 && <p className="text-gray-500 p-4">No hay carpetas físicas en el inventario.</p>}
          </div>
        </div>
      )}

      {tab === "nuevo" && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-2xl">
          <h3 className="font-bold text-gray-800 mb-6">Inserción Topográfica Ascendente</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><label className="block text-xs text-gray-500 mb-1">Edificio</label><input required className="w-full border p-2 rounded text-sm" value={f.edificio} onChange={e=>setF({...f,edificio:e.target.value})} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Piso</label><input required className="w-full border p-2 rounded text-sm" value={f.piso} onChange={e=>setF({...f,piso:e.target.value})} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Bodega (Sala)</label><input required className="w-full border p-2 rounded text-sm" value={f.bodega} onChange={e=>setF({...f,bodega:e.target.value})} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Estante</label><input required className="w-full border p-2 rounded text-sm" value={f.estante} onChange={e=>setF({...f,estante:e.target.value})} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Entrepaño</label><input required className="w-full border p-2 rounded text-sm" value={f.entrepano} onChange={e=>setF({...f,entrepano:e.target.value})} /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Cód. Caja *</label><input required className="w-full border p-2 rounded text-sm border-blue-300" placeholder="Ej: CAJ-001" value={f.caja} onChange={e=>setF({...f,caja:e.target.value})} /></div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h4 className="font-bold text-gray-700 text-sm">Metadatos de la Carpeta</h4>
            <div><label className="block text-xs text-gray-500 mb-1">Código Carpeta *</label><input required className="w-full border p-2 rounded text-sm" value={f.carpeta} onChange={e=>setF({...f,carpeta:e.target.value})} placeholder="Ej: CARP-2026-01"/></div>
            <div><label className="block text-xs text-gray-500 mb-1">Título de la Carpeta *</label><input required className="w-full border p-2 rounded text-sm" value={f.titulo} onChange={e=>setF({...f,titulo:e.target.value})} placeholder="Ej: Contratos Enero"/></div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Expediente Electrónico (Híbrido) Opcional</label>
              <select className="w-full border p-2 rounded text-sm" value={f.expedienteId} onChange={e=>setF({...f,expedienteId:e.target.value})}>
                <option value="">No asociar...</option>
                {expedientes.map(ex => <option key={ex.id} value={ex.id}>{ex.codigo} - {ex.nombre}</option>)}
              </select>
            </div>
            
            <button disabled={loading} type="submit" className="mt-4 w-full bg-gov-blue hover:bg-blue-800 text-white font-bold py-2.5 rounded-lg text-sm transition-all disabled:opacity-50">
              Registrar Ubicación Física
            </button>
          </div>
        </form>
      )}

      {tab === "prestamos" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
              <tr>
                <th className="p-4">Fecha Solicitud</th>
                <th className="p-4">Carpeta</th>
                <th className="p-4">Solicitante</th>
                <th className="p-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {prestamos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{new Date(p.fechaSolicitud).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-gray-800">{p.carpeta.codigo} <span className="text-gray-500 font-normal text-xs block">{p.carpeta.titulo}</span></td>
                  <td className="p-4">{p.solicitante.nombre} {p.solicitante.apellido}</td>
                  <td className="p-4">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">{p.estado}</span>
                  </td>
                </tr>
              ))}
              {prestamos.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay historial de préstamos.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
