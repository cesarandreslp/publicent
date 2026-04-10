import { Metadata } from "next"
import { DocumentosClient } from "./documentos-client"

export const metadata: Metadata = {
  title: "Gestión de Documentos | Panel de Administración",
  description: "Administrar documentos y archivos del sitio",
}

export default function DocumentosPage() {
  return <DocumentosClient />
}
