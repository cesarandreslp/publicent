import Link from "next/link"
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
} from "lucide-react"
import { getTenantPrisma } from "@/lib/tenant"

const footerLinks = {
  entidad: [
    { label: "Misión y Visión", href: "/entidad/mision-vision" },
    { label: "Organigrama", href: "/entidad/organigrama" },
    { label: "Directorio", href: "/entidad/directorio" },
  ],
  transparencia: [
    { label: "Información de la Entidad", href: "/transparencia/informacion-entidad" },
    { label: "Normativa", href: "/transparencia/normativa" },
    { label: "Contratación", href: "/transparencia/contratacion" },
    { label: "Planeación y Presupuesto", href: "/transparencia/planeacion" },
    { label: "Datos Abiertos", href: "/transparencia/datos-abiertos" },
  ],
  atencion: [
    { label: "PQRSD", href: "/atencion-ciudadano/pqrsd" },
    { label: "Consultar PQRSD", href: "/atencion-ciudadano/pqrsd/consulta" },
    { label: "Mecanismos de Contacto", href: "/atencion-ciudadano/canales-atencion" },
    { label: "Preguntas Frecuentes", href: "/atencion-ciudadano/preguntas-frecuentes" },
  ],
  legal: [
    { label: "Mapa del Sitio", href: "/mapa-sitio" },
    { label: "Políticas de Privacidad", href: "/privacidad" },
    { label: "Términos y Condiciones", href: "/terminos" },
    { label: "Derechos de Autor", href: "/politicas/derechos-autor" },
    { label: "Accesibilidad", href: "/accesibilidad" },
  ],
}

export async function Footer() {
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
  } catch {
    // Tenant DB no disponible — render con placeholders genéricos
  }

  const nombreCompleto = identidad?.nombreCompleto ?? 'Entidad Pública'
  const ciudadDepto = [identidad?.ciudad, identidad?.departamento]
    .filter(Boolean)
    .join(', ')

  const direccion = sedePrincipal?.direccion ?? identidad?.direccionPrincipal ?? null
  const codigoPostal = identidad?.codigoPostal ?? null
  const telefonoConmutador = identidad?.telefonoConmutador ?? sedePrincipal?.telefono ?? null
  const horarioAtencion = sedePrincipal?.horarioAtencion ?? null
  const emailContacto = identidad?.emailContacto ?? sedePrincipal?.email ?? null
  const emailNotificaciones = identidad?.emailNotificaciones ?? null

  const inicialesLogo =
    (identidad?.nombreCorto ?? identidad?.nombreCompleto ?? 'EP')
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()

  const socialLinks = [
    identidad?.facebookUrl ? { icon: Facebook, href: identidad.facebookUrl, label: 'Facebook' } : null,
    identidad?.twitterUrl ? { icon: Twitter, href: identidad.twitterUrl, label: 'Twitter' } : null,
    identidad?.instagramUrl ? { icon: Instagram, href: identidad.instagramUrl, label: 'Instagram' } : null,
    identidad?.youtubeUrl ? { icon: Youtube, href: identidad.youtubeUrl, label: 'YouTube' } : null,
    identidad?.linkedinUrl ? { icon: Linkedin, href: identidad.linkedinUrl, label: 'LinkedIn' } : null,
  ].filter((x): x is { icon: typeof Facebook; href: string; label: string } => x !== null)

  return (
    <footer
      id="footer"
      role="contentinfo"
      aria-label="Información de contacto y enlaces del pie de página"
      className="bg-gray-900 text-gray-300"
    >
      {/* Sección principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Información de contacto */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {identidad?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={identidad.logoUrl}
                  alt={`Logo ${nombreCompleto}`}
                  className="w-12 h-12 rounded-full bg-white object-contain"
                />
              ) : (
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gov-blue font-bold">
                  {inicialesLogo}
                </div>
              )}
              <div>
                <h3 className="font-bold text-white">{identidad?.nombreCorto ?? nombreCompleto}</h3>
                {ciudadDepto ? <p className="text-sm">{ciudadDepto}</p> : null}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {direccion && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Dirección:</p>
                    <p>{direccion}</p>
                    {ciudadDepto ? <p>{ciudadDepto}</p> : null}
                    {codigoPostal ? <p>Código Postal: {codigoPostal}</p> : null}
                  </div>
                </div>
              )}

              {telefonoConmutador && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Conmutador:</p>
                    <p>{telefonoConmutador}</p>
                  </div>
                </div>
              )}

              {emailContacto && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Correo institucional:</p>
                    <a
                      href={`mailto:${emailContacto}`}
                      className="hover:text-white transition-colors"
                    >
                      {emailContacto}
                    </a>
                    {emailNotificaciones && (
                      <>
                        <p className="font-medium text-white mt-2">Notificaciones judiciales:</p>
                        <a
                          href={`mailto:${emailNotificaciones}`}
                          className="hover:text-white transition-colors"
                        >
                          {emailNotificaciones}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}

              {horarioAtencion && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Horario de Atención:</p>
                    <p className="whitespace-pre-line">{horarioAtencion}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Redes sociales */}
            {socialLinks.length > 0 && (
              <div className="flex gap-4 mt-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gov-blue transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Enlaces - La Entidad */}
          <div>
            <h4 className="font-bold text-white mb-4">La Entidad</h4>
            <ul className="space-y-2">
              {footerLinks.entidad.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces - Transparencia */}
          <div>
            <h4 className="font-bold text-white mb-4">Transparencia</h4>
            <ul className="space-y-2">
              {footerLinks.transparencia.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enlaces - Atención al Ciudadano */}
          <div>
            <h4 className="font-bold text-white mb-4">Atención al Ciudadano</h4>
            <ul className="space-y-2">
              {footerLinks.atencion.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="font-bold text-white mb-4 mt-6">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Barra inferior con logos GOV.CO */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="https://www.gov.co" target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/govco.png" alt="GOV.CO" className="h-8" />
              </Link>
              <Link href="https://www.colombia.co" target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/colombiaco-logo.png" alt="Colombia.co" className="h-8" />
              </Link>
            </div>

            <div className="text-center md:text-right text-sm">
              <p suppressHydrationWarning>
                © {new Date().getFullYear()} {nombreCompleto}
              </p>
              <p className="text-gray-500">Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificación Ley 1712 */}
      <div className="bg-gov-blue py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 text-white text-sm">
            <ExternalLink className="h-4 w-4" />
            <Link href="/transparencia/certificacion" className="hover:underline">
              Certificación Cumplimiento Ley 1712 de 2014 - Sede Electrónica
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
