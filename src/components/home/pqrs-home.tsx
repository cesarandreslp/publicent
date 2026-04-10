"use client"

import { useState } from "react"
import Link from "next/link"
import { useTenantModulos } from "@/hooks/use-tenant-modulos"
import {
  MessageSquare,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileQuestion,
  AlertCircle,
  Lightbulb,
  Flag,
  Heart,
  Phone,
  MapPin,
  Mail
} from "lucide-react"

const tiposPQRS = [
  { tipo: "Petición", icono: FileQuestion, color: "bg-blue-100 text-blue-700 border-blue-200", desc: "Solicitar información o servicios" },
  { tipo: "Queja", icono: AlertCircle, color: "bg-orange-100 text-orange-700 border-orange-200", desc: "Manifestar inconformidad" },
  { tipo: "Reclamo", icono: Flag, color: "bg-red-100 text-red-700 border-red-200", desc: "Exigir el cumplimiento de un derecho" },
  { tipo: "Sugerencia", icono: Lightbulb, color: "bg-yellow-100 text-yellow-700 border-yellow-200", desc: "Proponer mejoras al servicio" },
  { tipo: "Denuncia", icono: AlertCircle, color: "bg-purple-100 text-purple-700 border-purple-200", desc: "Reportar irregularidades" },
  { tipo: "Felicitación", icono: Heart, color: "bg-emerald-100 text-emerald-700 border-emerald-200", desc: "Reconocer la gestión" },
]

const tiempos = [
  { tipo: "Peticiones", tiempo: "15 días hábiles" },
  { tipo: "Quejas y Reclamos", tiempo: "15 días hábiles" },
  { tipo: "Consultas", tiempo: "30 días hábiles" },
  { tipo: "Denuncias disciplinarias", tiempo: "Trámite inmediato" },
]

const canales = [
  { icono: MapPin, label: "Presencial", desc: "Cra 14 #6-30, Centro" },
  { icono: Phone, label: "Teléfono", desc: "+57 (2) 228-0000" },
  { icono: Mail, label: "Correo", desc: "pqrs@personeriabuga.gov.co" },
]

export function PQRSHome() {
  const [radicado, setRadicado] = useState("")
  const [documento, setDocumento] = useState("")
  const { pqrsUrl, consultarPqrsUrl, ventanillaActiva, loading } = useTenantModulos()

  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden" aria-labelledby="pqrs-title">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-gov-blue via-blue-400 to-gov-blue" />

      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-gov-blue font-semibold text-sm uppercase tracking-widest mb-3">
            <span className="w-8 h-0.5 bg-gov-blue inline-block" />
            Ley 1755 de 2015
            <span className="w-8 h-0.5 bg-gov-blue inline-block" />
          </div>
          <h2 id="pqrs-title" className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Atención al Ciudadano
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Radique sus peticiones, quejas, reclamos y sugerencias. Respondemos en los tiempos establecidos por ley.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left — Types + channels */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tipos PQRS */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tipos de solicitud</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tiposPQRS.map((item) => {
                  const Icon = item.icono
                  return (
                    <Link
                      key={item.tipo}
                      href={`/atencion-ciudadano/pqrsd?tipo=${item.tipo.toLowerCase()}`}
                      className={`group flex flex-col gap-2 p-4 rounded-2xl border bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color} border`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.tipo}</p>
                        <p className="text-xs text-gray-500 leading-tight">{item.desc}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Canales */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Canales de atención</h3>
              <div className="grid grid-cols-3 gap-3">
                {canales.map((c) => {
                  const Icon = c.icono
                  return (
                    <div key={c.label} className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-2xl text-center hover:border-gov-blue/30 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-xl bg-gov-blue/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gov-blue" />
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
                      <p className="text-xs text-gray-500">{c.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/atencion-ciudadano/pqrsd"
                className="inline-flex items-center gap-2 px-7 py-3 bg-gov-blue text-white font-bold rounded-xl hover:bg-gov-blue-dark transition-colors shadow-lg shadow-blue-500/20 group"
              >
                <MessageSquare className="w-5 h-5" />
                Radicar PQRSD
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/atencion-ciudadano/pqrsd/consulta"
                className="inline-flex items-center gap-2 px-7 py-3 bg-white text-gray-800 font-semibold rounded-xl border border-gray-200 hover:border-gov-blue/50 hover:shadow-md transition-all"
              >
                <Search className="w-5 h-5 text-gray-500" />
                Consultar Estado
              </Link>
            </div>
            {ventanillaActiva && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sistema avanzado de Ventanilla Única activo
              </p>
            )}
          </div>

          {/* Right — Quick consult card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              {/* Card header */}
              <div className="bg-linear-to-br from-gov-blue to-gov-blue-dark p-6 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">Consultar PQRSD</h3>
                </div>
                <p className="text-blue-100 text-sm">Verifique el estado de su solicitud en línea</p>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="radicado-home" className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Radicado
                  </label>
                  <input
                    id="radicado-home"
                    type="text"
                    value={radicado}
                    onChange={(e) => setRadicado(e.target.value)}
                    placeholder="Ej: PGB-2026-00001"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue text-sm transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="documento-home" className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Documento
                  </label>
                  <input
                    id="documento-home"
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Sin puntos ni guiones"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue/30 focus:border-gov-blue text-sm transition-all"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    if (radicado && documento) {
                      window.location.href = `/atencion-ciudadano/pqrsd/consulta?radicado=${encodeURIComponent(radicado)}&documento=${encodeURIComponent(documento)}`
                    }
                  }}
                  className="w-full py-3 bg-gov-blue text-white font-bold rounded-xl hover:bg-gov-blue-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Search className="w-4 h-4" />
                  Consultar
                </button>
              </div>

              {/* Response times */}
              <div className="px-6 pb-6 border-t border-gray-50 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gov-blue" />
                  <h4 className="text-sm font-bold text-gray-800">Tiempos de Respuesta</h4>
                </div>
                <ul className="space-y-2">
                  {tiempos.map((t) => (
                    <li key={t.tipo} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        {t.tipo}
                      </span>
                      <span className="font-semibold text-gray-800 bg-gray-50 px-2 py-0.5 rounded-lg">{t.tiempo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
