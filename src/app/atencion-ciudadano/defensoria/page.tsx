import { Metadata } from 'next'
import Link from 'next/link'
import {
  Shield,
  Users,
  Scale,
  Heart,
  FileText,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Defensoría del Pueblo | Personería Municipal de Guadalajara de Buga',
  description:
    'Servicios de la Defensoría del Pueblo en coordinación con la Personería Municipal de Guadalajara de Buga',
}

const serviciosDefensoria = [
  {
    titulo: 'Defensa de Derechos Fundamentales',
    descripcion:
      'Orientación y acompañamiento en la interposición de acciones de tutela para la protección de derechos fundamentales vulnerados o amenazados.',
    icono: Shield,
  },
  {
    titulo: 'Atención a Víctimas del Conflicto',
    descripcion:
      'Apoyo integral a víctimas del conflicto armado en procesos de reparación, restitución de tierras y acceso a los programas del Estado.',
    icono: Heart,
  },
  {
    titulo: 'Defensa del Interés Público',
    descripcion:
      'Vigilancia y protección de los derechos colectivos, medio ambiente y patrimonio público mediante acciones populares y de grupo.',
    icono: Users,
  },
  {
    titulo: 'Asesoría Jurídica',
    descripcion:
      'Orientación legal gratuita en temas de derechos humanos, administrativos, civiles y penales para población vulnerable.',
    icono: Scale,
  },
]

const poblacionAtendida = [
  'Víctimas del conflicto armado',
  'Personas en condición de discapacidad',
  'Adultos mayores',
  'Población LGBTIQ+',
  'Mujeres víctimas de violencia',
  'Niños, niñas y adolescentes',
  'Población migrante',
  'Comunidades étnicas',
  'Personas privadas de la libertad',
  'Población en situación de calle',
]

const tramites = [
  {
    titulo: 'Acción de Tutela',
    descripcion: 'Mecanismo de protección de derechos fundamentales',
    requisitos: ['Documento de identidad', 'Descripción de los hechos', 'Pruebas (si las tiene)'],
    tiempo: 'Inmediato',
  },
  {
    titulo: 'Derecho de Petición',
    descripcion: 'Solicitud de información o actuación ante autoridades',
    requisitos: ['Documento de identidad', 'Solicitud por escrito'],
    tiempo: '15 días hábiles',
  },
  {
    titulo: 'Registro de Víctimas',
    descripcion: 'Inscripción en el Registro Único de Víctimas',
    requisitos: [
      'Documento de identidad',
      'Declaración de los hechos',
      'Pruebas o testimonios',
    ],
    tiempo: '60 días hábiles',
  },
]

export default function DefensoriaPage() {
  return (
    <>
      <PageHeader
        title="Defensoría del Pueblo"
        description="Protección y promoción de los Derechos Humanos"
        breadcrumbItems={[
          { label: 'Atención al Ciudadano', href: '/atencion-ciudadano' },
          { label: 'Defensoría del Pueblo' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Introducción */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="bg-linear-to-r from-gov-blue to-gov-blue-dark rounded-xl p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">
                  La Personería Municipal como Ministerio Público
                </h2>
                <p className="text-white/90 leading-relaxed">
                  La Personería Municipal ejerce funciones de Ministerio Público a nivel local, 
                  actuando como agente del Ministerio Público ante las autoridades judiciales 
                  y administrativas. En coordinación con la Defensoría del Pueblo, brinda 
                  servicios de orientación y defensa de los derechos humanos a todos los 
                  ciudadanos, con especial énfasis en la población más vulnerable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Servicios de Defensoría</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {serviciosDefensoria.map((servicio) => (
              <div
                key={servicio.titulo}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gov-blue/10 rounded-lg">
                    <servicio.icono className="w-6 h-6 text-gov-blue" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">{servicio.titulo}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{servicio.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Población atendida */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Población Prioritaria</h2>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-gray-600 mb-4">
              La Personería brinda atención prioritaria a los siguientes grupos poblacionales:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {poblacionAtendida.map((grupo) => (
                <div key={grupo} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-gov-green shrink-0" />
                  <span className="text-sm">{grupo}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trámites */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trámites y Servicios</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {tramites.map((tramite) => (
              <div
                key={tramite.titulo}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-gov-blue" />
                    <h3 className="font-bold text-gray-900">{tramite.titulo}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{tramite.descripcion}</p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Requisitos:</p>
                    <ul className="space-y-1">
                      {tramite.requisitos.map((req) => (
                        <li key={req} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-gray-500">Tiempo de respuesta</span>
                    <span className="text-sm font-medium text-gov-blue">{tramite.tiempo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contacto Casa de la Justicia */}
        <section className="mb-12">
          <div className="bg-gray-50 rounded-xl p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Casa de la Justicia</h2>
                <p className="text-gray-600 mb-6">
                  En la Casa de la Justicia de Guadalajara de Buga encontrará servicios integrados 
                  de acceso a la justicia. Contamos con funcionarios capacitados para orientarle 
                  en la defensa de sus derechos.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <MapPin className="w-5 h-5 text-gov-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Dirección</p>
                      <p className="text-gray-600 text-sm">Calle 3 # 17-50, Guadalajara de Buga</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Phone className="w-5 h-5 text-gov-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Teléfono</p>
                      <p className="text-gray-600 text-sm">(602) 2017004</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Clock className="w-5 h-5 text-gov-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Horario</p>
                      <p className="text-gray-600 text-sm">Lunes a Viernes: 8:00 a.m. - 5:00 p.m.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:w-80">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-bold text-gray-900 mb-4">¿Necesita ayuda?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Si requiere orientación sobre sus derechos o necesita interponer una acción 
                    legal, acérquese a nuestras oficinas o radique su solicitud en línea.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/atencion-ciudadano/pqrsd"
                      className="flex items-center justify-between w-full px-4 py-3 bg-gov-blue text-white rounded-lg font-medium hover:bg-gov-blue-dark transition-colors"
                    >
                      Radicar solicitud
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/atencion-ciudadano/canales-atencion"
                      className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Ver más canales
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Normatividad */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Marco Normativo</h2>
          <div className="bg-white rounded-xl shadow-sm border divide-y">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Constitución Política de Colombia</p>
                <p className="text-sm text-gray-500">Artículos 118, 277, 278, 282</p>
              </div>
              <Link href="/transparencia/normativa" className="text-gov-blue hover:underline text-sm">
                Ver más
              </Link>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Ley 24 de 1992</p>
                <p className="text-sm text-gray-500">Organización y funcionamiento de la Defensoría del Pueblo</p>
              </div>
              <Link href="/transparencia/normativa" className="text-gov-blue hover:underline text-sm">
                Ver más
              </Link>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Ley 136 de 1994</p>
                <p className="text-sm text-gray-500">Normas para modernizar la organización municipal - Personerías</p>
              </div>
              <Link href="/transparencia/normativa" className="text-gov-blue hover:underline text-sm">
                Ver más
              </Link>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Ley 1755 de 2015</p>
                <p className="text-sm text-gray-500">Derecho fundamental de petición</p>
              </div>
              <Link href="/transparencia/normativa" className="text-gov-blue hover:underline text-sm">
                Ver más
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
