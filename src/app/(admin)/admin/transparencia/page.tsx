import { Metadata } from "next"
import { TransparenciaClient } from "./transparencia-client"

export const metadata: Metadata = {
  title: "Gestión de Transparencia | Panel de Administración",
  description: "Administrar contenidos de transparencia según Ley 1712/2014 y Resolución 1519/2020",
}

export default function TransparenciaPage() {
  return <TransparenciaClient />
}
