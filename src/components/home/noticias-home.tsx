"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, ArrowRight, Clock, Tag } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Noticia {
  id: string
  titulo: string
  slug: string
  extracto?: string
  imagenDestacada?: string
  fechaPublicacion: string
  categoria?: {
    nombre: string
    color?: string
  }
}

const defaultNoticias: Noticia[] = [
  {
    id: "1",
    titulo: "La Personería realiza jornada de atención al ciudadano en zona rural",
    slug: "jornada-atencion-ciudadano-zona-rural",
    extracto: "Con el objetivo de acercar los servicios de la Personería a las comunidades más alejadas, se realizó una jornada de atención en el corregimiento de Chorreras donde más de 80 familias fueron atendidas.",
    imagenDestacada: "",
    fechaPublicacion: "2026-03-15",
    categoria: { nombre: "Gestión", color: "#10b981" }
  },
  {
    id: "2",
    titulo: "Capacitación en Derechos Humanos para líderes comunitarios",
    slug: "capacitacion-derechos-humanos-lideres",
    extracto: "La Personería Municipal llevó a cabo una capacitación dirigida a más de 60 líderes comunitarios sobre mecanismos de protección de derechos y participación ciudadana efectiva.",
    imagenDestacada: "",
    fechaPublicacion: "2026-03-10",
    categoria: { nombre: "Derechos Humanos", color: "#3b82f6" }
  },
  {
    id: "3",
    titulo: "Informe de gestión del primer trimestre 2026",
    slug: "informe-gestion-primer-trimestre-2026",
    extracto: "La Personería Municipal presenta su informe de gestión correspondiente al primer trimestre del año 2026, con resultados positivos en la atención al ciudadano y el control disciplinario.",
    imagenDestacada: "",
    fechaPublicacion: "2026-03-05",
    categoria: { nombre: "Informes", color: "#8b5cf6" }
  }
]

const GRADIENT_FALLBACKS = [
  "from-blue-700 to-blue-900",
  "from-purple-700 to-purple-900",
  "from-emerald-700 to-emerald-900",
]

interface NoticiasHomeProps {
  noticias?: Noticia[]
}

export function NoticiasHome({ noticias = defaultNoticias }: NoticiasHomeProps) {
  const [featured, ...rest] = noticias

  return (
    <section className="py-16 bg-white" aria-labelledby="noticias-title">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-gov-blue font-semibold text-sm uppercase tracking-widest mb-3">
              <span className="w-8 h-0.5 bg-gov-blue inline-block" />
              Sala de prensa
            </div>
            <h2 id="noticias-title" className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Últimas Noticias
            </h2>
          </div>
          <Link
            href="/noticias"
            className="inline-flex items-center gap-2 text-gov-blue font-semibold hover:gap-3 transition-all duration-200 group shrink-0 text-sm"
          >
            Ver todas las noticias
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Featured card - spans 3 columns */}
          {featured && (
            <Link
              href={`/noticias/${featured.slug}`}
              className="lg:col-span-3 group relative rounded-3xl overflow-hidden bg-gray-100 min-h-[400px] flex flex-col justify-end shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Background */}
              {featured.imagenDestacada ? (
                <Image
                  src={featured.imagenDestacada}
                  alt={featured.titulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className={`absolute inset-0 bg-linear-to-br ${GRADIENT_FALLBACKS[0]}`}>
                  <div className="absolute inset-0 opacity-20 flex items-center justify-center">
                    <span className="text-9xl font-black text-white/30">PB</span>
                  </div>
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="relative z-10 p-6 md:p-8">
                {featured.categoria && (
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3"
                    style={{ backgroundColor: featured.categoria.color || "#3366cc" }}
                  >
                    {featured.categoria.nombre}
                  </span>
                )}
                <h3 className="text-xl md:text-2xl font-extrabold text-white leading-tight mb-3 group-hover:text-blue-200 transition-colors">
                  {featured.titulo}
                </h3>
                {featured.extracto && (
                  <p className="text-white/80 text-sm line-clamp-2 mb-4">
                    {featured.extracto}
                  </p>
                )}
                <div className="flex items-center gap-4 text-white/60 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(featured.fechaPublicacion)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    5 min de lectura
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Secondary cards - span 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {rest.map((noticia, idx) => (
              <Link
                key={noticia.id}
                href={`/noticias/${noticia.slug}`}
                className="group flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white border border-gray-100 hover:border-gov-blue/20 hover:shadow-lg transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-200">
                  {noticia.imagenDestacada ? (
                    <Image
                      src={noticia.imagenDestacada}
                      alt={noticia.titulo}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-linear-to-br ${GRADIENT_FALLBACKS[(idx + 1) % GRADIENT_FALLBACKS.length]} flex items-center justify-center`}>
                      <span className="text-xl font-black text-white/70">PB</span>
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex flex-col justify-between min-w-0">
                  {noticia.categoria && (
                    <span className="flex items-center gap-1 text-xs font-semibold mb-1" style={{ color: noticia.categoria.color || "#3366cc" }}>
                      <Tag className="w-3 h-3" />
                      {noticia.categoria.nombre}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-gov-blue transition-colors leading-snug line-clamp-2">
                    {noticia.titulo}
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(noticia.fechaPublicacion)}
                  </span>
                </div>
              </Link>
            ))}

            {/* CTA card */}
            <Link
              href="/noticias"
              className="group flex items-center justify-between p-5 rounded-2xl bg-gov-blue text-white hover:bg-gov-blue-dark transition-colors duration-300"
            >
              <div>
                <p className="font-bold text-sm">Ver sala de prensa</p>
                <p className="text-white/70 text-xs mt-0.5">Todas las publicaciones</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
