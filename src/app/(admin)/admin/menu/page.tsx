import { Metadata } from "next"
import { MenuClient } from "./menu-client"

export const metadata: Metadata = {
  title: "Editor de Menú | Panel de Administración",
  description: "Administrar la estructura del menú principal del sitio",
}

export default function MenuPage() {
  return <MenuClient />
}
