import { Metadata } from "next"
import { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Iniciar Sesión | Personería Municipal de Guadalajara de Buga",
  description: "Acceso al panel de administración"
}

function LoginFormFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md relative z-10">
      {/* Logo y título */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
          <div className="w-16 h-16 bg-[#003366] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Personería Municipal
        </h1>
        <p className="text-gray-300 text-sm">
          Guadalajara de Buga
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          Iniciar Sesión
        </h2>
        
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center">
          <Link 
            href="/recuperar-contrasena"
            className="text-sm text-[#003366] hover:text-[#D4AF37] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      {/* Enlace al sitio público */}
      <div className="mt-6 text-center">
        <Link 
          href="/"
          className="text-sm text-gray-300 hover:text-white transition-colors"
        >
          ← Volver al sitio público
        </Link>
      </div>
    </div>
  )
}
