import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'
import { PaginaContenido } from '@/components/shared/pagina-contenido'

export const metadata: Metadata = {
  title: 'Historia',
  description: 'Trayectoria y antecedentes históricos de la entidad.',
}

const menuItems = [
  { label: 'Misión y Visión', href: '/entidad/mision-vision' },
  { label: 'Historia', href: '/entidad/historia' },
  { label: 'Organigrama', href: '/entidad/organigrama' },
  { label: 'Directorio de Funcionarios', href: '/entidad/directorio' },
  { label: 'Funciones y Deberes', href: '/entidad/funciones' },
]

export default function HistoriaPage() {
  return (
    <>
      <PageHeader
        title="Historia"
        description="Trayectoria y antecedentes de la entidad"
        breadcrumbItems={[
          { label: 'La Entidad', href: '/entidad' },
          { label: 'Historia' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <SidebarMenu title="La Entidad" items={menuItems} />
          </aside>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <PaginaContenido slug="historia" />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
