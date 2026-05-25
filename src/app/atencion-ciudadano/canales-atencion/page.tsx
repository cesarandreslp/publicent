import { Metadata } from 'next'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Globe,
  Users,
  Building,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getTenantPrisma } from '@/lib/tenant'

export const metadata: Metadata = {
  title: 'Canales de Atención',
  description:
    'Encuentre todos los canales disponibles para comunicarse con la entidad.',
}

export default async function CanalesAtencionPage() {
  let sedes: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['sede']['findMany']>
  > = []
  let canales: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['canalAtencion']['findMany']>
  > = []
  let identidad: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['identidadInstitucional']['findFirst']>
  > = null

  try {
    const prisma = await getTenantPrisma()
    ;[sedes, canales, identidad] = await Promise.all([
      prisma.sede.findMany({
        where: { activa: true },
        orderBy: [{ esPrincipal: 'desc' }, { orden: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.canalAtencion.findMany({
        where: { activo: true },
        orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.identidadInstitucional.findFirst({ where: { singletonKey: 'default' } }),
    ])
  } catch {}

  const canalesTelefonicos = canales.filter(
    (c) => c.tipo === 'TELEFONICO' || c.tipo === 'WHATSAPP',
  )
  const canalesVirtuales = canales.filter(
    (c) =>
      c.tipo === 'EMAIL' ||
      c.tipo === 'VIRTUAL' ||
      c.tipo === 'REDES_SOCIALES' ||
      c.tipo === 'CHAT',
  )

  const sedePrincipal = sedes.find((s) => s.esPrincipal) ?? sedes[0] ?? null
  const ciudadDepto = [identidad?.ciudad, identidad?.departamento]
    .filter(Boolean)
    .join(', ')
  const mapEmbed = identidad?.urlGoogleMapsEmbed ?? null

  return (
    <>
      <PageHeader
        title="Canales de Atención"
        description="Múltiples formas de comunicarse con nosotros"
        breadcrumbItems={[
          { label: 'Atención al Ciudadano', href: '/atencion-ciudadano' },
          { label: 'Canales de Atención' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Atención Presencial */}
        {sedes.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gov-blue/10 rounded-lg">
                <MapPin className="w-6 h-6 text-gov-blue" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Atención Presencial</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {sedes.map((sede) => (
                <div
                  key={sede.id}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                    sede.esPrincipal ? 'ring-2 ring-gov-blue' : ''
                  }`}
                >
                  {sede.esPrincipal && (
                    <div className="bg-gov-blue px-4 py-1 text-white text-sm font-medium">
                      Sede Principal
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        {sede.esPrincipal ? (
                          <Building className="w-6 h-6 text-gray-600" />
                        ) : (
                          <Users className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {sede.nombre}
                        </h3>
                        <p className="text-gray-600 font-medium">{sede.direccion}</p>
                        {sede.ciudad ? (
                          <p className="text-gray-500 text-sm">{sede.ciudad}</p>
                        ) : ciudadDepto ? (
                          <p className="text-gray-500 text-sm">{ciudadDepto}</p>
                        ) : null}
                        {sede.horarioAtencion && (
                          <div className="flex items-start gap-2 mt-3 text-sm text-gray-600">
                            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                            <span className="whitespace-pre-line">
                              {sede.horarioAtencion}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Atención Telefónica */}
        {canalesTelefonicos.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gov-green/10 rounded-lg">
                <Phone className="w-6 h-6 text-gov-green" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Atención Telefónica</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {canalesTelefonicos.map((canal) => (
                <div key={canal.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">{canal.nombre}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {canal.tipo === 'WHATSAPP' ? 'WhatsApp' : 'Telefónico'}
                    </span>
                  </div>
                  <a
                    href={
                      canal.tipo === 'WHATSAPP'
                        ? `https://wa.me/${canal.valor.replace(/\D/g, '')}`
                        : `tel:${canal.valor.replace(/\D/g, '')}`
                    }
                    className="text-2xl font-bold text-gov-blue hover:underline"
                    target={canal.tipo === 'WHATSAPP' ? '_blank' : undefined}
                    rel={canal.tipo === 'WHATSAPP' ? 'noopener noreferrer' : undefined}
                  >
                    {canal.valor}
                  </a>
                  {canal.descripcion && (
                    <p className="mt-3 text-sm text-gray-500">{canal.descripcion}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Atención Virtual */}
        {canalesVirtuales.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gov-gold/20 rounded-lg">
                <Globe className="w-6 h-6 text-gov-gold" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Atención Virtual</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {canalesVirtuales.map((canal) => {
                const isExternal =
                  canal.tipo === 'VIRTUAL' || canal.tipo === 'REDES_SOCIALES'
                const href =
                  canal.tipo === 'EMAIL' ? `mailto:${canal.valor}` : canal.valor
                const Icon =
                  canal.tipo === 'EMAIL'
                    ? Mail
                    : canal.tipo === 'CHAT'
                      ? MessageCircle
                      : Globe
                return (
                  <Link
                    key={canal.id}
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-gov-blue/10 transition-colors">
                        <Icon className="w-6 h-6 text-gray-600 group-hover:text-gov-blue transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {canal.nombre}
                          {isExternal && (
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          )}
                        </h3>
                        {canal.descripcion && (
                          <p className="text-sm text-gray-500 mb-2">
                            {canal.descripcion}
                          </p>
                        )}
                        <p className="text-gov-blue font-medium text-sm truncate">
                          {canal.valor}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {sedes.length === 0 && canales.length === 0 && (
          <section className="mb-12">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center text-gray-500">
              No hay canales de atención configurados todavía.
            </div>
          </section>
        )}

        {/* Horarios y consideraciones */}
        <section className="mb-12">
          <div className="bg-gov-blue/5 rounded-xl p-6 border border-gov-blue/20">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-gov-blue" />
              <h3 className="text-lg font-bold text-gray-900">Horarios y Consideraciones</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gov-blue rounded-full mt-2 shrink-0" />
                <span>
                  Los días festivos no hay atención presencial. La atención virtual está
                  disponible 24/7.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gov-blue rounded-full mt-2 shrink-0" />
                <span>
                  Las solicitudes radicadas después del horario laboral serán registradas con
                  fecha del siguiente día hábil.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gov-blue rounded-full mt-2 shrink-0" />
                <span>
                  Para atención prioritaria a población vulnerable, adultos mayores y personas
                  con discapacidad, favor comunicarse previamente.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Mapa */}
        {(mapEmbed || sedePrincipal) && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ubicación</h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {mapEmbed ? (
                  <iframe
                    src={mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Ubicación ${identidad?.nombreCompleto ?? 'sede principal'}`}
                  />
                ) : (
                  <div className="text-gray-400 text-sm py-12">
                    Mapa no configurado
                  </div>
                )}
              </div>
              {sedePrincipal && (
                <div className="p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {sedePrincipal.direccion}
                      {(sedePrincipal.ciudad || ciudadDepto)
                        ? `, ${sedePrincipal.ciudad ?? ciudadDepto}`
                        : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
