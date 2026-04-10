import { Metadata } from "next"
import { PqrsClient } from "./pqrs-client"

export const metadata: Metadata = {
  title: "Gestión de PQRSD | Panel de Administración",
  description: "Administrar peticiones, quejas, reclamos, sugerencias y denuncias",
}

export default function PqrsPage() {
  return <PqrsClient />
}
