import { Metadata } from "next"
import { NoticiaForm } from "../components/noticia-form"

export const metadata: Metadata = {
  title: "Nueva Noticia | Panel de Administración",
  description: "Crear una nueva noticia",
}

export default function NuevaNoticiaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Noticia</h1>
        <p className="text-gray-600 mt-1">
          Crea una nueva noticia o publicación para el sitio
        </p>
      </div>

      <NoticiaForm />
    </div>
  )
}
