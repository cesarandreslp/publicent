import { Metadata } from "next"
import { UsuariosClient } from "./usuarios-client"

export const metadata: Metadata = {
  title: "Gestión de Usuarios | Panel de Administración",
  description: "Administrar usuarios del sistema",
}

export default function UsuariosPage() {
  return <UsuariosClient />
}
