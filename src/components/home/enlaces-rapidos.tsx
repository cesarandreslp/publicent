"use client"

import Link from "next/link"
import {
  FileText,
  MessageSquare,
  Users,
  Scale,
  FileSearch,
  Building2,
  Phone,
  Calendar,
  ArrowUpRight
} from "lucide-react"

interface EnlaceRapido {
  id: string
  titulo: string
  descripcion?: string
  icono: string
  enlace: string
  gradiente: string
}

const defaultEnlaces: EnlaceRapido[] = [
  {
    id: "1",
    titulo: "Radicar PQRSD",
    descripcion: "Peticiones, quejas, reclamos, sugerencias y denuncias",
    icono: "MessageSquare",
    enlace: "/atencion-ciudadano/pqrsd",
    gradiente: "from-blue-600 to-blue-800",
  },
  {
    id: "2",
    titulo: "Transparencia",
    descripcion: "Información pública de la entidad",
    icono: "FileSearch",
    enlace: "/transparencia",
    gradiente: "from-emerald-600 to-emerald-800",
  },
  {
    id: "3",
    titulo: "Directorio",
    descripcion: "Equipo de trabajo y contactos",
    icono: "Users",
    enlace: "/entidad/directorio",
    gradiente: "from-purple-600 to-purple-800",
  },
  {
    id: "4",
    titulo: "Normatividad",
    descripcion: "Normas, leyes y regulaciones aplicables",
    icono: "Scale",
    enlace: "/transparencia/normativa",
    gradiente: "from-orange-600 to-orange-800",
  },
  {
    id: "5",
    titulo: "Contratación",
    descripcion: "Procesos contractuales y SECOP",
    icono: "FileText",
    enlace: "/transparencia/contratacion",
    gradiente: "from-red-600 to-red-800",
  },
  {
    id: "6",
    titulo: "La Entidad",
    descripcion: "Misión, visión y funciones institucionales",
    icono: "Building2",
    enlace: "/entidad",
    gradiente: "from-teal-600 to-teal-800",
  },
  {
    id: "7",
    titulo: "Contáctenos",
    descripcion: "Canales de comunicación y atención",
    icono: "Phone",
    enlace: "/atencion-ciudadano/contacto",
    gradiente: "from-indigo-600 to-indigo-800",
  },
  {
    id: "8",
    titulo: "Eventos",
    descripcion: "Agenda de actividades institucionales",
    icono: "Calendar",
    enlace: "/eventos",
    gradiente: "from-pink-600 to-pink-800",
  }
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  MessageSquare,
  Users,
  Scale,
  FileSearch,
  Building2,
  Phone,
  Calendar
}

interface EnlacesRapidosProps {
  enlaces?: EnlaceRapido[]
}

export function EnlacesRapidos({
  enlaces = defaultEnlaces,
}: EnlacesRapidosProps) {
  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden" aria-labelledby="accesos-rapidos-title">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-gov-blue via-blue-400 to-gov-blue-light" />
      </div>

      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-gov-blue font-semibold text-sm uppercase tracking-widest mb-3">
            <span className="w-8 h-0.5 bg-gov-blue inline-block" />
            Accesos directos
            <span className="w-8 h-0.5 bg-gov-blue inline-block" />
          </div>
          <h2 id="accesos-rapidos-title" className="text-3xl md:text-4xl font-extrabold text-gray-900">
            ¿Qué necesita hoy?
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Encuentre rápidamente los servicios más solicitados de la Personería Municipal.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {enlaces.map((enlace, idx) => {
            const IconComponent = iconMap[enlace.icono] || FileText
            const delay = `${idx * 60}ms`

            return (
              <Link
                key={enlace.id}
                href={enlace.enlace}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-transparent shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                style={{ animationDelay: delay }}
              >
                {/* Color top bar */}
                <div className={`h-1.5 w-full bg-linear-to-r ${enlace.gradiente} group-hover:h-2 transition-all duration-200`} />

                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${enlace.gradiente} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-6 w-6" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-gov-blue transition-colors text-sm md:text-base leading-tight">
                      {enlace.titulo}
                    </h3>
                    {enlace.descripcion && (
                      <p className="text-xs text-gray-500 mt-1 leading-tight line-clamp-2">
                        {enlace.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center justify-end">
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gov-blue group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
