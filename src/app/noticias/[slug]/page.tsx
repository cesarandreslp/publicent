import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Tag,
  User,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

// Datos de ejemplo para las noticias
const noticias: Record<string, {
  id: string
  slug: string
  titulo: string
  extracto: string
  contenido: string
  imagen: string
  fecha: string
  categoria: string
  tiempoLectura: string
  autor: string
  tags: string[]
}> = {
  'jornada-derechos-humanos-2026': {
    id: '1',
    slug: 'jornada-derechos-humanos-2026',
    titulo: 'Gran Jornada de Promoción de Derechos Humanos en Guadalajara de Buga',
    extracto:
      'La Personería Municipal realizó una exitosa jornada de sensibilización sobre derechos humanos dirigida a la comunidad educativa del municipio.',
    contenido: `
      <p>La Personería Municipal de Guadalajara de Buga llevó a cabo una importante jornada de promoción y sensibilización sobre derechos humanos, dirigida a estudiantes y docentes de las instituciones educativas del municipio.</p>

      <p>El evento, realizado en el auditorio municipal, contó con la participación de más de 500 estudiantes de diferentes colegios públicos y privados de la ciudad. Durante la jornada, funcionarios de la Personería expusieron sobre los derechos fundamentales consagrados en la Constitución Política de Colombia y los mecanismos existentes para su protección.</p>

      <h2>Objetivos de la Jornada</h2>

      <p>La actividad tuvo como principales objetivos:</p>

      <ul>
        <li>Sensibilizar a la comunidad educativa sobre la importancia de conocer y ejercer los derechos humanos</li>
        <li>Dar a conocer los mecanismos de protección de derechos como la acción de tutela y el derecho de petición</li>
        <li>Promover una cultura de respeto por los derechos humanos entre los jóvenes</li>
        <li>Acercar la Personería Municipal a la comunidad estudiantil</li>
      </ul>

      <h2>Participación Activa</h2>

      <p>Los estudiantes participaron activamente en talleres prácticos donde aprendieron a identificar situaciones de vulneración de derechos y las rutas de atención disponibles. También se realizaron dramatizaciones y actividades lúdicas que permitieron una mejor comprensión de los temas tratados.</p>

      <blockquote>
        "Es fundamental que nuestros jóvenes conozcan sus derechos desde temprana edad. Solo así podremos construir una sociedad más justa y equitativa", expresó el Personero Municipal, Dr. Nikolai Olaya.
      </blockquote>

      <h2>Compromiso Continuo</h2>

      <p>La Personería Municipal reafirma su compromiso con la promoción de los derechos humanos y anuncia que continuará realizando este tipo de jornadas en diferentes sectores del municipio durante el presente año.</p>

      <p>Los ciudadanos interesados en recibir capacitaciones sobre derechos humanos pueden comunicarse con la Personería Municipal al teléfono (602) 2017004 o acercarse a nuestras instalaciones ubicadas en la Calle 7 N° 12-45.</p>
    `,
    imagen: '/images/noticias/derechos-humanos.jpg',
    fecha: '2026-01-15',
    categoria: 'Eventos',
    tiempoLectura: '3 min',
    autor: 'Oficina de Comunicaciones',
    tags: ['Derechos Humanos', 'Educación', 'Capacitación', 'Juventud'],
  },
  'capacitacion-veedurias-ciudadanas': {
    id: '2',
    slug: 'capacitacion-veedurias-ciudadanas',
    titulo: 'Capacitación a Veedurías Ciudadanas en Control Social',
    extracto:
      'Se llevó a cabo una capacitación intensiva para fortalecer las capacidades de las veedurías ciudadanas en el ejercicio del control social.',
    contenido: `
      <p>Con el objetivo de fortalecer la participación ciudadana y el control social en el municipio, la Personería Municipal de Guadalajara de Buga realizó una jornada de capacitación dirigida a los integrantes de las veedurías ciudadanas registradas.</p>

      <p>El evento se desarrolló en las instalaciones de la Casa de la Cultura y contó con la asistencia de más de 60 veedores pertenecientes a 15 veedurías activas en el municipio.</p>

      <h2>Temas Abordados</h2>

      <p>Durante la capacitación se abordaron los siguientes temas:</p>

      <ul>
        <li>Marco normativo de las veedurías ciudadanas (Ley 850 de 2003)</li>
        <li>Herramientas para el acceso a la información pública</li>
        <li>Metodología para la vigilancia de contratos estatales</li>
        <li>Elaboración de informes de veeduría</li>
        <li>Canales de denuncia y comunicación con entidades de control</li>
      </ul>

      <h2>Alianza Interinstitucional</h2>

      <p>La capacitación fue realizada en alianza con la Contraloría General del Valle del Cauca y la Procuraduría Provincial, quienes aportaron sus conocimientos y experiencia en materia de control fiscal y disciplinario.</p>

      <blockquote>
        "Las veedurías ciudadanas son fundamentales para garantizar la transparencia en la gestión pública. Desde la Personería estamos comprometidos con su fortalecimiento", afirmó el Personero Municipal.
      </blockquote>

      <h2>Próximas Actividades</h2>

      <p>La Personería Municipal continuará desarrollando actividades de capacitación y acompañamiento a las veedurías ciudadanas. Los ciudadanos interesados en conformar nuevas veedurías pueden acercarse a nuestras instalaciones para recibir orientación.</p>
    `,
    imagen: '/images/noticias/veedurias.jpg',
    fecha: '2026-01-10',
    categoria: 'Capacitación',
    tiempoLectura: '4 min',
    autor: 'Oficina de Comunicaciones',
    tags: ['Veedurías', 'Control Social', 'Participación Ciudadana', 'Capacitación'],
  },
  'nuevo-horario-atencion-2026': {
    id: '3',
    slug: 'nuevo-horario-atencion-2026',
    titulo: 'Nuevo Horario de Atención al Público para 2026',
    extracto:
      'Informamos a la comunidad sobre los nuevos horarios de atención presencial y virtual que regirán durante el presente año.',
    contenido: `
      <p>La Personería Municipal de Guadalajara de Buga informa a la ciudadanía sobre los horarios de atención que regirán durante el año 2026.</p>

      <h2>Horario de Atención Presencial</h2>

      <p>La sede principal de la Personería, ubicada en la Calle 7 N° 12-45, atenderá al público en el siguiente horario:</p>

      <ul>
        <li><strong>Lunes a viernes:</strong> 8:00 a.m. a 12:00 m. y 2:00 p.m. a 6:00 p.m.</li>
        <li><strong>Sábados, domingos y festivos:</strong> No hay atención</li>
      </ul>

      <h2>Casa de la Justicia</h2>

      <p>El punto de atención en la Casa de la Justicia, ubicado en la Calle 3 # 17-50, atenderá:</p>

      <ul>
        <li><strong>Lunes a viernes:</strong> 8:00 a.m. a 12:00 m. y 2:00 p.m. a 5:00 p.m.</li>
      </ul>

      <h2>Atención Virtual</h2>

      <p>Los canales virtuales de atención están disponibles las 24 horas del día, los 7 días de la semana:</p>

      <ul>
        <li>Portal web: www.personeriabuga.gov.co</li>
        <li>Correo electrónico: contacto@personeriabuga.gov.co</li>
        <li>Formulario PQRSD en línea</li>
      </ul>

      <h2>Líneas Telefónicas</h2>

      <p>Las líneas telefónicas estarán disponibles durante el horario laboral:</p>

      <ul>
        <li>Teléfono fijo: (602) 2017004</li>
        <li>Celular/WhatsApp: 315 626 9407</li>
      </ul>

      <p>Recordamos a la ciudadanía que las solicitudes radicadas después de las 5:00 p.m. serán registradas con fecha del siguiente día hábil.</p>
    `,
    imagen: '/images/noticias/horarios.jpg',
    fecha: '2026-01-05',
    categoria: 'Institucional',
    tiempoLectura: '2 min',
    autor: 'Oficina de Comunicaciones',
    tags: ['Horarios', 'Atención al Ciudadano', 'Información'],
  },
}

// Noticias relacionadas (simuladas)
const noticiasRelacionadas = [
  {
    slug: 'capacitacion-veedurias-ciudadanas',
    titulo: 'Capacitación a Veedurías Ciudadanas',
    fecha: '2026-01-10',
    categoria: 'Capacitación',
  },
  {
    slug: 'nuevo-horario-atencion-2026',
    titulo: 'Nuevo Horario de Atención 2026',
    fecha: '2026-01-05',
    categoria: 'Institucional',
  },
]

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateStaticParams() {
  return Object.keys(noticias).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const noticia = noticias[slug]

  if (!noticia) {
    return { title: 'Noticia no encontrada' }
  }

  return {
    title: `${noticia.titulo} | Personería Municipal de Guadalajara de Buga`,
    description: noticia.extracto,
    openGraph: {
      title: noticia.titulo,
      description: noticia.extracto,
      type: 'article',
      publishedTime: noticia.fecha,
      authors: [noticia.autor],
    },
  }
}

export default async function NoticiaDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const noticia = noticias[slug]

  if (!noticia) {
    notFound()
  }

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
            <span className="px-3 py-1 bg-gov-blue/10 text-gov-blue text-sm font-medium rounded-full">
              {noticia.categoria}
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatearFecha(noticia.fecha)}
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {noticia.tiempoLectura} de lectura
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <User className="w-4 h-4" />
              {noticia.autor}
            </span>
          </div>

          {/* Imagen destacada */}
          <div className="aspect-video bg-gray-100 rounded-xl mb-8 overflow-hidden">
            <div className="w-full h-full bg-gov-blue/10 flex items-center justify-center">
              <span className="text-gov-blue/30 text-9xl font-bold">P</span>
            </div>
          </div>

          {/* Contenido */}
          <article
            className="prose prose-lg prose-gray max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: noticia.contenido }}
          />

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b">
            <Tag className="w-4 h-4 text-gray-400" />
            {noticia.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Compartir */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-12 pb-8 border-b">
            <span className="text-gray-700 font-medium">Compartir esta noticia:</span>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors">
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Noticias relacionadas */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Noticias Relacionadas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {noticiasRelacionadas
                .filter((n) => n.slug !== slug)
                .slice(0, 2)
                .map((related) => (
                  <Link
                    key={related.slug}
                    href={`/noticias/${related.slug}`}
                    className="group flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="text-xs text-gov-blue font-medium">{related.categoria}</span>
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
