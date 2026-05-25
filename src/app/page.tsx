import { HeroSlider } from "@/components/home/hero-slider"
import { EnlacesRapidos } from "@/components/home/enlaces-rapidos"
import { NoticiasHome } from "@/components/home/noticias-home"
import { TransparenciaHome } from "@/components/home/transparencia-home"
import { PQRSHome } from "@/components/home/pqrs-home"
import { MapPin, Phone, Clock, Mail } from "lucide-react"
import { getTenantPrisma } from "@/lib/tenant"

export default async function HomePage() {
  let identidad: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['identidadInstitucional']['findFirst']>
  > = null
  let sedePrincipal: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['sede']['findFirst']>
  > = null
  let noticias: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['noticia']['findMany']>
  > = []

  try {
    const prisma = await getTenantPrisma()
    ;[identidad, sedePrincipal, noticias] = await Promise.all([
      prisma.identidadInstitucional.findFirst({ where: { singletonKey: 'default' } }),
      prisma.sede.findFirst({ where: { esPrincipal: true, activa: true } }),
      prisma.noticia.findMany({
        where: { estado: 'PUBLICADO' },
        orderBy: { fechaPublicacion: 'desc' },
        take: 3,
        include: { categoria: true },
      }),
    ])
  } catch {
    // Tenant DB no disponible — render con placeholders
  }

  const direccion = sedePrincipal?.direccion ?? identidad?.direccionPrincipal ?? null
  const ciudadDepto = [identidad?.ciudad, identidad?.departamento]
    .filter(Boolean)
    .join(', ')
  const telefono = identidad?.telefonoConmutador ?? sedePrincipal?.telefono ?? null
  const email = identidad?.emailContacto ?? sedePrincipal?.email ?? null
  const horario = sedePrincipal?.horarioAtencion ?? null
  const mapEmbed = identidad?.urlGoogleMapsEmbed ?? null
  const ubicacionAriaLabel =
    identidad?.nombreCompleto ?? 'Ubicación de la entidad'

  const noticiasUI = noticias.map((n) => ({
    id: n.id,
    titulo: n.titulo,
    slug: n.slug,
    extracto: n.extracto ?? undefined,
    imagenDestacada: n.imagenDestacada ?? undefined,
    fechaPublicacion:
      (n.fechaPublicacion ?? n.createdAt).toISOString().slice(0, 10),
    categoria: n.categoria
      ? {
          nombre: n.categoria.nombre,
          color: n.categoria.color ?? undefined,
        }
      : undefined,
  }))

  return (
    <>
      {/* Hero Slider con counters institucionales */}
      <HeroSlider nombreEntidad={identidad?.nombreCompleto ?? 'Entidad Pública'} />

      {/* Accesos rápidos */}
      <EnlacesRapidos />

      {/* Sección de Transparencia — dark glassmorphism */}
      <TransparenciaHome />

      {/* Últimas Noticias — layout editorial */}
      <NoticiasHome noticias={noticiasUI} />

      {/* PQRS — split layout con consulta rápida */}
      <PQRSHome
        direccion={direccion}
        telefono={telefono}
        email={identidad?.emailPqrsd ?? email}
      />

      {/* Ubicación — mapa + información de contacto */}
      <section className="py-16 bg-white" aria-labelledby="ubicacion-title">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-gov-blue font-semibold text-sm uppercase tracking-widest mb-3">
              <span className="w-8 h-0.5 bg-gov-blue inline-block" />
              Encuéntrenos
            </div>
            <h2 id="ubicacion-title" className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Dónde Estamos
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Info cards */}
            <div className="space-y-4">
              {direccion && (
                <InfoCard
                  icon={MapPin}
                  label="Dirección"
                  value={direccion}
                  sub={ciudadDepto || undefined}
                  color="bg-blue-50 text-blue-600"
                />
              )}
              {telefono && (
                <InfoCard
                  icon={Phone}
                  label="Teléfono"
                  value={telefono}
                  sub="Línea de atención ciudadana"
                  color="bg-emerald-50 text-emerald-600"
                />
              )}
              {email && (
                <InfoCard
                  icon={Mail}
                  label="Correo"
                  value={email}
                  sub="Respuesta en 1 día hábil"
                  color="bg-purple-50 text-purple-600"
                />
              )}
              {horario && (
                <InfoCard
                  icon={Clock}
                  label="Horarios"
                  value={horario.split('\n')[0] || horario}
                  sub={horario.split('\n').slice(1).join(' · ') || undefined}
                  color="bg-orange-50 text-orange-600"
                />
              )}
              {!direccion && !telefono && !email && !horario && (
                <p className="text-sm text-gray-500 italic">
                  Información de contacto pendiente de configurar.
                </p>
              )}
            </div>

            {/* Map embed */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-xl h-[400px] bg-gray-100">
                {mapEmbed ? (
                  <iframe
                    src={mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Ubicación ${ubicacionAriaLabel}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Mapa no configurado
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 hover:border-gov-blue/20 hover:shadow-sm transition-all">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="font-bold text-gray-900 text-sm">{value}</p>
        {sub ? <p className="text-xs text-gray-500">{sub}</p> : null}
      </div>
    </div>
  )
}
