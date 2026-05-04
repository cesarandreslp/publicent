'use client'

/**
 * FuragAlertaVigencia — Banner de alerta del cierre de vigencia FURAG.
 *
 * Muestra un banner contextual basado en el nivel de urgencia:
 *   INFORMATIVA   → gris/azul, solo visible si hay < 60 días
 *   ADVERTENCIA   → amarillo
 *   URGENTE       → naranja
 *   CRITICA       → rojo parpadeante
 *   VENCIDA       → rojo oscuro
 *   FUERA_PERIODO → oculto (no hay nada que alertar)
 *
 * Consume GET /api/admin/mipg/alerta-vigencia?anioVigencia=YYYY
 */

import { useEffect, useState } from 'react'
import { AlertTriangle, AlertOctagon, Clock, CheckCircle, X, Info, ExternalLink } from 'lucide-react'
import type { EstadoVigenciaFurag, NivelAlertaFurag } from '@/lib/furag-alertas'

interface Props {
  anioVigencia?: number   // Si se omite, usa la vigencia más relevante
}

// ─── Config visual por nivel ─────────────────────────────────────────────────

type NivelConfig = {
  wrapperClass: string
  iconClass: string
  Icon: React.ElementType
  badgeClass: string
  badgeLabel: string
  pulso: boolean
}

const NIVEL_CONFIG: Record<NivelAlertaFurag, NivelConfig | null> = {
  FUERA_DE_PERIODO: null, // No mostrar nada

  INFORMATIVA: {
    wrapperClass: 'bg-sky-950/60 border-sky-700/40 text-sky-200',
    iconClass:    'text-sky-400',
    Icon:         Info,
    badgeClass:   'bg-sky-900/80 text-sky-300 border-sky-700/50',
    badgeLabel:   'Información',
    pulso:        false,
  },
  ADVERTENCIA: {
    wrapperClass: 'bg-yellow-950/60 border-yellow-600/40 text-yellow-200',
    iconClass:    'text-yellow-400',
    Icon:         Clock,
    badgeClass:   'bg-yellow-900/80 text-yellow-300 border-yellow-600/50',
    badgeLabel:   'Advertencia',
    pulso:        false,
  },
  URGENTE: {
    wrapperClass: 'bg-orange-950/60 border-orange-600/40 text-orange-200',
    iconClass:    'text-orange-400',
    Icon:         AlertTriangle,
    badgeClass:   'bg-orange-900/80 text-orange-300 border-orange-600/50',
    badgeLabel:   'Urgente',
    pulso:        false,
  },
  CRITICA: {
    wrapperClass: 'bg-red-950/60 border-red-600/40 text-red-200',
    iconClass:    'text-red-400',
    Icon:         AlertOctagon,
    badgeClass:   'bg-red-900/80 text-red-300 border-red-600/50',
    badgeLabel:   '¡Crítico!',
    pulso:        true,
  },
  VENCIDA: {
    wrapperClass: 'bg-slate-950/80 border-slate-600/40 text-slate-400',
    iconClass:    'text-slate-500',
    Icon:         AlertOctagon,
    badgeClass:   'bg-slate-800 text-slate-400 border-slate-600/50',
    badgeLabel:   'Vencida',
    pulso:        false,
  },
}

// ─── Barra de progreso ────────────────────────────────────────────────────────

function BarraProgreso({ pct, nivel }: { pct: number; nivel: NivelAlertaFurag }) {
  const colorBarra =
    nivel === 'CRITICA' || nivel === 'VENCIDA' ? 'bg-red-500' :
    nivel === 'URGENTE'    ? 'bg-orange-500' :
    nivel === 'ADVERTENCIA'? 'bg-yellow-500' : 'bg-sky-500'

  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${colorBarra}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function FuragAlertaVigencia({ anioVigencia }: Props) {
  const [estado, setEstado]       = useState<EstadoVigenciaFurag | null>(null)
  const [cerrado, setCerrado]     = useState(false)
  const [error, setError]         = useState(false)

  useEffect(() => {
    const url = anioVigencia
      ? `/api/admin/mipg/alerta-vigencia?anioVigencia=${anioVigencia}`
      : `/api/admin/mipg/alerta-vigencia`

    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: EstadoVigenciaFurag) => setEstado(d))
      .catch(() => setError(true))
  }, [anioVigencia])

  // Silencio en estados de no-alerta
  if (error || cerrado || !estado) return null
  if (estado.nivel === 'FUERA_DE_PERIODO') return null
  if (estado.nivel === 'INFORMATIVA' && estado.diasRestantes > 60) return null

  const cfg = NIVEL_CONFIG[estado.nivel]
  if (!cfg) return null

  const { wrapperClass, iconClass, Icon, badgeClass, badgeLabel, pulso } = cfg

  const fechaCierreFormateada = new Date(estado.fechaCierre + 'T12:00:00').toLocaleDateString(
    'es-CO', { day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div
      role="alert"
      className={`relative border rounded-xl px-4 py-3.5 ${wrapperClass} ${pulso ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Ícono */}
        <div className="shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${iconClass}`} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
              {badgeLabel}
            </span>
            <span className="text-xs font-semibold">
              {estado.mensaje}
            </span>
          </div>

          {/* Barra de tiempo consumido */}
          {estado.estaAbierto && (
            <div className="space-y-0.5">
              <BarraProgreso pct={estado.porcentajeConsumido} nivel={estado.nivel} />
              <div className="flex justify-between text-[10px] opacity-60">
                <span>Apertura: {new Date(estado.fechaApertura + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</span>
                <span>{estado.porcentajeConsumido}% consumido</span>
                <span>Cierre: {fechaCierreFormateada}</span>
              </div>
            </div>
          )}

          {/* Recomendación */}
          <p className="text-[11px] opacity-75 leading-snug">
            {estado.recomendacion}
          </p>

          {/* Enlace externo FURAG */}
          {estado.nivel !== 'VENCIDA' && (
            <a
              href="https://www.funcionpublica.gov.co/web/mipg/furag"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity"
            >
              Ir al módulo FURAG del DAFP
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Botón cerrar */}
        <button
          onClick={() => setCerrado(true)}
          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Cerrar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
