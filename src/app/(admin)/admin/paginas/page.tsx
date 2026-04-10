import { getTenantPrisma } from "@/lib/tenant"
import Link from "next/link"
import SeccionesEditor from "@/components/admin/secciones-editor"

export const metadata = { title: "Páginas y Secciones — Panel Admin" }

export default async function PaginasPage() {
  const prisma = await getTenantPrisma()

  const paginas = await prisma.pagina.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      secciones: {
        orderBy: { orden: "asc" },
        select: { id: true, nombre: true, tipo: true, visible: true, orden: true },
      },
    },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Páginas y Secciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Edita el contenido de cada sección del sitio de forma intuitiva
          </p>
        </div>
        <Link
          href="/admin/paginas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva página
        </Link>
      </div>

      {/* Sección de ayuda */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-blue-700">¿Cómo funciona el editor?</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Cada página contiene secciones arrastrables. Haz clic en el ícono ✏️ de cualquier sección para
            editar su contenido directamente, o usa el ojo 👁 para mostrar / ocultar secciones.
            Los cambios se guardan automáticamente.
          </p>
        </div>
      </div>

      {/* Lista de páginas */}
      {paginas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-slate-600 font-medium">No hay páginas creadas aún</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">Crea tu primera página para empezar</p>
          <Link href="/admin/paginas/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition">
            + Nueva página
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {paginas.map((pagina) => (
            <div key={pagina.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header de la página */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${pagina.publicada ? "bg-emerald-400" : "bg-amber-400"}`} />
                  <div>
                    <p className="font-semibold text-slate-900">{pagina.titulo}</p>
                    <p className="text-xs text-slate-400">
                      /{pagina.slug} · {pagina.plantilla} · {pagina.secciones.length} sección{pagina.secciones.length !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/${pagina.slug}`}
                    target="_blank"
                    title="Ver página"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                  <Link
                    href={`/admin/paginas/${pagina.id}`}
                    title="Editar página"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Secciones de la página */}
              {pagina.secciones.length > 0 ? (
                <SeccionesEditor
                  paginaId={pagina.id}
                  secciones={pagina.secciones}
                />
              ) : (
                <div className="px-6 py-5 text-sm text-slate-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <Link href={`/admin/paginas/${pagina.id}`} className="text-blue-500 hover:underline">
                    Añadir secciones a esta página
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
