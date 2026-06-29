import { Metadata } from "next"
import { NoticiasClient } from "./noticias-client"

export const metadata: Metadata = {
  title: "Gestión de Noticias | Panel de Administración",
  description: "Administrar noticias y publicaciones de la entidad",
}

export default function NoticiasPage() {
  return <NoticiasClient />
}
