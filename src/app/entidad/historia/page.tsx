import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'

export const metadata: Metadata = {
  title: 'Historia | Personería Municipal de Guadalajara de Buga',
  description: 'Conoce la historia y trayectoria de la Personería Municipal de Guadalajara de Buga desde su fundación hasta la actualidad.',
}

const menuItems = [
  { label: 'Misión y Visión', href: '/entidad/mision-vision' },
  { label: 'Historia', href: '/entidad/historia' },
  { label: 'Organigrama', href: '/entidad/organigrama' },
  { label: 'Directorio de Funcionarios', href: '/entidad/directorio' },
  { label: 'Funciones y Deberes', href: '/entidad/funciones' },
]

const lineasTiempo = [
  {
    año: '1991',
    titulo: 'Nueva Constitución Política',
    descripcion: 'Con la Constitución de 1991, las Personerías Municipales adquieren un rol fundamental como parte del Ministerio Público, fortaleciendo su papel en la defensa de los derechos humanos y la vigilancia de la administración pública.',
  },
  {
    año: '1994',
    titulo: 'Ley 136 de 1994',
    descripcion: 'Se establece el régimen municipal y se definen claramente las funciones de las Personerías Municipales, consolidando su estructura organizacional.',
  },
  {
    año: '2000',
    titulo: 'Fortalecimiento Institucional',
    descripcion: 'La Personería de Guadalajara de Buga inicia un proceso de modernización y fortalecimiento de sus capacidades para atender las necesidades de la ciudadanía.',
  },
  {
    año: '2011',
    titulo: 'Ley 1448 - Ley de Víctimas',
    descripcion: 'La Personería asume un rol fundamental en la atención y defensa de los derechos de las víctimas del conflicto armado, estableciendo protocolos especializados de atención.',
  },
  {
    año: '2014',
    titulo: 'Ley de Transparencia',
    descripcion: 'Con la Ley 1712 de 2014, la Personería fortalece sus mecanismos de transparencia y acceso a la información pública.',
  },
  {
    año: '2020',
    titulo: 'Transformación Digital',
    descripcion: 'Implementación de herramientas tecnológicas para mejorar la atención ciudadana y los canales de comunicación con la comunidad.',
  },
  {
    año: '2024',
    titulo: 'Actualidad',
    descripcion: 'La Personería continúa su labor como defensora de los derechos humanos, con énfasis en la protección de población vulnerable y la vigilancia de la gestión pública municipal.',
  },
]

export default function HistoriaPage() {
  return (
    <>
      <PageHeader
        title="Historia"
        description="Trayectoria de la Personería Municipal de Guadalajara de Buga"
        breadcrumbItems={[
          { label: 'La Entidad', href: '/entidad' },
          { label: 'Historia' },
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
            {/* Introducción */}
            <section className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Orígenes de la Personería Municipal</h2>
              <div className="prose prose-gray max-w-none">
                <p>
                  Las Personerías Municipales en Colombia tienen su origen en la época colonial, cuando los 
                  Personeros del Común fueron establecidos para velar por los intereses de la comunidad. 
                  Con el paso del tiempo y las transformaciones del Estado colombiano, esta institución 
                  evolucionó hasta convertirse en lo que hoy conocemos.
                </p>
                <p>
                  La Personería Municipal de Guadalajara de Buga, como parte del Ministerio Público, tiene 
                  la responsabilidad de ejercer la guarda y promoción de los derechos humanos, proteger el 
                  interés público, vigilar la conducta oficial de quienes desempeñan funciones públicas y 
                  defender los derechos de los ciudadanos.
                </p>
                <p>
                  Guadalajara de Buga, ciudad señorial fundada en 1555, cuenta con una rica historia que 
                  se entrelaza con la evolución de sus instituciones. La Personería ha sido parte 
                  fundamental del desarrollo democrático y la protección de los derechos de los bugueños.
                </p>
              </div>
            </section>

            {/* Línea de tiempo */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Línea de Tiempo</h2>
              <div className="relative">
                {/* Línea vertical */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gov-blue/20 transform md:-translate-x-1/2" />
                
                <div className="space-y-8">
                  {lineasTiempo.map((item, index) => (
                    <div 
                      key={item.año}
                      className={`relative flex items-start gap-4 md:gap-8 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Punto en la línea */}
                      <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-gov-blue rounded-full transform -translate-x-1/2 border-4 border-white shadow z-10" />
                      
                      {/* Contenido */}
                      <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <div className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow">
                          <span className="inline-block px-3 py-1 bg-gov-blue text-white text-sm font-bold rounded-full mb-2">
                            {item.año}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.titulo}</h3>
                          <p className="text-gray-600 text-sm">{item.descripcion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Sobre Guadalajara de Buga */}
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre Guadalajara de Buga</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ciudad Señorial</h3>
                  <p className="text-gray-600 text-sm">
                    Guadalajara de Buga es una ciudad colombiana ubicada en el departamento del Valle 
                    del Cauca. Fundada el 4 de marzo de 1555, es reconocida como uno de los principales 
                    centros religiosos del país gracias a la Basílica del Señor de los Milagros.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Patrimonio Cultural</h3>
                  <p className="text-gray-600 text-sm">
                    La ciudad posee un valioso patrimonio arquitectónico e histórico, con construcciones 
                    coloniales y republicanas que dan testimonio de su rica historia. Es un importante 
                    destino turístico religioso que recibe millones de visitantes al año.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
