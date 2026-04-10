import { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Globe,
  Users,
  Building,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Canales de Atención | Personería Municipal de Guadalajara de Buga',
  description:
    'Encuentre todos los canales disponibles para comunicarse con la Personería Municipal de Guadalajara de Buga',
}

const canalesPresenciales = [
  {
    titulo: 'Sede Principal',
    direccion: 'Calle 7 N° 12-45',
    ciudad: 'Guadalajara de Buga, Valle del Cauca',
    horario: 'Lunes a Viernes: 8:00 a.m. - 12:00 m. y 2:00 p.m. - 6:00 p.m.',
    icono: Building,
    destacado: true,
  },
  {
    titulo: 'Casa de la Justicia',
    direccion: 'Calle 3 # 17-50',
    ciudad: 'Guadalajara de Buga, Valle del Cauca',
    horario: 'Lunes a Viernes: 8:00 a.m. - 12:00 m. y 2:00 p.m. - 5:00 p.m.',
    icono: Users,
    destacado: false,
  },
]

const canalesVirtuales = [
  {
    titulo: 'Correo Electrónico',
    descripcion: 'Envíe sus solicitudes y consultas',
    valor: 'contacto@personeriabuga.gov.co',
    link: 'mailto:contacto@personeriabuga.gov.co',
    icono: Mail,
  },
  {
    titulo: 'Sitio Web',
    descripcion: 'Portal de servicios en línea',
    valor: 'www.personeriabuga.gov.co',
    link: 'http://www.personeriabuga.gov.co',
    icono: Globe,
    externo: true,
  },
  {
    titulo: 'PQRSD en Línea',
    descripcion: 'Radique sus peticiones, quejas y reclamos',
    valor: 'Formulario web disponible 24/7',
    link: '/atencion-ciudadano/pqrsd',
    icono: MessageCircle,
  },
]

const canalesTelefonicos = [
  {
    titulo: 'Línea Fija',
    valor: '(602) 2017004',
    descripcion: 'Atención general',
    horario: 'Lunes a Viernes: 8:00 a.m. - 6:00 p.m.',
  },
  {
    titulo: 'Celular / WhatsApp',
    valor: '315 626 9407',
    descripcion: 'Línea directa de atención',
    horario: 'Lunes a Viernes: 8:00 a.m. - 6:00 p.m.',
  },
]

export default function CanalesAtencionPage() {
  return (
    <>
      <PageHeader
        title="Canales de Atención"
        description="Múltiples formas de comunicarse con nosotros"
        breadcrumbItems={[
          { label: 'Atención al Ciudadano', href: '/atencion-ciudadano' },
          { label: 'Canales de Atención' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Canales Presenciales */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gov-blue/10 rounded-lg">
              <MapPin className="w-6 h-6 text-gov-blue" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Atención Presencial</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {canalesPresenciales.map((canal) => (
              <div
                key={canal.titulo}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                  canal.destacado ? 'ring-2 ring-gov-blue' : ''
                }`}
              >
                {canal.destacado && (
                  <div className="bg-gov-blue px-4 py-1 text-white text-sm font-medium">
                    Sede Principal
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <canal.icono className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{canal.titulo}</h3>
                      <p className="text-gray-600 font-medium">{canal.direccion}</p>
                      <p className="text-gray-500 text-sm">{canal.ciudad}</p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{canal.horario}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Canales Telefónicos */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gov-green/10 rounded-lg">
              <Phone className="w-6 h-6 text-gov-green" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Atención Telefónica</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {canalesTelefonicos.map((canal) => (
              <div key={canal.titulo} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">{canal.titulo}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {canal.descripcion}
                  </span>
                </div>
                <a
                  href={`tel:${canal.valor.replace(/\D/g, '')}`}
                  className="text-2xl font-bold text-gov-blue hover:underline"
                >
                  {canal.valor}
                </a>
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{canal.horario}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Canales Virtuales */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gov-gold/20 rounded-lg">
              <Globe className="w-6 h-6 text-gov-gold" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Atención Virtual</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {canalesVirtuales.map((canal) => (
              <Link
                key={canal.titulo}
                href={canal.link}
                target={canal.externo ? '_blank' : undefined}
                rel={canal.externo ? 'noopener noreferrer' : undefined}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gov-blue/10 transition-colors">
                    <canal.icono className="w-6 h-6 text-gray-600 group-hover:text-gov-blue transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      {canal.titulo}
                      {canal.externo && <ExternalLink className="w-4 h-4 text-gray-400" />}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{canal.descripcion}</p>
                    <p className="text-gov-blue font-medium text-sm truncate">{canal.valor}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Horarios especiales */}
        <section className="mb-12">
          <div className="bg-gov-blue/5 rounded-xl p-6 border border-gov-blue/20">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-gov-blue" />
              <h3 className="text-lg font-bold text-gray-900">Horarios y Consideraciones</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gov-blue rounded-full mt-2 shrink-0" />
                <span>
                  Los días festivos no hay atención presencial. La atención virtual está disponible
                  24/7.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gov-blue rounded-full mt-2 shrink-0" />
                <span>
                  Las solicitudes radicadas después de las 5:00 p.m. serán registradas con fecha del
                  siguiente día hábil.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gov-blue rounded-full mt-2 shrink-0" />
                <span>
                  Para atención prioritaria a población vulnerable, adultos mayores y personas con
                  discapacidad, favor comunicarse previamente.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Mapa */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ubicación</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3981.4!2d-76.3!3d3.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGuadalajara%20de%20Buga!5e0!3m2!1ses!2sco!4v1600000000000!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Personería Municipal de Guadalajara de Buga"
              />
            </div>
            <div className="p-4 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Calle 7 N° 12-45, Guadalajara de Buga, Valle del Cauca</span>
              </div>
              <a
                href="https://maps.google.com/?q=Personeria+Guadalajara+de+Buga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-blue hover:underline text-sm flex items-center gap-1"
              >
                Abrir en Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
