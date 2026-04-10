import { Metadata } from "next"
import { EstadisticasClient } from "./estadisticas-client"

export const metadata: Metadata = {
  title: "Dashboard de Estadísticas | Panel de Administración",
  description: "Métricas y estadísticas del sitio web",
}

export default function EstadisticasPage() {
  return <EstadisticasClient />
}
