import { notFound } from "next/navigation"
import { prismaMeta } from "@/lib/prisma-meta"
import TenantForm from "@/components/admin/superadmin/tenant-form"
import TenantModulos from "@/components/admin/superadmin/tenant-modulos"
import StorageConfigPanel from "@/components/admin/superadmin/storage-config-panel"
import { resolveModulosConfig } from "@/lib/modules"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const tenant = await prismaMeta.tenant.findUnique({ where: { id }, select: { nombre: true } })
  return { title: tenant ? `${tenant.nombre} — PublicEnt Admin` : "Entidad no encontrada" }
}

export default async function EditTenantPage({ params }: PageProps) {
  const { id } = await params
  const tenant = await prismaMeta.tenant.findUnique({
    where: { id },
    include: { eventos: { orderBy: { createdAt: "desc" }, take: 10 } },
  })

  if (!tenant) notFound()

  const TIPO_LABEL: Record<string, string> = {
    PERSONERIA:  "Personería",
    CONTRALORIA: "Contraloría",
    ALCALDIA:    "Alcaldía",
    CONCEJO:     "Concejo",
    GOBERNACION: "Gobernación",
    ASAMBLEA:    "Asamblea",
    OTRO:        "Otra",
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/superadmin" className="hover:text-slate-300 transition">Panel</Link>
        <span>/</span>
        <Link href="/superadmin/tenants" className="hover:text-slate-300 transition">Entidades</Link>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-50">{tenant.nombre}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-lg font-bold text-white uppercase shrink-0">
          {(tenant.nombreCorto ?? tenant.nombre)[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{tenant.nombre}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              tenant.suspendido
                ? "bg-red-900/50 text-red-400"
                : tenant.activo
                  ? "bg-emerald-900/50 text-emerald-400"
                  : "bg-slate-700 text-slate-400"
            }`}>
              {tenant.suspendido ? "Suspendida" : tenant.activo ? "Activa" : "Inactiva"}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            {TIPO_LABEL[tenant.tipoEntidad] ?? tenant.tipoEntidad} · {tenant.slug} · {tenant.plan}
          </p>
        </div>
      </div>

      {/* Formulario */}
      <TenantForm
        initial={{
          id:                   tenant.id,
          slug:                 tenant.slug,
          codigo:               tenant.codigo,
          nombre:               tenant.nombre,
          nombreCorto:          tenant.nombreCorto,
          tipoEntidad:          tenant.tipoEntidad,
          nit:                  tenant.nit ?? "",
          municipio:            tenant.municipio,
          departamento:         tenant.departamento,
          codigoDivipola:       tenant.codigoDivipola ?? "",
          dominioPrincipal:     tenant.dominioPrincipal,
          dominioPersonalizado: tenant.dominioPersonalizado ?? "",
          databaseUrl:          tenant.databaseUrl,
          databaseName:         tenant.databaseName,
          plan:                 tenant.plan,
          emailContacto:        tenant.emailContacto,
          telefonoContacto:     tenant.telefonoContacto ?? "",
          nombreContacto:       tenant.nombreContacto ?? "",
          logoUrl:              tenant.logoUrl ?? "",
          colorPrimario:        tenant.colorPrimario ?? "#1a56db",
          colorSecundario:      tenant.colorSecundario ?? "#7e3af2",
          fechaActivacion:      tenant.fechaActivacion?.toISOString() ?? "",
          fechaVencimiento:     tenant.fechaVencimiento?.toISOString() ?? "",
        }}
      />

      {/* Gestión de módulos */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Módulos activos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Activa o desactiva módulos independientes. Cada módulo puede funcionar solo o integrarse con los demás.
          </p>
        </div>
        <div className="px-6 py-5">
          <TenantModulos
            tenantId={tenant.id}
            plan={tenant.plan}
            modulosRaw={tenant.modulosActivos}
          />
        </div>
      </div>

      {/* Almacenamiento de Documentos */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Almacenamiento de Documentos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configura el proveedor y las credenciales donde se guardarán los archivos del Gestor Documental.
          </p>
        </div>
        <div className="px-6 py-5">
          <StorageConfigPanel
            tenantId={tenant.id}
            initialConfig={resolveModulosConfig(tenant.modulosActivos).gestion_documental.storage}
          />
        </div>
      </div>

      {/* Historial de eventos */}
      {tenant.eventos.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Historial de eventos
            </h2>
          </div>
          <div className="divide-y divide-slate-800">
            {tenant.eventos.map((e) => (
              <div key={e.id} className="px-6 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-slate-300">{e.tipo}</span>
                  {e.descripcion && <span className="text-slate-500 ml-2">{e.descripcion}</span>}
                </div>
                <span className="text-xs text-slate-600 ml-4 shrink-0">
                  {new Date(e.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
