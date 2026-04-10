import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Autenticación | Personería Municipal de Guadalajara de Buga",
  description: "Acceso al sistema de administración",
  robots: "noindex, nofollow"
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 min-h-screen bg-linear-to-br from-[#003366] via-[#002244] to-[#001a33] flex items-center justify-center p-4 z-50">
      <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
      {children}
    </div>
  )
}
