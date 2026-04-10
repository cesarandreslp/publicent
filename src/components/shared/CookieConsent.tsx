"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export function CookieConsent() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Mostrar siempre al ingresar a la página
    // Solo verificamos si ya se aceptó en esta sesión
    const cookieAccepted = sessionStorage.getItem("cookieConsent")
    if (!cookieAccepted) {
      setShowModal(true)
    }
  }, [])

  const handleAccept = () => {
    sessionStorage.setItem("cookieConsent", "true")
    setShowModal(false)
  }

  if (!showModal) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        {/* Ícono de advertencia */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-yellow-400 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-yellow-500" strokeWidth={3} />
          </div>
        </div>

        {/* Título */}
        <h2 
          id="cookie-title" 
          className="text-2xl font-semibold text-center text-gray-800 mb-4"
        >
          Advertencia
        </h2>

        {/* Descripción */}
        <p 
          id="cookie-description" 
          className="text-center text-gray-600 mb-6 leading-relaxed"
        >
          Este portal utiliza cookies. Si continúas navegando, consideramos que aceptas su uso, de acuerdo con esta política.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleAccept}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            autoFocus
          >
            CONTINUAR
          </button>
          <Link
            href="/privacidad"
            className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-md transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={handleAccept}
          >
            INFORMACIÓN
          </Link>
        </div>
      </div>
    </div>
  )
}
