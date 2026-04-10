"use client"

/**
 * Hook para notificaciones del Gestor Documental via SSE.
 *
 * Se suscribe al endpoint /api/admin/gd/notificaciones/stream
 * y recibe eventos en tiempo real.
 */

import { useState, useEffect, useCallback, useRef } from "react"

export interface GdNotificacion {
  id: string
  tipo: "radicado_asignado" | "vobo_solicitado" | "informado_cc" | "proximo_vencer"
  mensaje: string
  radicadoId?: string
  numero?: string
  asunto?: string
  timestamp: Date
  leido: boolean
  data?: Record<string, unknown>
}

interface UseGdNotificacionesReturn {
  notificaciones: GdNotificacion[]
  noLeidas: number
  conectado: boolean
  marcarLeida: (id: string) => void
  limpiar: () => void
}

export function useGdNotificaciones(): UseGdNotificacionesReturn {
  const [notificaciones, setNotificaciones] = useState<GdNotificacion[]>([])
  const [conectado, setConectado] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const idCounter = useRef(0)

  const agregarNotificacion = useCallback(
    (tipo: GdNotificacion["tipo"], data: Record<string, unknown>) => {
      const notif: GdNotificacion = {
        id: `notif-${++idCounter.current}-${Date.now()}`,
        tipo,
        mensaje: (data.mensaje as string) ?? "",
        radicadoId: data.radicadoId as string,
        numero: data.numero as string,
        asunto: data.asunto as string,
        timestamp: new Date(),
        leido: false,
        data,
      }

      setNotificaciones((prev) => {
        // Máximo 100 notificaciones en memoria
        const updated = [notif, ...prev].slice(0, 100)
        return updated
      })
    },
    []
  )

  useEffect(() => {
    let eventSource: EventSource
    let reconnectTimer: NodeJS.Timeout

    const connect = () => {
      try {
        eventSource = new EventSource("/api/admin/gd/notificaciones/stream")
        eventSourceRef.current = eventSource

        eventSource.onopen = () => setConectado(true)

        // Listener por tipo de evento
        const eventos: GdNotificacion["tipo"][] = [
          "radicado_asignado",
          "vobo_solicitado",
          "informado_cc",
          "proximo_vencer",
        ]

        for (const evento of eventos) {
          eventSource.addEventListener(evento, (e: MessageEvent) => {
            try {
              const data = JSON.parse(e.data)
              agregarNotificacion(evento, data)
            } catch {
              // Ignora datos malformados
            }
          })
        }

        eventSource.onerror = () => {
          setConectado(false)
          eventSource.close()
          // Reconectar después de 5 segundos
          reconnectTimer = setTimeout(connect, 5_000)
        }
      } catch {
        setConectado(false)
        reconnectTimer = setTimeout(connect, 5_000)
      }
    }

    connect()

    return () => {
      eventSource?.close()
      clearTimeout(reconnectTimer)
      setConectado(false)
    }
  }, [agregarNotificacion])

  const marcarLeida = useCallback((id: string) => {
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    )
  }, [])

  const limpiar = useCallback(() => {
    setNotificaciones([])
  }, [])

  const noLeidas = notificaciones.filter((n) => !n.leido).length

  return { notificaciones, noLeidas, conectado, marcarLeida, limpiar }
}
