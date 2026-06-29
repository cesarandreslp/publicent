import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, ArrowRight, Newspaper } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getTenantPrisma } from '@/lib/tenant'

export const metadata: Metadata = {
  title: 'Noticias',
  description:
    'Mantente informado sobre las actividades, eventos y noticias de la entidad',
}

// Esta página es dinámica por tenant: las noticias salen de la BD del tenant activo.
export const dynamic = 'force-dynamic'

interface NoticiaUI {
  id: string
  slug: string
  titulo: string
  extracto: string | null
  imagen: string | null
  fecha: string
  categoria: string | null
  destacada: boolean
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function cargarNoticias(): Promise<NoticiaUI[]> {
  try {
    const prisma = await getTenantPrisma()
    const filas = await prisma.noticia.findMany({
      where: { estado: 'PUBLICADO' },
      orderBy: { fechaPublicacion: 'desc' },
      take: 30,
      include: { categoria: true },
    })
    return filas.map((n) => ({
      id: n.id,
      slug: n.slug,
      titulo: n.titulo,
      extracto: n.extracto ?? null,
      imagen: n.imagenDestacada ?? null,
      fecha: (n.fechaPublicacion ?? n.createdAt).toISOString().slice(0, 10),
      categoria: n.categoria?.nombre ?? null,
      destacada: n.destacada,
    }))
  } catch {
    // Tenant DB no disponible — devolvemos lista vacía (empty-state), nunca datos de ejemplo.
    return []
  }
}

export default async function NoticiasPage() {
  const noticias = await cargarNoticias()
  const noticiasDestacadas = noticias.filter((n) => n.destacada).slice(0, 3)
  const categorias = Array.from(
    new Set(noticias.map((n) => n.categoria).filter((c): c is string => !!c))
  )

  return (
    <>
      <PageHeader
        title="Noticias"
        description="Mantente informado sobre las actividades y eventos de la entidad"
        breadcrumbItems={[{ label: 'Noticias' }]}
      />

      <main className="container mx-auto px-4 py-12">
        {noticias.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden />
            <p className="text-lg font-medium">Aún no hay noticias publicadas.</p>
            <p className="text-sm">Vuelve pronto para conocer las novedades de la entidad.</p>
          </div>
        ) : (
          <>
            {/* Noticias Destacadas */}
            {noticiasDestacadas.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Destacadas</h2>
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Noticia principal */}
                  {noticiasDestacadas[0] && (
                    <Link
                      href={`/noticias/${noticiasDestacadas[0].slug}`}
                      className="lg:col-span-2 group relative bg-gray-900 rounded-2xl overflow-hidden aspect-video lg:aspect-auto"
                    >
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent z-10" />
                      <div className="absolute inset-0 bg-gov-blue/20" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        {noticiasDestacadas[0].categoria && (
                          <span className="inline-block px-3 py-1 bg-gov-gold text-gray-900 text-xs font-bold rounded-full mb-3">
                            {noticiasDestacadas[0].categoria}
                          </span>
                        )}
                        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-gov-gold transition-colors">
                          {noticiasDestacadas[0].titulo}
                        </h3>
                        <p className="text-white/80 mb-3 line-clamp-2">{noticiasDestacadas[0].extracto}</p>
                        <div className="flex items-center gap-4 text-white/60 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatearFecha(noticiasDestacadas[0].fecha)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Noticias secundarias */}
                  <div className="space-y-4">
                    {noticiasDestacadas.slice(1, 3).map((noticia) => (
                      <Link
                        key={noticia.id}
                        href={`/noticias/${noticia.slug}`}
                        className="group block bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-4">
                          {noticia.categoria && (
                            <span className="inline-block px-2 py-0.5 bg-gov-blue/10 text-gov-blue text-xs font-medium rounded mb-2">
                              {noticia.categoria}
                            </span>
                          )}
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gov-blue transition-colors line-clamp-2">
                            {noticia.titulo}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{noticia.extracto}</p>
                          <div className="flex items-center gap-3 text-gray-400 text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatearFecha(noticia.fecha)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Filtro por categoría (informativo) */}
            {categorias.length > 0 && (
              <section className="mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Categorías:</span>
                  {categorias.map((cat) => (
                    <span
                      key={cat}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Lista de noticias */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas las Noticias</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {noticias.map((noticia) => (
                  <Link
                    key={noticia.id}
                    href={`/noticias/${noticia.slug}`}
                    className="group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      {noticia.imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={noticia.imagen}
                          alt={noticia.titulo}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gov-blue/10 flex items-center justify-center">
                          <Newspaper className="w-10 h-10 text-gov-blue/30" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {noticia.categoria && (
                          <span className="px-2 py-0.5 bg-gov-blue/10 text-gov-blue text-xs font-medium rounded">
                            {noticia.categoria}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gov-blue transition-colors line-clamp-2">
                        {noticia.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{noticia.extracto}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatearFecha(noticia.fecha)}
                        </span>
                        <span className="text-gov-blue text-sm font-medium group-hover:underline flex items-center gap-1">
                          Leer más
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  )
}
