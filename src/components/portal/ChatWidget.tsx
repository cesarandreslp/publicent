'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, Sparkles, User, Send, X, Loader2 } from 'lucide-react'

interface Mensaje {
  rol: 'user' | 'assistant'
  texto: string
  fuentes?: Array<{ titulo: string; url: string | null }>
}

interface Props {
  nombreEntidad?: string | null
}

export function ChatWidget({ nombreEntidad }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  )

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)
  const nombre = nombreEntidad ?? 'la entidad'

  // Saludo inicial
  useEffect(() => {
    if (mensajes.length === 0) {
      setMensajes([
        {
          rol: 'assistant',
          texto: `Hola, soy el asistente de ${nombre}. ¿En qué te puedo ayudar?`,
        },
      ])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll al último mensaje
  useEffect(() => {
    if (listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight
    }
  }, [mensajes])

  // Foco al abrir
  useEffect(() => {
    if (abierto) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [abierto])

  // Cerrar con Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) setAbierto(false)
    },
    [abierto]
  )
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || cargando) return

    const historialParaApi = mensajes
      .slice(-10)
      .map((m) => ({ rol: m.rol, texto: m.texto }))

    setMensajes((prev) => [...prev, { rol: 'user', texto }])
    setInput('')
    setCargando(true)

    try {
      const res = await fetch('/api/portal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: texto, historial: historialParaApi, sessionId }),
      })

      const data = (await res.json()) as {
        respuesta?: string
        fuentes?: Array<{ titulo: string; url: string | null }>
        error?: string
      }

      if (!res.ok) {
        setMensajes((prev) => [
          ...prev,
          { rol: 'assistant', texto: data.error ?? 'Ocurrió un error. Por favor intenta de nuevo.' },
        ])
        return
      }

      setMensajes((prev) => [
        ...prev,
        {
          rol: 'assistant',
          texto: data.respuesta ?? 'No pude generar una respuesta.',
          fuentes: data.fuentes,
        },
      ])
    } catch {
      setMensajes((prev) => [
        ...prev,
        { rol: 'assistant', texto: 'No fue posible conectar con el asistente. Intenta más tarde.' },
      ])
    } finally {
      setCargando(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <>
      {/* Panel de chat */}
      {abierto && (
        <div
          role="dialog"
          aria-label={`Asistente virtual de ${nombre}`}
          aria-modal="true"
          className="fixed bottom-20 right-4 z-50 flex flex-col bg-slate-900 rounded-2xl shadow-2xl border border-slate-700"
          style={{ width: '380px', height: '520px' }}
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <span className="text-slate-100 font-semibold text-sm">Asistente IA</span>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de mensajes */}
          <div
            ref={listaRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
            aria-live="polite"
            aria-atomic="false"
          >
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                    msg.rol === 'assistant' ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                  aria-hidden="true"
                >
                  {msg.rol === 'assistant' ? (
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-white" />
                  )}
                </div>

                {/* Burbuja */}
                <div className="max-w-[78%] space-y-1">
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.rol === 'assistant'
                        ? 'bg-slate-800 text-slate-100 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.texto}
                  </div>

                  {/* Fuentes */}
                  {msg.fuentes && msg.fuentes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {msg.fuentes.map((f, fi) => (
                        <span key={fi}>
                          {f.url ? (
                            <a
                              href={f.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 underline hover:text-blue-300"
                            >
                              {f.titulo}
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">{f.titulo}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {cargando && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" aria-label="El asistente está pensando" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-700">
            <div className="flex gap-2 items-end bg-slate-800 rounded-xl px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Escribe tu pregunta…"
                rows={1}
                maxLength={500}
                disabled={cargando}
                aria-label="Escribe tu pregunta al asistente"
                className="flex-1 bg-transparent text-slate-100 text-sm placeholder-slate-500 resize-none outline-none max-h-24 overflow-y-auto disabled:opacity-50"
                style={{ lineHeight: '1.5' }}
              />
              <button
                onClick={enviar}
                disabled={!input.trim() || cargando}
                aria-label="Enviar mensaje"
                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 text-center">
              Las respuestas se basan en el contenido oficial de {nombre}.
            </p>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setAbierto((prev) => !prev)}
        aria-label={abierto ? 'Cerrar asistente virtual' : 'Abrir asistente virtual'}
        aria-expanded={abierto}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        }}
      >
        {abierto ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  )
}
