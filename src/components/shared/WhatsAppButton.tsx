"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"

interface ConfiguracionWhatsApp {
  activo: boolean
  numero: string
  mensaje: string
  nombreAgente: string
  mensajeBienvenida: string
}

interface WhatsAppButtonProps {
  // Props opcionales para uso estático (fallback)
  phoneNumber?: string
  message?: string
  agentName?: string
  welcomeMessage?: string
}

export function WhatsAppButton({
  phoneNumber,
  message,
  agentName,
  welcomeMessage,
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)
  const [config, setConfig] = useState<ConfiguracionWhatsApp | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar configuración desde la API
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/configuracion?clave=whatsapp')
        if (response.ok) {
          const data = await response.json()
          setConfig(data.valor as ConfiguracionWhatsApp)
        }
      } catch (error) {
        console.error('Error al cargar configuración de WhatsApp:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  // Cerrar tooltip después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Valores finales (API > props > defaults)
  const finalPhoneNumber = config?.numero || phoneNumber || '573000000000'
  const finalMessage = config?.mensaje || message || 'Hola, tengo una consulta sobre los servicios de la Personería Municipal de Buga.'
  const finalAgentName = config?.nombreAgente || agentName || 'Personería de Buga'
  const finalWelcomeMessage = config?.mensajeBienvenida || welcomeMessage || '¿Necesita ayuda? Escríbanos por WhatsApp'

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(finalMessage)
    const whatsappUrl = `https://wa.me/${finalPhoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  // No mostrar mientras carga o si está desactivado
  if (loading) return null
  if (config && !config.activo) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Tooltip / Chat bubble */}
      {(showTooltip || isOpen) && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
            isOpen ? "w-72 opacity-100" : "w-64 opacity-100"
          }`}
        >
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-[#25D366]"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{finalAgentName}</p>
                <p className="text-white/80 text-xs">En línea</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                setShowTooltip(false)
              }}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#E5DDD5]">
            <div className="bg-white rounded-lg p-3 shadow-sm relative">
              <p className="text-gray-700 text-sm">{finalWelcomeMessage}</p>
              <span className="text-[10px] text-gray-400 absolute bottom-1 right-2">
                Ahora
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-white border-t">
            <button
              onClick={handleClick}
              className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-medium py-2.5 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Iniciar chat
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110"
        aria-label="Abrir WhatsApp"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 text-white"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        
        {/* Indicador de notificación */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">1</span>
        </span>
      </button>
    </div>
  )
}
