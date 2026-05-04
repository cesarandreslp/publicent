'use client'

/**
 * ChatRadicado — Chat bidireccional ciudadano ↔ funcionario
 *
 * Props:
 *  pqrsId       ID interno del radicado (no el número público)
 *  token        Número de radicado — actúa como token de acceso para el ciudadano
 *  esFuncionario Si true, puede ver notas internas y enviarlas
 *  nombreEntidad Nombre de la entidad para el header
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Lock, RefreshCw, Paperclip } from 'lucide-react'

interface Mensaje {
  id:         string
  contenido:  string
  archivoUrl?: string | null
  esInterno:  boolean
  esCiudadano: boolean
  remitente:  string
  leido:      boolean
  fecha:      string
}

interface ChatRadicadoProps {
  pqrsId:        string
  token:         string   // número de radicado
  esFuncionario?: boolean
  nombreEntidad?: string
}

export function ChatRadicado({
  pqrsId,
  token,
  esFuncionario = false,
  nombreEntidad = 'La entidad',
}: ChatRadicadoProps) {
  const [mensajes, setMensajes]     = useState<Mensaje[]>([])
  const [contenido, setContenido]   = useState('')
  const [esInterno, setEsInterno]   = useState(false)
  const [loading, setLoading]       = useState(false)
  const [enviando, setEnviando]     = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const cargarMensajes = useCallback(async () => {
    setLoading(true)
    try {
      const url = `/api/pqrsd/${pqrsId}/chat?token=${encodeURIComponent(token)}`
      const res = await fetch(url)
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error')
      const data = await res.json()
      setMensajes(data.mensajes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar mensajes')
    } finally {
      setLoading(false)
    }
  }, [pqrsId, token])

  useEffect(() => {
    cargarMensajes()
  }, [cargarMensajes])

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contenido.trim()) return
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch(`/api/pqrsd/${pqrsId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: contenido.trim(), esInterno, token }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al enviar')
      const nuevo = await res.json()
      setMensajes(prev => [...prev, nuevo])
      setContenido('')
      setEsInterno(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al enviar el mensaje')
    } finally {
      setEnviando(false)
    }
  }

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <section
      className="flex flex-col h-full min-h-[400px] max-h-[600px] border rounded-xl overflow-hidden bg-white"
      aria-label="Chat de seguimiento"
    >
      {/* Header */}
      <div className="bg-gov-blue px-4 py-3 flex items-center justify-between shrink-0">
        <h3 className="text-white font-semibold text-sm">Chat de seguimiento</h3>
        <button
          onClick={cargarMensajes}
          disabled={loading}
          className="text-blue-200 hover:text-white transition-colors"
          aria-label="Recargar mensajes"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" role="log" aria-live="polite">
        {loading && mensajes.length === 0 && (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" aria-label="Cargando mensajes" />
          </div>
        )}

        {!loading && mensajes.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No hay mensajes aún. Puede escribir una consulta o actualización.
          </p>
        )}

        {mensajes.map(msg => {
          const esMio = esFuncionario ? !msg.esCiudadano : msg.esCiudadano

          return (
            <div
              key={msg.id}
              className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  msg.esInterno
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                    : esMio
                    ? 'bg-gov-blue text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}
              >
                {/* Remitente */}
                <p className={`text-xs font-semibold mb-1 ${
                  msg.esInterno ? 'text-yellow-600'
                  : esMio ? 'text-blue-100'
                  : 'text-gray-500'
                }`}>
                  {msg.esInterno && <Lock className="w-3 h-3 inline mr-1" aria-hidden="true" />}
                  {msg.esInterno ? `Nota interna — ${msg.remitente}` : msg.remitente}
                </p>

                {/* Contenido */}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.contenido}</p>

                {/* Adjunto */}
                {msg.archivoUrl && (
                  <a
                    href={msg.archivoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1 text-xs mt-1.5 underline ${
                      esMio ? 'text-blue-200' : 'text-gov-blue'
                    }`}
                  >
                    <Paperclip className="w-3 h-3" aria-hidden="true" />
                    Ver adjunto
                  </a>
                )}

                {/* Fecha */}
                <time
                  dateTime={msg.fecha}
                  className={`block text-xs mt-1 ${
                    msg.esInterno ? 'text-yellow-500'
                    : esMio ? 'text-blue-200'
                    : 'text-gray-400'
                  }`}
                >
                  {formatFecha(msg.fecha)}
                </time>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Error */}
      {error && (
        <p className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100" role="alert">
          {error}
        </p>
      )}

      {/* Composer */}
      <form
        onSubmit={enviar}
        className="shrink-0 border-t bg-white p-3 space-y-2"
        aria-label="Escribir mensaje"
      >
        {/* Toggle nota interna (solo funcionarios) */}
        {esFuncionario && (
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={esInterno}
              onChange={e => setEsInterno(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
            />
            <Lock className="w-3 h-3" aria-hidden="true" />
            Nota interna (solo visible para funcionarios)
          </label>
        )}

        <div className="flex gap-2">
          <textarea
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(e as any) }
            }}
            placeholder={esInterno ? 'Escribir nota interna...' : 'Escribir mensaje...'}
            rows={2}
            maxLength={2000}
            aria-label="Mensaje"
            className={`flex-1 px-3 py-2 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gov-blue ${
              esInterno ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
            }`}
          />
          <button
            type="submit"
            disabled={enviando || !contenido.trim()}
            className="self-end px-3 py-2 bg-gov-blue text-white rounded-lg hover:bg-gov-blue-dark transition-colors disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            {enviando
              ? <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              : <Send className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-right">{contenido.length}/2000</p>
      </form>
    </section>
  )
}
