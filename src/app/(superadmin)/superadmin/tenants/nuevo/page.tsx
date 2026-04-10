import TenantForm from "@/components/admin/superadmin/tenant-form"
import Link from "next/link"

export const metadata = { title: "Nueva entidad — PublicEnt Admin" }

export default function NuevoTenantPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/superadmin" className="hover:text-slate-300 transition">Panel</Link>
        <span>/</span>
        <Link href="/superadmin/tenants" className="hover:text-slate-300 transition">Entidades</Link>
        <span>/</span>
        <span className="text-slate-300">Nueva entidad</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-white">Registrar nueva entidad</h1>
        <p className="text-slate-400 text-sm mt-1">
          Completa la información para incorporar una nueva entidad pública a la plataforma.
        </p>
      </div>

      <TenantForm />
    </div>
  )
}
