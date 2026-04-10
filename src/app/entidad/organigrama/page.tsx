import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'

export const metadata: Metadata = {
  title: 'Organigrama | Personería Municipal de Guadalajara de Buga',
  description: 'Estructura organizacional de la Personería Municipal de Guadalajara de Buga.',
}

const menuItems = [
  { label: 'Misión y Visión', href: '/entidad/mision-vision' },
  { label: 'Historia', href: '/entidad/historia' },
  { label: 'Organigrama', href: '/entidad/organigrama' },
  { label: 'Directorio de Funcionarios', href: '/entidad/directorio' },
  { label: 'Funciones y Deberes', href: '/entidad/funciones' },
]

export default function OrganigramaPage() {
  return (
    <>
      <PageHeader
        title="Organigrama"
        description="Estructura organizacional de la Personería Municipal"
        breadcrumbItems={[
          { label: 'La Entidad', href: '/entidad' },
          { label: 'Organigrama' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <SidebarMenu title="La Entidad" items={menuItems} />
          </aside>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            {/* Organigrama visual */}
            <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Estructura Organizacional
              </h2>
              
              <div className="flex flex-col items-center">
                {/* Personero Municipal */}
                <div className="bg-gov-blue text-white rounded-lg px-6 py-4 text-center shadow-lg mb-4">
                  <h3 className="font-bold text-lg">Personero Municipal</h3>
                  <p className="text-white/80 text-sm">Representante Legal</p>
                </div>
                
                {/* Línea conectora */}
                <div className="w-0.5 h-8 bg-gov-blue/30"></div>
                
                {/* Nivel 2 */}
                <div className="grid md:grid-cols-3 gap-4 w-full max-w-4xl">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-8 bg-gov-blue/30 md:hidden"></div>
                    <div className="bg-gov-blue-dark text-white rounded-lg px-4 py-3 text-center w-full">
                      <h4 className="font-semibold text-sm">Secretaría General</h4>
                      <p className="text-white/70 text-xs">Apoyo Administrativo</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-8 bg-gov-blue/30"></div>
                    <div className="bg-gov-blue-dark text-white rounded-lg px-4 py-3 text-center w-full">
                      <h4 className="font-semibold text-sm">Área Jurídica</h4>
                      <p className="text-white/70 text-xs">Asesoría Legal</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-8 bg-gov-blue/30 md:hidden"></div>
                    <div className="bg-gov-blue-dark text-white rounded-lg px-4 py-3 text-center w-full">
                      <h4 className="font-semibold text-sm">Área de Derechos Humanos</h4>
                      <p className="text-white/70 text-xs">Protección y Defensa</p>
                    </div>
                  </div>
                </div>

                {/* Línea conectora */}
                <div className="w-full max-w-4xl h-0.5 bg-gov-blue/30 my-4 hidden md:block"></div>

                {/* Nivel 3 */}
                <div className="grid md:grid-cols-4 gap-4 w-full max-w-5xl mt-4">
                  <div className="bg-blue-100 border-2 border-gov-blue rounded-lg px-3 py-3 text-center">
                    <h4 className="font-semibold text-sm text-gov-blue">Atención al Ciudadano</h4>
                    <p className="text-gray-600 text-xs mt-1">PQRSD y Orientación</p>
                  </div>
                  
                  <div className="bg-blue-100 border-2 border-gov-blue rounded-lg px-3 py-3 text-center">
                    <h4 className="font-semibold text-sm text-gov-blue">Vigilancia Administrativa</h4>
                    <p className="text-gray-600 text-xs mt-1">Control Disciplinario</p>
                  </div>
                  
                  <div className="bg-blue-100 border-2 border-gov-blue rounded-lg px-3 py-3 text-center">
                    <h4 className="font-semibold text-sm text-gov-blue">Víctimas y Población Vulnerable</h4>
                    <p className="text-gray-600 text-xs mt-1">Atención Especial</p>
                  </div>
                  
                  <div className="bg-blue-100 border-2 border-gov-blue rounded-lg px-3 py-3 text-center">
                    <h4 className="font-semibold text-sm text-gov-blue">Medio Ambiente</h4>
                    <p className="text-gray-600 text-xs mt-1">Protección Ambiental</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Descripción de áreas */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción de Áreas</h2>
              
              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h3 className="font-semibold text-gov-blue text-lg mb-2">Despacho del Personero</h3>
                <p className="text-gray-600 text-sm">
                  Dirección general de la entidad, representación legal, toma de decisiones estratégicas 
                  y coordinación de todas las áreas. El Personero Municipal es elegido por el Concejo 
                  Municipal para un período de cuatro años.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h3 className="font-semibold text-gov-blue text-lg mb-2">Secretaría General</h3>
                <p className="text-gray-600 text-sm">
                  Gestión administrativa, manejo de correspondencia, archivo institucional, gestión 
                  documental y apoyo logístico a todas las dependencias de la Personería.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h3 className="font-semibold text-gov-blue text-lg mb-2">Área Jurídica</h3>
                <p className="text-gray-600 text-sm">
                  Asesoría legal, representación judicial, elaboración de conceptos jurídicos, 
                  vigilancia de procesos administrativos y defensa del ordenamiento jurídico.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h3 className="font-semibold text-gov-blue text-lg mb-2">Área de Derechos Humanos</h3>
                <p className="text-gray-600 text-sm">
                  Promoción y protección de derechos humanos, atención a población vulnerable, 
                  víctimas del conflicto armado, y seguimiento a casos de violación de derechos 
                  fundamentales.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-5">
                <h3 className="font-semibold text-gov-blue text-lg mb-2">Atención al Ciudadano</h3>
                <p className="text-gray-600 text-sm">
                  Recepción y trámite de peticiones, quejas, reclamos, sugerencias y denuncias (PQRSD), 
                  orientación ciudadana y seguimiento a las respuestas de las entidades.
                </p>
              </div>
            </section>

            {/* Documento descargable */}
            <section className="mt-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos Relacionados</h2>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Organigrama (PDF)
                </a>
                <a 
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
