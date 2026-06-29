import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Calendar,
  ArrowLeft,
  Tag,
  Newspaper,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getTenantPrisma } from '@/lib/tenant'

// Página dinámica por tenant: la noticia se lee de la BD del tenant activo.
export const dynamic = 'force-dynamic'

type NoticiaConRelaciones = {
  id: string
  slug: string
  titulo: string
  extracto: string | null
  contenido: unknown
  imagenDestacada: string | null
  fechaPublicacion: Date | null
  createdAt: Date
  categoria: { nombre: string } | null
  etiquetas: { nombre: string }[]
}

/** Convierte el contenido (Json del editor) a HTML, igual que PaginaContenido. */
function contenidoAHtml(contenido: unknown): string {
  if (typeof contenido === 'string') return contenido
  if (contenido && typeof contenido === 'object' && 'html' in (contenido as Record<string, unknown>)) {
    return String((contenido as Record<string, unknown>).html ?? '')
  }
  return ''
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

async function cargarNoticia(slug: string): Promise<NoticiaConRelaciones | null> {
  try {
    const prisma = await getTenantPrisma()
    const n = await prisma.noticia.findFirst({
      where: { slug, estado: 'PUBLICADO' },
      include: { categoria: true, etiquetas: true },
    })
    if (!n) return null
    return {
      id: n.id,
      slug: n.slug,
      titulo: n.titulo,
      extracto: n.extracto,
      contenido: n.contenido,
      imagenDestacada: n.imagenDestacada,
      fechaPublicacion: n.fechaPublicacion,
      createdAt: n.createdAt,
      categoria: n.categoria ? { nombre: n.categoria.nombre } : null,
      etiquetas: n.etiquetas.map((e) => ({ nombre: e.nombre })),
    }
  } catch {
    return null
  }
}

async function cargarRelacionadas(
  slugActual: string
): Promise<{ slug: string; titulo: string; fecha: string; categoria: string | null }[]> {
  try {
    const prisma = await getTenantPrisma()
    const filas = await prisma.noticia.findMany({
      where: { estado: 'PUBLICADO', slug: { not: slugActual } },
      orderBy: { fechaPublicacion: 'desc' },
      take: 2,
      include: { categoria: true },
    })
    return filas.map((n) => ({
      slug: n.slug,
      titulo: n.titulo,
      fecha: (n.fechaPublicacion ?? n.createdAt).toISOString().slice(0, 10),
      categoria: n.categoria?.nombre ?? null,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const noticia = await cargarNoticia(slug)

  if (!noticia) {
    return { title: 'Noticia no encontrada' }
  }

  const fecha = (noticia.fechaPublicacion ?? noticia.createdAt).toISOString()
  return {
    title: noticia.titulo,
    description: noticia.extracto ?? undefined,
    openGraph: {
      title: noticia.titulo,
      description: noticia.extracto ?? undefined,
      type: 'article',
      publishedTime: fecha,
    },
  }
}

export default async function NoticiaDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const noticia = await cargarNoticia(slug)

  if (!noticia) {
    notFound()
  }

  const fecha = (noticia.fechaPublicacion ?? noticia.createdAt).toISOString().slice(0, 10)
  const contenidoHtml = contenidoAHtml(noticia.contenido)
  const relacionadas = await cargarRelacionadas(slug)

  return (
    <>
      <PageHeader
        title={noticia.titulo}
        breadcrumbItems={[
          { label: 'Noticias', href: '/noticias' },
          { label: noticia.titulo },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Meta información */}
          <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b">
            {noticia.categoria && (
              <span className="px-3 py-1 bg-gov-blue/10 text-gov-blue text-sm font-medium rounded-full">
                {noticia.categoria.nombre}
              </span>
            )}
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatearFecha(fecha)}
            </span>
          </div>

          {/* Imagen destacada */}
          <div className="aspect-video bg-gray-100 rounded-xl mb-8 overflow-hidden">
            {noticia.imagenDestacada ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={noticia.imagenDestacada}
                alt={noticia.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gov-blue/10 flex items-center justify-center">
                <Newspaper className="w-16 h-16 text-gov-blue/30" aria-hidden />
              </div>
            )}
          </div>

          {/* Contenido */}
          {contenidoHtml ? (
            <article
              className="prose prose-lg prose-gray max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: contenidoHtml }}
            />
          ) : (
            <p className="text-gray-500 mb-12">{noticia.extracto}</p>
          )}

          {/* Tags */}
          {noticia.etiquetas.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b">
              <Tag className="w-4 h-4 text-gray-400" />
              {noticia.etiquetas.map((tag) => (
                <span
                  key={tag.nombre}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  {tag.nombre}
                </span>
              ))}
            </div>
          )}

          {/* Noticias relacionadas */}
          {relacionadas.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Noticias Relacionadas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relacionadas.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/noticias/${related.slug}`}
                    className="group flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      {related.categoria && (
                        <span className="text-xs text-gov-blue font-medium">{related.categoria}</span>
                      )}
                      <h3 className="font-semibold text-gray-900 group-hover:text-gov-blue transition-colors">
                        {related.titulo}
                      </h3>
                      <span className="text-xs text-gray-500">{formatearFecha(related.fecha)}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gov-blue transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Navegación */}
          <div className="flex justify-between items-center pt-8 border-t">
            <Link
              href="/noticias"
              className="flex items-center gap-2 text-gray-600 hover:text-gov-blue transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a noticias
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
