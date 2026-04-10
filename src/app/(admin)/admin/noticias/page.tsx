import { Metadata } from "next"
import { NoticiasClient } from "./noticias-client"

export const metadata: Metadata = {
  title: "Gestión de Noticias | Panel de Administración",
  description: "Administrar noticias y publicaciones de la Personería de Guadalajara de Buga",
}

export default function NoticiasPage() {
  return <NoticiasClient />
}
