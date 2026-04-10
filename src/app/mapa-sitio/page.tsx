import { Metadata } from 'next'
import Link from 'next/link'
import {
  Building,
  Users,
  FileText,
  Scale,
  Globe,
  MessageSquare,
  Newspaper,
  Shield,
  Phone,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Mapa del Sitio | Personería Municipal de Guadalajara de Buga',
  description:
    'Navegue por todas las secciones del sitio web de la Personería Municipal de Guadalajara de Buga',
}

const secciones = [
  {
    titulo: 'La Entidad',
    icono: Building,
    enlaces: [
      { nombre: 'Información General', href: '/entidad' },
      { nombre: 'Misión y Visión', href: '/entidad/mision-vision' },
      { nombre: 'Historia', href: '/entidad/historia' },
      { nombre: 'Organigrama', href: '/entidad/organigrama' },
      { nombre: 'Directorio de Funcionarios', href: '/entidad/directorio' },
      { nombre: 'Funciones', href: '/entidad/funciones' },
    ],
  },
  {
    titulo: 'Transparencia',
    icono: Globe,
    enlaces: [
      { nombre: 'Información de la Entidad', href: '/transparencia/informacion-entidad' },
      { nombre: 'Normatividad', href: '/transparencia/normativa' },
      { nombre: 'Contratación', href: '/transparencia/contratacion' },
      { nombre: 'Planeación', href: '/transparencia/planeacion' },
      { nombre: 'Trámites y Servicios', href: '/transparencia/tramites' },
      { nombre: 'Participa', href: '/transparencia/participa' },
      { nombre: 'Datos Abiertos', href: '/transparencia/datos-abiertos' },
      { nombre: 'Información Específica', href: '/transparencia/informacion-especifica' },
      { nombre: 'Obligación de Reporte', href: '/transparencia/obligacion-reporte' },
      { nombre: 'Información Tributaria', href: '/transparencia/informacion-tributaria' },
    ],
  },
  {
    titulo: 'Atención al Ciudadano',
    icono: Users,
    enlaces: [
      { nombre: 'Información General', href: '/atencion-ciudadano' },
      { nombre: 'Radicar PQRSD', href: '/atencion-ciudadano/pqrsd' },
      { nombre: 'Consultar PQRSD', href: '/atencion-ciudadano/pqrsd/consulta' },
      { nombre: 'Preguntas Frecuentes', href: '/atencion-ciudadano/preguntas-frecuentes' },
      { nombre: 'Canales de Atención', href: '/atencion-ciudadano/canales-atencion' },
      { nombre: 'Defensoría del Pueblo', href: '/atencion-ciudadano/defensoria' },
    ],
  },
  {
    titulo: 'Servicios',
    icono: FileText,
    enlaces: [
      { nombre: 'Catálogo de Servicios', href: '/servicios' },
      { nombre: 'Asesoría Jurídica', href: '/servicios/asesoria-juridica' },
      { nombre: 'Acciones de Tutela', href: '/servicios/tutelas' },
      { nombre: 'Vigilancia Administrativa', href: '/servicios/vigilancia-administrativa' },
      { nombre: 'Veedurías Ciudadanas', href: '/servicios/veedurias' },
      { nombre: 'PQRSD', href: '/servicios/pqrsd' },
      { nombre: 'Conciliación', href: '/servicios/conciliaciones' },
    ],
  },
  {
    titulo: 'Noticias',
    icono: Newspaper,
    enlaces: [
      { nombre: 'Todas las Noticias', href: '/noticias' },
    ],
  },
  {
    titulo: 'Legal',
    icono: Scale,
    enlaces: [
      { nombre: 'Política de Privacidad', href: '/privacidad' },
      { nombre: 'Términos y Condiciones', href: '/terminos' },
      { nombre: 'Tratamiento de Datos', href: '/tratamiento-datos' },
      { nombre: 'Accesibilidad', href: '/accesibilidad' },
    ],
  },
  {
    titulo: 'Contacto',
    icono: Phone,
    enlaces: [
      { nombre: 'Canales de Atención', href: '/atencion-ciudadano/canales-atencion' },
      { nombre: 'PQRSD en Línea', href: '/atencion-ciudadano/pqrsd' },
    ],
  },
]

export default function MapaSitioPage() {
  return (
    <>
      <PageHeader
        title="Mapa del Sitio"
        description="Encuentre fácilmente todas las secciones de nuestro sitio web"
        breadcrumbItems={[{ label: 'Mapa del Sitio' }]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {secciones.map((seccion) => (
              <div
                key={seccion.titulo}
                className="bg-white rounded-xl shadow-sm border overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
                  <seccion.icono className="w-5 h-5 text-gov-blue" />
                  <h2 className="font-bold text-gray-900">{seccion.titulo}</h2>
                </div>
                <ul className="divide-y">
                  {seccion.enlaces.map((enlace) => (
                    <li key={enlace.href}>
                      <Link
                        href={enlace.href}
                        className="flex items-center justify-between px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-gov-blue transition-colors"
                      >
                        <span>{enlace.nombre}</span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-12 bg-gray-50 rounded-xl p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ¿No encuentra lo que busca?
            </h2>
            <p className="text-gray-600 mb-6">
              Si tiene dificultades para encontrar información en nuestro sitio web, 
              no dude en contactarnos y con gusto le ayudaremos.
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
        </div>
      </main>
    </>
  )
}
