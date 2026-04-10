"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight, Shield, Users, FileCheck, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface Slide {
  id: string
  titulo?: string
  subtitulo?: string
  acento?: string
  imagenUrl?: string
  enlace?: string
  textoBoton?: string
  gradiente?: string
}

const defaultSlides: Slide[] = [
  {
    id: "1",
    acento: "Defensores del Ciudadano",
    titulo: "Personería Municipal de Guadalajara de Buga",
    subtitulo: "Protegemos sus derechos, promovemos la transparencia y garantizamos el acceso a la justicia para todos los ciudadanos.",
    gradiente: "from-[#1a237e] via-[#283593] to-[#1565C0]",
    enlace: "/entidad",
    textoBoton: "Conócenos"
  },
  {
    id: "2",
    acento: "Atención Directa",
    titulo: "Radique sus Peticiones y Quejas",
    subtitulo: "Contamos con canales presenciales, virtuales y telefónicos para recibir sus PQRSD con total confidencialidad.",
    gradiente: "from-[#4a148c] via-[#6a1b9a] to-[#7b1fa2]",
    enlace: "/atencion-ciudadano/pqrsd",
    textoBoton: "Radicar PQRSD"
  },
  {
    id: "3",
    acento: "Transparencia Total",
    titulo: "Información Pública al Alcance de Todos",
    subtitulo: "Consulte contratos, presupuesto, informes de gestión y toda la información de interés público en un solo lugar.",
    gradiente: "from-[#004d40] via-[#00695c] to-[#00796b]",
    enlace: "/transparencia",
    textoBoton: "Ver Transparencia"
  }
]

const stats = [
  { icon: Shield, label: "Quejas resueltas", value: 1247, suffix: "+" },
  { icon: Users, label: "Ciudadanos atendidos", value: 8420, suffix: "+" },
  { icon: FileCheck, label: "Visitas de control", value: 340, suffix: "" },
  { icon: Award, label: "Años de servicio", value: 30, suffix: "+" },
]

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target, duration, start])
  return count
}

function StatCounter({ stat, animate }: { stat: typeof stats[0]; animate: boolean }) {
  const count = useCountUp(stat.value, 2000, animate)
  const Icon = stat.icon
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
      <Icon className="w-5 h-5 text-white/80 mb-1" />
      <span className="text-2xl font-bold text-white tabular-nums">
        {count.toLocaleString("es-CO")}{stat.suffix}
      </span>
      <span className="text-xs text-white/70 text-center leading-tight">{stat.label}</span>
    </div>
  )
}

interface HeroSliderProps {
  slides?: Slide[]
  autoPlay?: boolean
  interval?: number
}

export function HeroSlider({
  slides = defaultSlides,
  autoPlay = true,
  interval = 6000
}: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const nextSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 700)
  }, [isAnimating, slides.length])

  const prevSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 700)
  }, [isAnimating, slides.length])

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(nextSlide, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, nextSlide])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative w-full min-h-[560px] md:min-h-[680px] overflow-hidden" aria-label="Presentación principal">

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-in-out",
            index === currentIndex ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
          )}
          aria-hidden={index !== currentIndex}
        >
          {/* Gradient background */}
          <div className={cn("absolute inset-0 bg-linear-to-br", slide.gradiente)} />

          {/* Geometric decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />
            {/* Grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-6 h-full flex items-center min-h-[560px] md:min-h-[680px]">
            <div className="max-w-3xl text-white py-20">
              {/* Acento */}
              {slide.acento && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-sm font-medium mb-6",
                  "transition-all duration-500",
                  index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {slide.acento}
                </div>
              )}

              {/* Title */}
              {slide.titulo && (
                <h1 className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6",
                  "transition-all duration-600 delay-100",
                  index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                )}>
                  {slide.titulo}
                </h1>
              )}

              {/* Subtitle */}
              {slide.subtitulo && (
                <p className={cn(
                  "text-base sm:text-lg md:text-xl text-white/85 max-w-xl leading-relaxed mb-10",
                  "transition-all duration-600 delay-200",
                  index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                )}>
                  {slide.subtitulo}
                </p>
              )}

              {/* CTA buttons */}
              <div className={cn(
                "flex flex-wrap items-center gap-4",
                "transition-all duration-600 delay-300",
                index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
              )}>
                {slide.enlace && (
                  <Link
                    href={slide.enlace}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-bold rounded-2xl hover:bg-white/90 transition-all hover:gap-3 shadow-xl shadow-black/20 group text-sm md:text-base"
                  >
                    {slide.textoBoton || "Ver más"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <Link
                  href="/atencion-ciudadano/pqrsd"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/25 transition-all text-sm md:text-base"
                >
                  Radicar PQRSD
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white transition-all hover:scale-105"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white transition-all hover:scale-105"
        aria-label="Siguiente slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 items-center">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => { if (!isAnimating && index !== currentIndex) { setIsAnimating(true); setCurrentIndex(index); setTimeout(() => setIsAnimating(false), 700) } }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Stats bar */}
      <div
        ref={statsRef}
        className="absolute bottom-0 left-0 right-0 z-20 bg-black/30 backdrop-blur-md border-t border-white/10"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <StatCounter key={stat.label} stat={stat} animate={statsVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
