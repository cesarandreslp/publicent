import { Metadata } from "next"
import { Suspense } from "react"
import RestablecerForm from "@/components/auth/restablecer-form"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Restablecer Contraseña | Personería Municipal de Guadalajara de Buga",
  description: "Establece una nueva contraseña"
}

function RestablecerFormFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
    </div>
  )
}

export default function RestablecerContrasenaPage() {
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
          Nueva Contraseña
        </h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
        </p>
        
        <Suspense fallback={<RestablecerFormFallback />}>
          <RestablecerForm />
        </Suspense>

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
