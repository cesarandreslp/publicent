import { Metadata } from 'next'
import { Mail, Phone, User } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'

export const metadata: Metadata = {
  title: 'Directorio de Funcionarios | Personería Municipal de Guadalajara de Buga',
  description: 'Directorio de servidores públicos de la Personería Municipal de Guadalajara de Buga con información de contacto.',
}

const menuItems = [
  { label: 'Misión y Visión', href: '/entidad/mision-vision' },
  { label: 'Historia', href: '/entidad/historia' },
  { label: 'Organigrama', href: '/entidad/organigrama' },
  { label: 'Directorio de Funcionarios', href: '/entidad/directorio' },
  { label: 'Funciones y Deberes', href: '/entidad/funciones' },
]

// Datos de ejemplo - En producción vendrían de la base de datos
const funcionarios = [
  {
    id: 1,
    nombre: 'Dr. Nikolai Olaya',
    cargo: 'Personero Municipal',
    dependencia: 'Despacho del Personero',
    email: 'personero@personeriabuga.gov.co',
    telefono: '(602) 2017004 Ext. 101',
    tipoVinculacion: 'Elección Popular',
    formacionAcademica: 'Abogado',
    experiencia: 'Especialista en Derecho Administrativo',
  },
  {
    id: 2,
    nombre: 'Secretario(a) General',
    cargo: 'Secretario(a) General',
    dependencia: 'Secretaría General',
    email: 'secretaria@personeriabuga.gov.co',
    telefono: '(602) 2017004 Ext. 102',
    tipoVinculacion: 'Carrera Administrativa',
    formacionAcademica: 'Administrador Público',
    experiencia: 'Gestión Administrativa',
  },
  {
    id: 3,
    nombre: 'Profesional Jurídico',
    cargo: 'Asesor Jurídico',
    dependencia: 'Área Jurídica',
    email: 'juridica@personeriabuga.gov.co',
    telefono: '(602) 2017004 Ext. 103',
    tipoVinculacion: 'Contratista',
    formacionAcademica: 'Abogado',
    experiencia: 'Derecho Público y Administrativo',
  },
  {
    id: 4,
    nombre: 'Profesional Derechos Humanos',
    cargo: 'Profesional Especializado',
    dependencia: 'Área de Derechos Humanos',
    email: 'derechoshumanos@personeriabuga.gov.co',
    telefono: '(602) 2017004 Ext. 104',
    tipoVinculacion: 'Contratista',
    formacionAcademica: 'Trabajador Social',
    experiencia: 'Atención a Víctimas',
  },
  {
    id: 5,
    nombre: 'Profesional Atención al Ciudadano',
    cargo: 'Profesional Universitario',
    dependencia: 'Atención al Ciudadano',
    email: 'contactenos@personeriabuga.gov.co',
    telefono: '(602) 2017004 Ext. 105',
    tipoVinculacion: 'Carrera Administrativa',
    formacionAcademica: 'Profesional',
    experiencia: 'Servicio al Ciudadano',
  },
]

export default function DirectorioPage() {
  return (
    <>
      <PageHeader
        title="Directorio de Funcionarios"
        description="Información de contacto de los servidores públicos de la Personería"
        breadcrumbItems={[
          { label: 'La Entidad', href: '/entidad' },
          { label: 'Directorio de Funcionarios' },
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
            {/* Información importante */}
            <div className="bg-blue-50 border-l-4 border-gov-blue rounded-r-lg p-4 mb-8">
              <p className="text-sm text-gray-700">
                <strong>Nota:</strong> El directorio de funcionarios se actualiza periódicamente. 
                Para información oficial y actualizada, comuníquese con la Personería Municipal 
                al teléfono (602) 2017004 o al correo contactenos@personeriabuga.gov.co
              </p>
            </div>

            {/* Grid de funcionarios */}
            <div className="grid md:grid-cols-2 gap-6">
              {funcionarios.map((funcionario) => (
                <div 
                  key={funcionario.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="bg-gov-blue/5 px-5 py-4 border-b">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gov-blue/10 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-8 h-8 text-gov-blue" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{funcionario.nombre}</h3>
                        <p className="text-gov-blue font-medium text-sm">{funcionario.cargo}</p>
                        <p className="text-gray-500 text-xs mt-1">{funcionario.dependencia}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a 
                        href={`mailto:${funcionario.email}`}
                        className="text-gov-blue hover:underline"
                      >
                        {funcionario.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{funcionario.telefono}</span>
                    </div>
                    
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Vinculación:</span>
                        <span className="text-gray-700">{funcionario.tipoVinculacion}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Formación:</span>
                        <span className="text-gray-700">{funcionario.formacionAcademica}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Información adicional */}
            <section className="mt-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Información de Contacto General</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sede Principal</h3>
                  <address className="not-italic text-gray-600 text-sm space-y-1">
                    <p>Calle 7 N° 12-45</p>
                    <p>Edificio Alcaldía Municipal</p>
                    <p>Guadalajara de Buga, Valle del Cauca</p>
                    <p>Código Postal: 763001</p>
                  </address>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Horario de Atención</h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p><strong>Lunes a Viernes</strong></p>
                    <p>Mañana: 7:30 a.m. - 12:00 m.</p>
                    <p>Tarde: 2:00 p.m. - 5:00 p.m.</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Correo de Notificaciones</h3>
                  <p className="text-gray-600 text-sm">
                    notificacionesjudiciales@personeriabuga.gov.co
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Casa de la Justicia</h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p>Calle 30 # 13-01</p>
                    <p>Teléfono: (602) 2366781</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Documentos */}
            <section className="mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Documentos Relacionados</h2>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Directorio Completo (PDF)
                </a>
                <a 
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gov-blue hover:text-white hover:border-gov-blue transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Declaraciones de Bienes y Rentas
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
