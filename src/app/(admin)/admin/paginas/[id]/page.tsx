import { notFound } from "next/navigation"
import { getTenantPrisma } from "@/lib/tenant"
import Link from "next/link"
import PaginaEditForm from "@/components/admin/pagina-edit-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPaginaPage({ params }: PageProps) {
  const { id }  = await params
  const prisma  = await getTenantPrisma()

  const pagina = await prisma.pagina.findUnique({
    where: { id },
    include: { secciones: { orderBy: { orden: "asc" } } },
  })

  if (!pagina) notFound()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/paginas" className="hover:text-slate-700">Páginas</Link>
        <span>/</span>
        <span className="text-slate-800">{pagina.titulo}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{pagina.titulo}</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            /{pagina.slug} · {pagina.secciones.length} sección{pagina.secciones.length !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pagina.publicada && (
            <Link href={`/${pagina.slug}`} target="_blank"
              className="px-3 py-2 text-sm text-slate-600 border border-slate-200 hover:border-slate-400 rounded-xl transition">
              Ver en sitio ↗
            </Link>
          )}
        </div>
      </div>

      <PaginaEditForm
        pagina={{
          id:              pagina.id,
          titulo:          pagina.titulo,
          slug:            pagina.slug,
          descripcion:     pagina.descripcion ?? "",
          plantilla:       pagina.plantilla,
          metaKeywords:    pagina.metaKeywords ?? "",
          publicada:       pagina.publicada,
        }}
        secciones={pagina.secciones.map((s) => ({
          id:            s.id,
          nombre:        s.nombre,
          tipo:          s.tipo,
          contenido:     s.contenido as Record<string, unknown>,
          configuracion: s.configuracion as Record<string, unknown> | null,
          visible:       s.visible,
          orden:         s.orden,
        }))}
      />
    </div>
  )
}
