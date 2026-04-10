import { Metadata } from 'next'
import { Target, Eye, Heart, Shield, Users, Scale } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'

export const metadata: Metadata = {
  title: 'Misión y Visión | Personería Municipal de Guadalajara de Buga',
  description: 'Conoce la misión, visión y valores institucionales de la Personería Municipal de Guadalajara de Buga.',
}

const menuItems = [
  { label: 'Misión y Visión', href: '/entidad/mision-vision' },
  { label: 'Historia', href: '/entidad/historia' },
  { label: 'Organigrama', href: '/entidad/organigrama' },
  { label: 'Directorio de Funcionarios', href: '/entidad/directorio' },
  { label: 'Funciones y Deberes', href: '/entidad/funciones' },
]

const valores = [
  {
    nombre: 'Respeto',
    descripcion: 'Reconocemos la dignidad de todas las personas y tratamos a cada ciudadano con consideración.',
    icono: Heart,
    color: 'text-red-500',
  },
  {
    nombre: 'Justicia',
    descripcion: 'Actuamos con equidad y aplicamos la ley de manera imparcial en defensa de los derechos ciudadanos.',
    icono: Scale,
    color: 'text-blue-500',
  },
  {
    nombre: 'Transparencia',
    descripcion: 'Todas nuestras actuaciones son públicas y accesibles para garantizar la confianza ciudadana.',
    icono: Eye,
    color: 'text-green-500',
  },
  {
    nombre: 'Compromiso',
    descripcion: 'Trabajamos con dedicación y responsabilidad para cumplir nuestra misión institucional.',
    icono: Shield,
    color: 'text-purple-500',
  },
  {
    nombre: 'Servicio',
    descripcion: 'Orientamos nuestra gestión hacia la atención efectiva de las necesidades de la comunidad.',
    icono: Users,
    color: 'text-amber-500',
  },
]

export default function MisionVisionPage() {
  return (
    <>
      <PageHeader
        title="Misión y Visión"
        description="Principios que guían nuestra labor como defensores de los derechos humanos"
        breadcrumbItems={[
          { label: 'La Entidad', href: '/entidad' },
          { label: 'Misión y Visión' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <SidebarMenu title="La Entidad" items={menuItems} />
          </aside>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-8">
            {/* Misión */}
            <section className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-gov-blue px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Misión</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Defender y promover los Derechos Humanos, el interés público y el medio ambiente; 
                  ejercer la vigilancia sobre la conducta oficial de los servidores públicos del 
                  municipio de Guadalajara de Buga, fortaleciendo una cultura de participación 
                  ciudadana y los valores institucionales que permitan mediar y ser garantes de las 
                  peticiones de la población vulnerable con especial énfasis en la protección 
                  integral de las víctimas del conflicto armado.
                </p>
              </div>
            </section>

            {/* Visión */}
            <section className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-gov-blue-dark px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Visión</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Para el 2028 ser una entidad líder en la coalición, concertación, protección y 
                  defensa de los derechos humanos, patrimonio público y medio ambiente; garantizando 
                  así los derechos fundamentales de los ciudadanos. Su propósito es una convivencia 
                  ciudadana en paz a través del cumplimiento de la Constitución y las leyes de la 
                  República.
                </p>
              </div>
            </section>

            {/* Valores */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Valores Institucionales</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {valores.map((valor) => (
                  <div 
                    key={valor.nombre}
                    className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <valor.icono className={`w-8 h-8 ${valor.color}`} />
                      <h3 className="text-lg font-semibold text-gray-900">{valor.nombre}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{valor.descripcion}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Objetivos */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Objetivos Institucionales</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="shrink-0 w-8 h-8 bg-gov-blue text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Defensa de Derechos Humanos</h3>
                    <p className="text-gray-600">Promover y proteger los derechos fundamentales de todos los ciudadanos del municipio.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-8 h-8 bg-gov-blue text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Vigilancia de la Gestión Pública</h3>
                    <p className="text-gray-600">Ejercer control y vigilancia sobre la conducta oficial de los servidores públicos.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-8 h-8 bg-gov-blue text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Participación Ciudadana</h3>
                    <p className="text-gray-600">Fortalecer los mecanismos de participación y control social de la ciudadanía.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-8 h-8 bg-gov-blue text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Atención a Población Vulnerable</h3>
                    <p className="text-gray-600">Brindar atención especial a víctimas del conflicto armado y grupos en situación de vulnerabilidad.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-8 h-8 bg-gov-blue text-white rounded-full flex items-center justify-center font-bold text-sm">5</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Protección del Medio Ambiente</h3>
                    <p className="text-gray-600">Velar por la conservación y protección de los recursos naturales y el medio ambiente.</p>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
