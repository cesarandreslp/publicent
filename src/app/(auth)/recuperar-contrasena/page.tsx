import { Metadata } from "next"
import RecuperarForm from "@/components/auth/recuperar-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Recuperar Contraseña | Personería Municipal de Guadalajara de Buga",
  description: "Recupera el acceso a tu cuenta"
}

export default function RecuperarContrasenaPage() {
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
          Recuperar Contraseña
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        
        <RecuperarForm />

        <div className="mt-6 text-center">
          <Link 
            href="/login"
            className="text-sm text-[#003366] hover:text-[#D4AF37] transition-colors"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
