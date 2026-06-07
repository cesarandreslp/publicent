import Link from "next/link"
import { redirect } from "next/navigation"
import { getSASession } from "@/lib/superadmin-auth"
import { MODULOS_CATALOGO } from "@/lib/modules"
import AprovisionarClient from "./aprovisionar-client"

export const metadata = { title: "Aprovisionar tenant — OSS Innovation" }

export default async function AprovisionarPage() {
  const session = await getSASession()
  if (!session) redirect("/superadmin-login")

  // Catálogo de módulos para los checkboxes (los obligatorios van siempre activos)
  const modulos = MODULOS_CATALOGO.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    categoria: m.categoria,
    obligatorio: !!m.obligatorio,
  }))

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/superadmin/tenants" className="text-sm text-slate-400 hover:text-white">← Tenants</Link>
        <h1 className="text-2xl font-bold text-white mt-2">Aprovisionar tenant automáticamente</h1>
        <p className="text-sm text-slate-400 mt-1">
          Crea la base de datos en Neon, aplica el esquema, siembra los datos y activa los
          módulos contratados — todo en un paso. Activación <strong>por contrato</strong>.
        </p>
      </div>
      <AprovisionarClient modulos={modulos} />
    </div>
  )
}
