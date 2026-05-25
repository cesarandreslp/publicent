import { Metadata } from 'next'
import { Mail, Phone, User } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'
import { getTenantPrisma } from '@/lib/tenant'

export const metadata: Metadata = {
  title: 'Directorio de Funcionarios',
  description: 'Directorio de servidores públicos con información de contacto.',
}

const menuItems = [
  { label: 'Misión y Visión', href: '/entidad/mision-vision' },
  { label: 'Historia', href: '/entidad/historia' },
  { label: 'Organigrama', href: '/entidad/organigrama' },
  { label: 'Directorio de Funcionarios', href: '/entidad/directorio' },
  { label: 'Funciones y Deberes', href: '/entidad/funciones' },
]

export default async function DirectorioPage() {
  let funcionarios: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['funcionario']['findMany']>
  > = []
  let identidad: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['identidadInstitucional']['findFirst']>
  > = null
  let sedes: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['sede']['findMany']>
  > = []

  try {
    const prisma = await getTenantPrisma()
    ;[funcionarios, identidad, sedes] = await Promise.all([
      prisma.funcionario.findMany({
        where: { activo: true, visibleEnDirectorio: true },
        orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.identidadInstitucional.findFirst({ where: { singletonKey: 'default' } }),
      prisma.sede.findMany({
        where: { activa: true },
        orderBy: [{ esPrincipal: 'desc' }, { orden: 'asc' }, { createdAt: 'asc' }],
      }),
    ])
  } catch {}

  const ciudadDepto = [identidad?.ciudad, identidad?.departamento]
    .filter(Boolean)
    .join(', ')
  const sedePrincipal = sedes.find((s) => s.esPrincipal) ?? sedes[0] ?? null

  return (
    <>
      <PageHeader
        title="Directorio de Funcionarios"
        description="Información de contacto de los servidores públicos"
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
                <strong>Nota:</strong> El directorio se actualiza periódicamente.
                {identidad?.telefonoConmutador
                  ? ` Para información oficial, comuníquese al teléfono ${identidad.telefonoConmutador}`
                  : ''}
                {identidad?.emailContacto
                  ? ` o al correo ${identidad.emailContacto}`
                  : ''}
                .
              </p>
            </div>

            {/* Grid de funcionarios */}
            {funcionarios.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
                Aún no hay funcionarios publicados en el directorio.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {funcionarios.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gov-blue/5 px-5 py-4 border-b">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gov-blue/10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                          {f.foto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.foto}
                              alt={f.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gov-blue" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{f.nombre}</h3>
                          <p className="text-gov-blue font-medium text-sm">{f.cargo}</p>
                          <p className="text-gray-500 text-xs mt-1">{f.dependencia}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      {f.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a
                            href={`mailto:${f.email}`}
                            className="text-gov-blue hover:underline"
                          >
                            {f.email}
                          </a>
                        </div>
                      )}

                      {(f.telefono || f.extension) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {f.telefono ?? ''}
                            {f.telefono && f.extension ? ' ' : ''}
                            {f.extension ? `Ext. ${f.extension}` : ''}
                          </span>
                        </div>
                      )}

                      {(f.tipoVinculacion || f.formacionAcademica) && (
                        <div className="pt-3 border-t space-y-2">
                          {f.tipoVinculacion && (
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Vinculación:</span>
                              <span className="text-gray-700">{f.tipoVinculacion}</span>
                            </div>
                          )}
                          {f.formacionAcademica && (
                            <div className="flex justify-between text-xs gap-2">
                              <span className="text-gray-500 shrink-0">Formación:</span>
                              <span className="text-gray-700 text-right">
                                {f.formacionAcademica}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Información adicional */}
            <section className="mt-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Información de Contacto General
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {sedePrincipal && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {sedePrincipal.nombre}
                    </h3>
                    <address className="not-italic text-gray-600 text-sm space-y-1">
                      <p>{sedePrincipal.direccion}</p>
                      {sedePrincipal.ciudad ? (
                        <p>{sedePrincipal.ciudad}</p>
                      ) : ciudadDepto ? (
                        <p>{ciudadDepto}</p>
                      ) : null}
                      {identidad?.codigoPostal ? (
                        <p>Código Postal: {identidad.codigoPostal}</p>
                      ) : null}
                    </address>
                  </div>
                )}
                {sedePrincipal?.horarioAtencion && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Horario de Atención</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {sedePrincipal.horarioAtencion}
                    </p>
                  </div>
                )}
                {identidad?.emailNotificaciones && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Correo de Notificaciones
                    </h3>
                    <p className="text-gray-600 text-sm">{identidad.emailNotificaciones}</p>
                  </div>
                )}
                {sedes
                  .filter((s) => !s.esPrincipal)
                  .slice(0, 1)
                  .map((s) => (
                    <div key={s.id}>
                      <h3 className="font-semibold text-gray-900 mb-2">{s.nombre}</h3>
                      <div className="text-gray-600 text-sm space-y-1">
                        <p>{s.direccion}</p>
                        {s.telefono ? <p>Teléfono: {s.telefono}</p> : null}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
