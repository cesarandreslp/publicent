import { notFound } from "next/navigation"
import { getTenantPrisma } from "@/lib/tenant"
import Link from "next/link"
import NuevaSeccionForm from "@/components/admin/nueva-seccion-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NuevaSeccionPage({ params }: PageProps) {
  const { id } = await params
  const prisma  = await getTenantPrisma()

  const pagina = await prisma.pagina.findUnique({
    where:  { id },
    select: { id: true, titulo: true, slug: true },
  })

  if (!pagina) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin"          className="hover:text-slate-700">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/paginas"  className="hover:text-slate-700">Páginas</Link>
        <span>/</span>
        <Link href={`/admin/paginas/${pagina.id}`} className="hover:text-slate-700">{pagina.titulo}</Link>
        <span>/</span>
        <span className="text-slate-800">Nueva sección</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Añadir sección</h1>
        <p className="text-slate-400 text-sm mt-1">
          Selecciona el tipo de sección y dale un nombre para identificarla.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-6">
        <NuevaSeccionForm paginaId={pagina.id} paginaTitulo={pagina.titulo} />
      </div>
    </div>
  )
}
