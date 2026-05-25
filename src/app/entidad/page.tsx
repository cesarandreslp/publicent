import { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2,
  Target,
  Users,
  ClipboardList,
  History,
  ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getTenantPrisma } from '@/lib/tenant'
import { getIdentidadPublica } from '@/lib/identidad-publica'

export const metadata: Metadata = {
  title: 'La Entidad',
  description:
    'Conozca la entidad: misión, visión, estructura organizacional, directorio de funcionarios y funciones.',
}

const secciones = [
  {
    titulo: 'Misión y Visión',
    descripcion:
      'Conoce nuestra razón de ser y hacia dónde nos dirigimos como entidad.',
    href: '/entidad/mision-vision',
    icono: Target,
    color: 'bg-blue-500',
  },
  {
    titulo: 'Historia',
    descripcion: 'Descubre los orígenes y la trayectoria de la entidad.',
    href: '/entidad/historia',
    icono: History,
    color: 'bg-amber-500',
  },
  {
    titulo: 'Organigrama',
    descripcion: 'Visualiza la estructura organizacional de la entidad.',
    href: '/entidad/organigrama',
    icono: Building2,
    color: 'bg-green-500',
  },
  {
    titulo: 'Directorio de Funcionarios',
    descripcion: 'Información de contacto de los servidores públicos.',
    href: '/entidad/directorio',
    icono: Users,
    color: 'bg-purple-500',
  },
  {
    titulo: 'Funciones y Deberes',
    descripcion: 'Conoce las funciones constitucionales y legales de la entidad.',
    href: '/entidad/funciones',
    icono: ClipboardList,
    color: 'bg-red-500',
  },
]

export default async function EntidadPage() {
  const id = await getIdentidadPublica()

  let sedes: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['sede']['findMany']>
  > = []
  try {
    const prisma = await getTenantPrisma()
    sedes = await prisma.sede.findMany({
      where: { activa: true },
      orderBy: [{ esPrincipal: 'desc' }, { orden: 'asc' }, { createdAt: 'asc' }],
      take: 2,
    })
  } catch {}

  const sedePrincipal = sedes.find((s) => s.esPrincipal) ?? sedes[0] ?? null
  const sedeSecundaria = sedes.find((s) => !s.esPrincipal) ?? null

  return (
    <>
      <PageHeader
        title="La Entidad"
        description={`Conozca ${id.nombreCompleto}.`}
        breadcrumbItems={[{ label: 'La Entidad' }]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Grid de secciones */}
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {secciones.map((seccion) => (
            <Link
              key={seccion.href}
              href={seccion.href}
              className="group bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all hover:border-gov-blue"
            >
              <div
                className={`w-14 h-14 ${seccion.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <seccion.icono className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gov-blue transition-colors">
                {seccion.titulo}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{seccion.descripcion}</p>
              <span className="inline-flex items-center text-gov-blue font-medium text-sm">
                Ver más
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </section>

        {/* Información de contacto */}
        {(sedePrincipal || id.telefonoConmutador || id.emailContacto) && (
          <section className="mt-12 bg-gov-blue text-white rounded-lg p-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Información de Contacto</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {sedePrincipal && (
                  <div>
                    <h3 className="font-semibold mb-3">{sedePrincipal.nombre}</h3>
                    <address className="not-italic text-white/90 space-y-2">
                      <p>{sedePrincipal.direccion}</p>
                      {sedePrincipal.ciudad ? (
                        <p>{sedePrincipal.ciudad}</p>
                      ) : id.ciudadDepto ? (
                        <p>{id.ciudadDepto}</p>
                      ) : null}
                    </address>
                  </div>
                )}
                {(id.telefonoConmutador || id.emailContacto) && (
                  <div>
                    <h3 className="font-semibold mb-3">Contacto</h3>
                    <div className="text-white/90 space-y-2">
                      {id.telefonoConmutador && (
                        <p>Teléfono: {id.telefonoConmutador}</p>
                      )}
                      {id.emailContacto && <p>Email: {id.emailContacto}</p>}
                    </div>
                  </div>
                )}
                {sedePrincipal?.horarioAtencion && (
                  <div>
                    <h3 className="font-semibold mb-3">Horario de Atención</h3>
                    <div className="text-white/90 whitespace-pre-line">
                      {sedePrincipal.horarioAtencion}
                    </div>
                  </div>
                )}
                {sedeSecundaria && (
                  <div>
                    <h3 className="font-semibold mb-3">{sedeSecundaria.nombre}</h3>
                    <address className="not-italic text-white/90 space-y-2">
                      <p>{sedeSecundaria.direccion}</p>
                      {sedeSecundaria.telefono && (
                        <p>Teléfono: {sedeSecundaria.telefono}</p>
                      )}
                      {sedeSecundaria.horarioAtencion && (
                        <p className="whitespace-pre-line">
                          {sedeSecundaria.horarioAtencion}
                        </p>
                      )}
                    </address>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
