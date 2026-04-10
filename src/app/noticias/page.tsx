import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, ArrowRight, Tag, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Pagination } from '@/components/shared/pagination'

export const metadata: Metadata = {
  title: 'Noticias | Personería Municipal de Guadalajara de Buga',
  description:
    'Mantente informado sobre las actividades, eventos y noticias de la Personería Municipal de Guadalajara de Buga',
}

// Datos de ejemplo para las noticias
const noticias = [
  {
    id: '1',
    slug: 'jornada-derechos-humanos-2026',
    titulo: 'Gran Jornada de Promoción de Derechos Humanos en Guadalajara de Buga',
    extracto:
      'La Personería Municipal realizó una exitosa jornada de sensibilización sobre derechos humanos dirigida a la comunidad educativa del municipio.',
    imagen: '/images/noticias/derechos-humanos.jpg',
    fecha: '2026-01-15',
    categoria: 'Eventos',
    tiempoLectura: '3 min',
    destacada: true,
  },
  {
    id: '2',
    slug: 'capacitacion-veedurias-ciudadanas',
    titulo: 'Capacitación a Veedurías Ciudadanas en Control Social',
    extracto:
      'Se llevó a cabo una capacitación intensiva para fortalecer las capacidades de las veedurías ciudadanas en el ejercicio del control social.',
    imagen: '/images/noticias/veedurias.jpg',
    fecha: '2026-01-10',
    categoria: 'Capacitación',
    tiempoLectura: '4 min',
    destacada: true,
  },
  {
    id: '3',
    slug: 'nuevo-horario-atencion-2026',
    titulo: 'Nuevo Horario de Atención al Público para 2026',
    extracto:
      'Informamos a la comunidad sobre los nuevos horarios de atención presencial y virtual que regirán durante el presente año.',
    imagen: '/images/noticias/horarios.jpg',
    fecha: '2026-01-05',
    categoria: 'Institucional',
    tiempoLectura: '2 min',
    destacada: false,
  },
  {
    id: '4',
    slug: 'informe-gestion-2025',
    titulo: 'Presentación del Informe de Gestión 2025',
    extracto:
      'El Personero Municipal presentó ante el Concejo Municipal el informe de gestión correspondiente a la vigencia 2025.',
    imagen: '/images/noticias/informe.jpg',
    fecha: '2025-12-20',
    categoria: 'Gestión',
    tiempoLectura: '5 min',
    destacada: false,
  },
  {
    id: '5',
    slug: 'alianza-defensoria-pueblo',
    titulo: 'Nueva Alianza con la Defensoría del Pueblo Regional',
    extracto:
      'Se firmó un convenio de cooperación con la Defensoría del Pueblo para fortalecer la atención a víctimas del conflicto.',
    imagen: '/images/noticias/alianza.jpg',
    fecha: '2025-12-15',
    categoria: 'Convenios',
    tiempoLectura: '3 min',
    destacada: true,
  },
  {
    id: '6',
    slug: 'feria-servicios-comuna-5',
    titulo: 'Feria de Servicios en la Comuna 5',
    extracto:
      'La Personería participó en la feria de servicios llevando atención jurídica gratuita a los habitantes de la comuna 5.',
    imagen: '/images/noticias/feria.jpg',
    fecha: '2025-12-10',
    categoria: 'Eventos',
    tiempoLectura: '2 min',
    destacada: false,
  },
]

const categorias = [
  { id: 'todas', nombre: 'Todas' },
  { id: 'eventos', nombre: 'Eventos' },
  { id: 'capacitacion', nombre: 'Capacitación' },
  { id: 'institucional', nombre: 'Institucional' },
  { id: 'gestion', nombre: 'Gestión' },
  { id: 'convenios', nombre: 'Convenios' },
]

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NoticiasPage() {
  const noticiasDestacadas = noticias.filter((n) => n.destacada).slice(0, 3)
  const otrasnoticias = noticias.filter((n) => !n.destacada)

  return (
    <>
      <PageHeader
        title="Noticias"
        description="Mantente informado sobre las actividades y eventos de la Personería Municipal"
        breadcrumbItems={[{ label: 'Noticias' }]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Noticias Destacadas */}
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
                  <span className="inline-block px-3 py-1 bg-gov-gold text-gray-900 text-xs font-bold rounded-full mb-3">
                    {noticiasDestacadas[0].categoria}
                  </span>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 group-hover:text-gov-gold transition-colors">
                    {noticiasDestacadas[0].titulo}
                  </h3>
                  <p className="text-white/80 mb-3 line-clamp-2">{noticiasDestacadas[0].extracto}</p>
                  <div className="flex items-center gap-4 text-white/60 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatearFecha(noticiasDestacadas[0].fecha)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {noticiasDestacadas[0].tiempoLectura}
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
                    <span className="inline-block px-2 py-0.5 bg-gov-blue/10 text-gov-blue text-xs font-medium rounded mb-2">
                      {noticia.categoria}
                    </span>
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

        {/* Filtro por categoría */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
            {categorias.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat.id === 'todas'
                    ? 'bg-gov-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </section>

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
                  <div className="absolute inset-0 bg-gov-blue/10 flex items-center justify-center">
                    <span className="text-gov-blue/30 text-6xl font-bold">P</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gov-blue/10 text-gov-blue text-xs font-medium rounded">
                      {noticia.categoria}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {noticia.tiempoLectura}
                    </span>
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

        {/* Paginación */}
        <div className="flex justify-center">
          <Pagination currentPage={1} totalPages={3} baseUrl="/noticias" />
        </div>
      </main>
    </>
  )
}
