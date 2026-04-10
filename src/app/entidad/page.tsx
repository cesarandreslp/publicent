import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Building2, 
  Target, 
  Users, 
  ClipboardList, 
  History,
  ChevronRight 
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'La Entidad | Personería Municipal de Guadalajara de Buga',
  description: 'Conozca la Personería Municipal de Guadalajara de Buga: misión, visión, estructura organizacional, directorio de funcionarios y funciones.',
}

const secciones = [
  {
    titulo: 'Misión y Visión',
    descripcion: 'Conoce nuestra razón de ser y hacia dónde nos dirigimos como entidad defensora de los derechos ciudadanos.',
    href: '/entidad/mision-vision',
    icono: Target,
    color: 'bg-blue-500',
  },
  {
    titulo: 'Historia',
    descripcion: 'Descubre los orígenes y la trayectoria de la Personería Municipal de Guadalajara de Buga.',
    href: '/entidad/historia',
    icono: History,
    color: 'bg-amber-500',
  },
  {
    titulo: 'Organigrama',
    descripcion: 'Visualiza la estructura organizacional de nuestra entidad y conoce cómo estamos organizados.',
    href: '/entidad/organigrama',
    icono: Building2,
    color: 'bg-green-500',
  },
  {
    titulo: 'Directorio de Funcionarios',
    descripcion: 'Información de contacto y datos de los servidores públicos de la Personería.',
    href: '/entidad/directorio',
    icono: Users,
    color: 'bg-purple-500',
  },
  {
    titulo: 'Funciones y Deberes',
    descripcion: 'Conoce las funciones constitucionales y legales que cumple la Personería Municipal.',
    href: '/entidad/funciones',
    icono: ClipboardList,
    color: 'bg-red-500',
  },
]

export default function EntidadPage() {
  return (
    <>
      <PageHeader
        title="La Entidad"
        description="Conozca la Personería Municipal de Guadalajara de Buga, defensores de los derechos humanos y garantes de la participación ciudadana."
        breadcrumbItems={[{ label: 'La Entidad' }]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Introducción */}
        <section className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Personería Municipal de Guadalajara de Buga
            </h2>
            <p className="text-gray-600 mb-4">
              La Personería Municipal es una entidad del Ministerio Público que ejerce, vigila y hace 
              control sobre la gestión de las alcaldías y entes descentralizados. Vela por la promoción 
              y protección de los derechos humanos, vigila el debido proceso, la conservación del medio 
              ambiente, el patrimonio público y la prestación eficiente de los servicios públicos, 
              garantizando a la ciudadanía la defensa de sus derechos e intereses.
            </p>
            <p className="text-gray-600">
              Como agentes del Ministerio Público, actuamos ante las autoridades judiciales en defensa 
              del orden jurídico, el patrimonio público, los derechos y garantías fundamentales de los 
              ciudadanos de Guadalajara de Buga.
            </p>
          </div>
        </section>

        {/* Grid de secciones */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secciones.map((seccion) => (
            <Link
              key={seccion.href}
              href={seccion.href}
              className="group bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all hover:border-gov-blue"
            >
              <div className={`w-14 h-14 ${seccion.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <seccion.icono className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gov-blue transition-colors">
                {seccion.titulo}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {seccion.descripcion}
              </p>
              <span className="inline-flex items-center text-gov-blue font-medium text-sm">
                Ver más
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </section>

        {/* Información de contacto */}
        <section className="mt-12 bg-gov-blue text-white rounded-lg p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Sede Principal</h3>
                <address className="not-italic text-white/90 space-y-2">
                  <p>Calle 7 N° 12-45</p>
                  <p>Edificio Alcaldía Municipal</p>
                  <p>Guadalajara de Buga, Valle del Cauca</p>
                </address>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Contacto</h3>
                <div className="text-white/90 space-y-2">
                  <p>Teléfono: (602) 2017004</p>
                  <p>Celular: 315 626 9407</p>
                  <p>Email: contactenos@personeriabuga.gov.co</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Horario de Atención</h3>
                <div className="text-white/90">
                  <p>Lunes a Viernes</p>
                  <p>7:30 a.m. - 12:00 m.</p>
                  <p>2:00 p.m. - 5:00 p.m.</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Casa de la Justicia</h3>
                <address className="not-italic text-white/90 space-y-2">
                  <p>Calle 30 # 13-01</p>
                  <p>Teléfono: (602) 2366781</p>
                  <p>Lunes a Viernes: 7:30 a.m. - 12:30 m.</p>
                </address>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
