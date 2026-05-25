import { Metadata } from 'next'
import Link from 'next/link'
import {
  MessageSquare,
  Search,
  HelpCircle,
  Phone,
  Shield,
  Clock,
  ChevronRight,
  FileText,
  Users,
  Mail,
  MapPin,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getTenantPrisma } from '@/lib/tenant'

export const metadata: Metadata = {
  title: 'Atención al Ciudadano',
  description:
    'Canales de atención, PQRSD, preguntas frecuentes y servicios de atención al ciudadano.',
}

const servicios = [
  {
    titulo: 'Radicar PQRSD',
    descripcion: 'Presente sus Peticiones, Quejas, Reclamos, Sugerencias y Denuncias de forma fácil y segura.',
    href: '/atencion-ciudadano/pqrsd',
    icono: MessageSquare,
    color: 'bg-blue-500',
    destacado: true,
  },
  {
    titulo: 'Consultar PQRSD',
    descripcion: 'Consulte el estado de su solicitud con el número de radicado.',
    href: '/atencion-ciudadano/pqrsd/consulta',
    icono: Search,
    color: 'bg-green-500',
    destacado: true,
  },
  {
    titulo: 'Preguntas Frecuentes',
    descripcion: 'Encuentre respuestas a las dudas más comunes de los ciudadanos.',
    href: '/atencion-ciudadano/preguntas-frecuentes',
    icono: HelpCircle,
    color: 'bg-purple-500',
    destacado: false,
  },
  {
    titulo: 'Canales de Atención',
    descripcion: 'Conozca todas las formas de comunicarse con la Personería.',
    href: '/atencion-ciudadano/canales-atencion',
    icono: Phone,
    color: 'bg-amber-500',
    destacado: false,
  },
  {
    titulo: 'Defensoría del Pueblo',
    descripcion: 'Información sobre los servicios de la Defensoría del Pueblo.',
    href: '/atencion-ciudadano/defensoria',
    icono: Shield,
    color: 'bg-red-500',
    destacado: false,
  },
]

const tiposPQRS = [
  {
    tipo: 'Petición',
    descripcion: 'Solicitud respetuosa de información o actuación de la entidad',
    plazo: '15 días hábiles',
    icono: FileText,
  },
  {
    tipo: 'Queja',
    descripcion: 'Manifestación de inconformidad sobre la conducta de un servidor público',
    plazo: '15 días hábiles',
    icono: MessageSquare,
  },
  {
    tipo: 'Reclamo',
    descripcion: 'Exigencia de un derecho que considera vulnerado',
    plazo: '15 días hábiles',
    icono: Users,
  },
  {
    tipo: 'Sugerencia',
    descripcion: 'Propuesta para mejorar los servicios de la entidad',
    plazo: '15 días hábiles',
    icono: HelpCircle,
  },
  {
    tipo: 'Denuncia',
    descripcion: 'Información sobre presuntas irregularidades o hechos delictivos',
    plazo: 'Según la naturaleza',
    icono: Shield,
  },
]

export default async function AtencionCiudadanoPage() {
  let identidad: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['identidadInstitucional']['findFirst']>
  > = null
  let sedePrincipal: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['sede']['findFirst']>
  > = null
  try {
    const prisma = await getTenantPrisma()
    ;[identidad, sedePrincipal] = await Promise.all([
      prisma.identidadInstitucional.findFirst({ where: { singletonKey: 'default' } }),
      prisma.sede.findFirst({ where: { esPrincipal: true, activa: true } }),
    ])
  } catch {}

  const direccion = sedePrincipal?.direccion ?? identidad?.direccionPrincipal ?? null
  const ciudadDepto = [identidad?.ciudad, identidad?.departamento]
    .filter(Boolean)
    .join(', ')
  const telefono = identidad?.telefonoConmutador ?? sedePrincipal?.telefono ?? null
  const email = identidad?.emailContacto ?? sedePrincipal?.email ?? null
  const horario = sedePrincipal?.horarioAtencion ?? null

  return (
    <>
      <PageHeader
        title="Atención al Ciudadano"
        description="Estamos para servirle. Conozca nuestros canales de atención y servicios disponibles."
        breadcrumbItems={[{ label: 'Atención al Ciudadano' }]}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Servicios destacados */}
        <section className="mb-12">
          <div className="grid md:grid-cols-2 gap-6">
            {servicios.filter(s => s.destacado).map((servicio) => (
              <Link
                key={servicio.href}
                href={servicio.href}
                className="group bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all hover:border-gov-blue"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 ${servicio.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <servicio.icono className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gov-blue transition-colors">
                      {servicio.titulo}
                    </h2>
                    <p className="text-gray-600">{servicio.descripcion}</p>
                    <span className="inline-flex items-center mt-4 text-gov-blue font-medium">
                      Ir al servicio
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tipos de PQRS */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Solicitudes</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposPQRS.map((tipo) => (
              <div 
                key={tipo.tipo}
                className="bg-white rounded-lg shadow-sm border p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gov-blue/10 rounded-lg flex items-center justify-center">
                    <tipo.icono className="w-5 h-5 text-gov-blue" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{tipo.tipo}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">{tipo.descripcion}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Plazo: {tipo.plazo}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Otros servicios */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Más Servicios</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {servicios.filter(s => !s.destacado).map((servicio) => (
              <Link
                key={servicio.href}
                href={servicio.href}
                className="group bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-all hover:border-gov-blue"
              >
                <div className={`w-12 h-12 ${servicio.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <servicio.icono className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gov-blue transition-colors">
                  {servicio.titulo}
                </h3>
                <p className="text-gray-600 text-sm">{servicio.descripcion}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Información de contacto */}
        <section className="bg-gov-blue rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Contáctenos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {direccion && (
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-white/80 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Dirección</h3>
                  <p className="text-white/80 text-sm">
                    {direccion}
                    {ciudadDepto ? (
                      <>
                        <br />
                        {ciudadDepto}
                      </>
                    ) : null}
                  </p>
                </div>
              </div>
            )}
            {telefono && (
              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-white/80 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Teléfono</h3>
                  <p className="text-white/80 text-sm">{telefono}</p>
                </div>
              </div>
            )}
            {email && (
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-white/80 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Correo Electrónico</h3>
                  <p className="text-white/80 text-sm">
                    <a href={`mailto:${email}`} className="hover:underline">
                      {email}
                    </a>
                  </p>
                </div>
              </div>
            )}
            {horario && (
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-white/80 shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Horario</h3>
                  <p className="text-white/80 text-sm whitespace-pre-line">{horario}</p>
                </div>
              </div>
            )}
            {!direccion && !telefono && !email && !horario && (
              <p className="text-white/80 text-sm md:col-span-2 lg:col-span-4">
                Información de contacto pendiente de configurar.
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
