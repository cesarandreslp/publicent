import { Metadata } from 'next'
import Link from 'next/link'
import {
  Scale,
  FileText,
  Users,
  Shield,
  Search,
  Building,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Servicios | Personería Municipal de Guadalajara de Buga',
  description:
    'Catálogo de servicios que ofrece la Personería Municipal de Guadalajara de Buga a la ciudadanía',
}

const servicios = [
  {
    id: 'asesoria-juridica',
    titulo: 'Asesoría Jurídica Gratuita',
    descripcion:
      'Orientación legal gratuita en temas de derechos humanos, administrativos, civiles, penales y laborales para la ciudadanía.',
    icono: Scale,
    categoria: 'Atención al Ciudadano',
    tiempo: 'Inmediato',
    requisitos: ['Documento de identidad', 'Exposición del caso'],
    destacado: true,
  },
  {
    id: 'tutelas',
    titulo: 'Interposición de Acciones de Tutela',
    descripcion:
      'Acompañamiento y orientación en la elaboración e interposición de acciones de tutela para la protección de derechos fundamentales.',
    icono: Shield,
    categoria: 'Defensa de Derechos',
    tiempo: 'Inmediato',
    requisitos: [
      'Documento de identidad',
      'Descripción de los hechos vulneratorios',
      'Pruebas documentales (si las tiene)',
    ],
    destacado: true,
  },
  {
    id: 'vigilancia-administrativa',
    titulo: 'Vigilancia de la Conducta Oficial',
    descripcion:
      'Recepción y trámite de quejas contra servidores públicos municipales por faltas disciplinarias en ejercicio de sus funciones.',
    icono: Search,
    categoria: 'Control y Vigilancia',
    tiempo: '30 días hábiles',
    requisitos: [
      'Documento de identidad',
      'Queja por escrito con descripción detallada',
      'Pruebas o indicios de la conducta',
    ],
    destacado: false,
  },
  {
    id: 'veedurias',
    titulo: 'Apoyo a Veedurías Ciudadanas',
    descripcion:
      'Asesoría y acompañamiento para la conformación de veedurías ciudadanas y ejercicio de control social a la gestión pública.',
    icono: Users,
    categoria: 'Participación Ciudadana',
    tiempo: '15 días hábiles',
    requisitos: ['Grupo de ciudadanos interesados', 'Acta de conformación', 'Objeto de la veeduría'],
    destacado: false,
  },
  {
    id: 'pqrsd',
    titulo: 'Radicación de PQRSD',
    descripcion:
      'Recepción de Peticiones, Quejas, Reclamos, Sugerencias y Denuncias sobre la prestación de servicios públicos y actuación de funcionarios.',
    icono: FileText,
    categoria: 'Atención al Ciudadano',
    tiempo: '15 días hábiles',
    requisitos: ['Documento de identidad', 'Solicitud por escrito o verbal'],
    destacado: true,
  },
  {
    id: 'conciliaciones',
    titulo: 'Conciliación en Equidad',
    descripcion:
      'Mecanismo alternativo de solución de conflictos para resolver controversias de manera pacífica y evitar procesos judiciales.',
    icono: Building,
    categoria: 'Resolución de Conflictos',
    tiempo: 'Según agenda',
    requisitos: ['Documento de identidad de las partes', 'Solicitud de conciliación', 'Descripción del conflicto'],
    destacado: false,
  },
]

const categorias = [
  { nombre: 'Todos', valor: 'todos' },
  { nombre: 'Atención al Ciudadano', valor: 'Atención al Ciudadano' },
  { nombre: 'Defensa de Derechos', valor: 'Defensa de Derechos' },
  { nombre: 'Control y Vigilancia', valor: 'Control y Vigilancia' },
  { nombre: 'Participación Ciudadana', valor: 'Participación Ciudadana' },
]

export default function ServiciosPage() {
  return (
    <>
      <PageHeader
        title="Catálogo de Servicios"
        description="Conozca los servicios que la Personería Municipal ofrece a la ciudadanía"
        breadcrumbItems={[{ label: 'Servicios' }]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Servicios destacados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Servicios Destacados</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {servicios
              .filter((s) => s.destacado)
              .map((servicio) => (
                <Link
                  key={servicio.id}
                  href={`/servicios/${servicio.id}`}
                  className="group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-linear-to-r from-gov-blue to-gov-blue-dark p-6">
                    <servicio.icono className="w-10 h-10 text-white mb-3" />
                    <h3 className="text-lg font-bold text-white">{servicio.titulo}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{servicio.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {servicio.categoria}
                      </span>
                      <span className="text-gov-blue text-sm font-medium group-hover:underline flex items-center gap-1">
                        Ver más <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {/* Lista completa de servicios */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Todos los Servicios</h2>
          <div className="space-y-4">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-gov-blue/10 rounded-lg shrink-0">
                        <servicio.icono className="w-6 h-6 text-gov-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{servicio.titulo}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {servicio.categoria}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{servicio.descripcion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 lg:gap-8">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{servicio.tiempo}</span>
                      </div>
                      <Link
                        href={`/servicios/${servicio.id}`}
                        className="px-4 py-2 bg-gov-blue text-white rounded-lg text-sm font-medium hover:bg-gov-blue-dark transition-colors whitespace-nowrap"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12">
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿No encontró el servicio que busca?</h3>
            <p className="text-gray-600 mb-6">
              Contáctenos y con gusto le orientaremos sobre cómo podemos ayudarle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/atencion-ciudadano/canales-atencion"
                className="px-6 py-3 bg-gov-blue text-white rounded-lg font-medium hover:bg-gov-blue-dark transition-colors"
              >
                Canales de Atención
              </Link>
              <Link
                href="/atencion-ciudadano/preguntas-frecuentes"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Preguntas Frecuentes
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
