"use client"

import Link from "next/link"
import { FileText, ExternalLink, ArrowUpRight, Building2, Scale, BarChart3, ClipboardList, Users, Database, Info, ChevronRight } from "lucide-react"

const categorias = [
  {
    numero: 1,
    titulo: "Información de la Entidad",
    descripcion: "Misión, visión, funciones, organigrama y directorio institucional",
    href: "/transparencia/informacion-entidad",
    icono: Building2,
    color: "from-blue-500 to-blue-700",
  },
  {
    numero: 2,
    titulo: "Normativa",
    descripcion: "Normatividad aplicable, resoluciones, decretos y circulares",
    href: "/transparencia/normativa",
    icono: Scale,
    color: "from-purple-500 to-purple-700",
  },
  {
    numero: 3,
    titulo: "Contratación",
    descripcion: "Plan anual de adquisiciones y procesos contractuales en SECOP",
    href: "/transparencia/contratacion",
    icono: FileText,
    color: "from-orange-500 to-orange-700",
  },
  {
    numero: 4,
    titulo: "Planeación e Informes",
    descripcion: "Planes estratégicos, presupuesto e informes de gestión",
    href: "/transparencia/planeacion",
    icono: BarChart3,
    color: "from-emerald-500 to-emerald-700",
  },
  {
    numero: 5,
    titulo: "Trámites y Servicios",
    descripcion: "Trámites disponibles y su descripción detallada",
    href: "/transparencia/tramites",
    icono: ClipboardList,
    color: "from-teal-500 to-teal-700",
  },
  {
    numero: 6,
    titulo: "Participa",
    descripcion: "Mecanismos de participación ciudadana activa",
    href: "/transparencia/participa",
    icono: Users,
    color: "from-pink-500 to-pink-700",
  },
  {
    numero: 7,
    titulo: "Datos Abiertos",
    descripcion: "Conjuntos de datos para reutilización ciudadana",
    href: "/transparencia/datos-abiertos",
    icono: Database,
    color: "from-cyan-500 to-cyan-700",
  },
  {
    numero: 8,
    titulo: "Info. Específica",
    descripcion: "Información para grupos de interés particulares",
    href: "/transparencia/informacion-especifica",
    icono: Info,
    color: "from-violet-500 to-violet-700",
  }
]

export function TransparenciaHome() {
  return (
    <section className="py-16 relative overflow-hidden bg-[#0f172a]" aria-labelledby="transparencia-title">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-900/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-900/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-800/10 blur-3xl rounded-full" />
      </div>

      <div className="relative container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-blue-400 font-semibold text-sm uppercase tracking-widest mb-3">
              <span className="w-8 h-0.5 bg-blue-400 inline-block" />
              Ley 1712 de 2014
            </div>
            <h2 id="transparencia-title" className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Transparencia y Acceso<br className="hidden md:block" /> a la Información Pública
            </h2>
            <p className="text-slate-400 mt-3 text-sm md:text-base">
              En cumplimiento de la Resolución 1519 de 2020, ponemos a disposición de la ciudadanía toda la información pública.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/transparencia"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm shadow-lg shadow-white/10"
            >
              <FileText className="w-4 h-4" />
              Ver transparencia
            </Link>
            <a
              href="https://www.colombiacompra.gov.co/secop-ii"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              SECOP II
            </a>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categorias.map((cat) => {
            const Icon = cat.icono
            return (
              <Link
                key={cat.numero}
                href={cat.href}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 p-5 flex flex-col gap-4 overflow-hidden"
              >
                {/* Number badge */}
                <span className="absolute top-3 right-3 text-white/20 font-black text-3xl leading-none">
                  {String(cat.numero).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${cat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight group-hover:text-blue-300 transition-colors">
                    {cat.titulo}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-snug line-clamp-2">
                    {cat.descripcion}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver más <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
