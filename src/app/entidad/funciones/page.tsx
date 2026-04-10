import { Metadata } from 'next'
import { 
  Shield, 
  Eye, 
  Users, 
  Scale, 
  FileText, 
  TreeDeciduous,
  HandHeart,
  Gavel
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'

export const metadata: Metadata = {
  title: 'Funciones y Deberes | Personería Municipal de Guadalajara de Buga',
  description: 'Funciones constitucionales y legales de la Personería Municipal de Guadalajara de Buga.',
}

const menuItems = [
  { label: 'Misión y Visión', href: '/entidad/mision-vision' },
  { label: 'Historia', href: '/entidad/historia' },
  { label: 'Organigrama', href: '/entidad/organigrama' },
  { label: 'Directorio de Funcionarios', href: '/entidad/directorio' },
  { label: 'Funciones y Deberes', href: '/entidad/funciones' },
]

const funcionesPrincipales = [
  {
    titulo: 'Defensa de los Derechos Humanos',
    descripcion: 'Recibir e investigar quejas y reclamos relacionados con la vulneración de los derechos humanos. Velar por la efectividad del derecho de petición.',
    icono: Shield,
    color: 'bg-blue-500',
    funciones: [
      'Recibir quejas y reclamos sobre violación de derechos humanos',
      'Orientar a la ciudadanía en la defensa de sus derechos',
      'Interponer acciones constitucionales cuando sea necesario',
      'Hacer seguimiento al cumplimiento de fallos judiciales',
    ],
  },
  {
    titulo: 'Vigilancia de la Conducta Oficial',
    descripcion: 'Ejercer vigilancia sobre la conducta oficial de los servidores públicos del municipio y adelantar procesos disciplinarios.',
    icono: Eye,
    color: 'bg-purple-500',
    funciones: [
      'Vigilar la conducta de los servidores públicos municipales',
      'Iniciar investigaciones disciplinarias de oficio o por queja',
      'Imponer sanciones disciplinarias según competencia',
      'Remitir casos a la Procuraduría cuando corresponda',
    ],
  },
  {
    titulo: 'Protección del Interés Público',
    descripcion: 'Velar por la correcta prestación de los servicios públicos y la defensa del patrimonio público.',
    icono: Users,
    color: 'bg-green-500',
    funciones: [
      'Vigilar la eficiente prestación de servicios públicos',
      'Defender el patrimonio público municipal',
      'Intervenir en procesos de contratación pública',
      'Verificar el cumplimiento de funciones de entidades públicas',
    ],
  },
  {
    titulo: 'Ministerio Público',
    descripcion: 'Actuar como agente del Ministerio Público ante autoridades judiciales y administrativas.',
    icono: Gavel,
    color: 'bg-red-500',
    funciones: [
      'Representar a la sociedad ante procesos judiciales',
      'Intervenir en procesos penales, civiles y de familia',
      'Defender los derechos de víctimas y población vulnerable',
      'Emitir conceptos en procesos donde intervenga',
    ],
  },
  {
    titulo: 'Defensa del Medio Ambiente',
    descripcion: 'Velar por la conservación del medio ambiente y los recursos naturales del municipio.',
    icono: TreeDeciduous,
    color: 'bg-emerald-500',
    funciones: [
      'Vigilar el cumplimiento de normas ambientales',
      'Recibir denuncias sobre daños ambientales',
      'Promover acciones populares en defensa del ambiente',
      'Hacer seguimiento a licencias y permisos ambientales',
    ],
  },
  {
    titulo: 'Atención a Población Vulnerable',
    descripcion: 'Brindar atención especial a víctimas del conflicto armado, personas en condición de discapacidad, adultos mayores y otros grupos vulnerables.',
    icono: HandHeart,
    color: 'bg-amber-500',
    funciones: [
      'Atender y orientar a víctimas del conflicto armado',
      'Recibir declaraciones de víctimas para el RUV',
      'Acompañar procesos de restitución de derechos',
      'Vigilar programas de atención a población vulnerable',
    ],
  },
]

const funcionesLegales = [
  'Vigilar el cumplimiento de la Constitución y las leyes',
  'Promover la participación ciudadana',
  'Defender los derechos del consumidor',
  'Vigilar la contratación estatal',
  'Intervenir en procesos de policía',
  'Velar por la conservación del espacio público',
  'Colaborar en la función electoral',
  'Promover la conciliación y resolución de conflictos',
  'Coordinar con entidades del Ministerio Público',
  'Presentar informes al Concejo Municipal',
]

export default function FuncionesPage() {
  return (
    <>
      <PageHeader
        title="Funciones y Deberes"
        description="Competencias constitucionales y legales de la Personería Municipal"
        breadcrumbItems={[
          { label: 'La Entidad', href: '/entidad' },
          { label: 'Funciones y Deberes' },
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
            {/* Marco normativo */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-gov-blue" />
                Marco Normativo
              </h2>
              <div className="prose prose-sm max-w-none text-gray-600">
                <p>
                  Las funciones de la Personería Municipal están establecidas en la Constitución Política 
                  de Colombia (artículos 118 y 277), la Ley 136 de 1994, la Ley 1551 de 2012 y demás 
                  normas concordantes. Como parte del Ministerio Público, el Personero ejerce funciones 
                  del Ministerio Público en el ámbito municipal.
                </p>
              </div>
            </section>

            {/* Funciones principales */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Funciones Principales</h2>
              <div className="grid gap-6">
                {funcionesPrincipales.map((funcion) => (
                  <div 
                    key={funcion.titulo}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden"
                  >
                    <div className="flex items-start gap-4 p-5 border-b bg-gray-50">
                      <div className={`w-12 h-12 ${funcion.color} rounded-lg flex items-center justify-center shrink-0`}>
                        <funcion.icono className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{funcion.titulo}</h3>
                        <p className="text-gray-600 text-sm mt-1">{funcion.descripcion}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <ul className="space-y-2">
                        {funcion.funciones.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gov-blue rounded-full mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Otras funciones legales */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-gov-blue" />
                Otras Funciones Legales
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {funcionesLegales.map((funcion, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 bg-white rounded-lg p-3 text-sm"
                  >
                    <span className="w-6 h-6 bg-gov-blue/10 text-gov-blue rounded-full flex items-center justify-center shrink-0 font-semibold text-xs">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{funcion}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Servicios a la ciudadanía */}
            <section className="bg-gov-blue text-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">¿Cómo podemos ayudarle?</h2>
              <p className="text-white/90 mb-4">
                La Personería Municipal está a su servicio para:
              </p>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  Recibir sus peticiones, quejas, reclamos y denuncias
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  Orientarlo sobre sus derechos y cómo ejercerlos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  Representarlo ante entidades públicas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  Ayudarle a interponer acciones constitucionales
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white">✓</span>
                  Atender situaciones de vulneración de derechos
                </li>
              </ul>
              <div className="mt-6">
                <a 
                  href="/atencion-ciudadano/pqrsd"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gov-blue rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Radicar PQRSD
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </section>

            {/* Documentos */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos Normativos</h2>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Ley 136 de 1994
                </a>
                <a 
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Ley 1551 de 2012
                </a>
                <a 
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Manual de Funciones
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
