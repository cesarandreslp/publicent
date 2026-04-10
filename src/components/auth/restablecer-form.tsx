"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function RestablecerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Validación de contraseña
  const passwordValidation = {
    length: password.length >= 8,
    match: password === confirmPassword && password.length > 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    if (!token) {
      setErrorMessage("Token no válido. Solicita un nuevo enlace de recuperación.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden")
      return
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/restablecer-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setErrorMessage(data.error || "Error al restablecer la contraseña")
      } else {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (error) {
      setErrorMessage("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Enlace inválido
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          El enlace de recuperación no es válido o ha expirado.
        </p>
        <Link 
          href="/recuperar-contrasena"
          className="text-[#003366] hover:text-[#D4AF37] font-medium"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          ¡Contraseña actualizada!
        </h3>
        <p className="text-gray-600 text-sm">
          Tu contraseña ha sido cambiada exitosamente. Serás redirigido al inicio de sesión...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mensaje de error */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* Nueva contraseña */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Nueva contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmar contraseña */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Confirmar contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Validación visual */}
      <div className="space-y-2 text-sm">
        <div className={`flex items-center ${passwordValidation.length ? "text-green-600" : "text-gray-400"}`}>
          <CheckCircle className={`h-4 w-4 mr-2 ${passwordValidation.length ? "" : "opacity-50"}`} />
          Mínimo 8 caracteres
        </div>
        <div className={`flex items-center ${passwordValidation.match ? "text-green-600" : "text-gray-400"}`}>
          <CheckCircle className={`h-4 w-4 mr-2 ${passwordValidation.match ? "" : "opacity-50"}`} />
          Las contraseñas coinciden
        </div>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isLoading || !passwordValidation.length || !passwordValidation.match}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white bg-[#003366] hover:bg-[#002244] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Guardando...
          </>
        ) : (
          "Restablecer contraseña"
        )}
      </button>
    </form>
  )
}
