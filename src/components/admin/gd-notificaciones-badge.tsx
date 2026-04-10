"use client"

/**
 * Badge de notificaciones del Gestor Documental para el sidebar admin.
 *
 * Muestra el conteo de notificaciones no leídas y un dropdown
 * con la lista de eventos recientes (radicados asignados, VoBo, CC, vencimientos).
 */

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Bell, X, Inbox, CheckCircle, MessageSquare,
  AlertTriangle, Clock
} from "lucide-react"
import { useGdNotificaciones, type GdNotificacion } from "@/hooks/useGdNotificaciones"

const TIPO_CONFIG: Record<GdNotificacion["tipo"], {
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}> = {
  radicado_asignado: { icon: Inbox, color: "text-blue-400", bg: "bg-blue-500/20" },
  vobo_solicitado:   { icon: CheckCircle, color: "text-amber-400", bg: "bg-amber-500/20" },
  informado_cc:      { icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/20" },
  proximo_vencer:    { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20" },
}

function formatRelativo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const segs = Math.floor(diff / 1000)
  if (segs < 60) return "Ahora"
  const mins = Math.floor(segs / 60)
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  return `Hace ${Math.floor(hrs / 24)}d`
}

export default function GdNotificacionesBadge() {
  const { notificaciones, noLeidas, conectado, marcarLeida, limpiar } = useGdNotificaciones()
  const [abierto, setAbierto] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del badge */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors group"
        title={conectado ? "Notificaciones (conectado)" : "Notificaciones (desconectado)"}
      >
        <Bell className={`w-5 h-5 ${conectado ? "text-slate-400 group-hover:text-white" : "text-slate-600"} transition-colors`} />

        {/* Indicador de conexión */}
        <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
          conectado ? "bg-green-400" : "bg-red-400 animate-pulse"
        }`} />

        {/* Conteo no leídas */}
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
            {noLeidas > 99 ? "99+" : noLeidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute right-0 top-12 w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Notificaciones GD</h3>
              {noLeidas > 0 && (
                <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-medium">
                  {noLeidas} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {notificaciones.length > 0 && (
                <button
                  onClick={limpiar}
                  className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                  Limpiar
                </button>
              )}
              <button onClick={() => setAbierto(false)}>
                <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-sm text-slate-500">Sin notificaciones</p>
                <p className="text-xs text-slate-600 mt-1">
                  {conectado ? "Recibirás alertas en tiempo real" : "Reconectando..."}
                </p>
              </div>
            ) : (
              notificaciones.slice(0, 20).map((notif) => {
                const config = TIPO_CONFIG[notif.tipo]
                const Icon = config.icon
                return (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer ${
                      !notif.leido ? "bg-blue-500/5" : ""
                    }`}
                    onClick={() => marcarLeida(notif.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.leido ? "text-slate-400" : "text-white font-medium"}`}>
                          {notif.mensaje}
                        </p>
                        {notif.numero && (
                          <Link
                            href={`/admin/gd/${notif.radicadoId}`}
                            className="text-xs text-blue-400 hover:underline mt-0.5 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {notif.numero} →
                          </Link>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-600 whitespace-nowrap flex-shrink-0">
                        {formatRelativo(notif.timestamp)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
