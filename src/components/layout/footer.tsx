"use client"

import Link from "next/link"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  ExternalLink 
} from "lucide-react"

const footerLinks = {
  entidad: [
    { label: "Misión y Visión", href: "/entidad/mision-vision" },
    { label: "Organigrama", href: "/entidad/organigrama" },
    { label: "Directorio", href: "/entidad/directorio" },
    { label: "Personero Municipal", href: "/entidad/personero" },
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
    { label: "Consultar PQRSD", href: "/atencion-ciudadano/consultar-pqrsd" },
    { label: "Mecanismos de Contacto", href: "/atencion-ciudadano/contacto" },
    { label: "Preguntas Frecuentes", href: "/atencion-ciudadano/faq" },
  ],
  legal: [
    { label: "Mapa del Sitio", href: "/mapa-sitio" },
    { label: "Políticas de Privacidad", href: "/politicas/privacidad" },
    { label: "Términos y Condiciones", href: "/politicas/terminos" },
    { label: "Derechos de Autor", href: "/politicas/derechos-autor" },
    { label: "Accesibilidad", href: "/accesibilidad" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/personeriabuga", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/personeriabuga", label: "Twitter" },
  { icon: Instagram, href: "https://instagram.com/personeriabuga", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/personeriabuga", label: "YouTube" },
]

export function Footer() {
  return (
    <footer id="footer" role="contentinfo" aria-label="Información de contacto y enlaces del pie de página" className="bg-gray-900 text-gray-300">
      {/* Sección principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Información de contacto */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gov-blue font-bold">
                PB
              </div>
              <div>
                <h3 className="font-bold text-white">Personería Municipal</h3>
                <p className="text-sm">Guadalajara de Buga, Valle del Cauca</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Dirección:</p>
                  <p>Calle 7 N° 12-45, Centro</p>
                  <p>Guadalajara de Buga, Valle del Cauca</p>
                  <p>Código Postal: 763001</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Conmutador:</p>
                  <p>+57 (602) 2017004</p>
                  <p>Celular: +57 315 626 9407</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Línea Anticorrupción:</p>
                  <p>+57 (601) 587 8750</p>
                  <p className="text-xs text-gray-400">Línea gratuita nacional: 01 8000 913 040</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Correo institucional:</p>
                  <a href="mailto:contacto@personeriabuga.gov.co" className="hover:text-white transition-colors">
                    contacto@personeriabuga.gov.co
                  </a>
                  <p className="font-medium text-white mt-2">Notificaciones judiciales:</p>
                  <a href="mailto:notificaciones@personeriabuga.gov.co" className="hover:text-white transition-colors">
                    notificaciones@personeriabuga.gov.co
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-gov-blue shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-white">Horario de Atención:</p>
                  <p>Lunes a Viernes: 8:00 a.m. - 12:00 m.</p>
                  <p>2:00 p.m. - 6:00 p.m.</p>
                </div>
              </div>
            </div>

            {/* Redes sociales */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gov-blue transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces - La Entidad */}
          <div>
            <h4 className="font-bold text-white mb-4">La Entidad</h4>
            <ul className="space-y-2">
              {footerLinks.entidad.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
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
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
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
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="font-bold text-white mb-4 mt-6">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
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
              <Link 
                href="https://www.gov.co" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/govco.png" alt="GOV.CO" className="h-8" />
              </Link>
              <Link 
                href="https://www.colombia.co" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="/images/colombiaco-logo.png" alt="Colombia.co" className="h-8" />
              </Link>
            </div>
            
            <div className="text-center md:text-right text-sm">
              <p>© {new Date().getFullYear()} Personería Municipal de Guadalajara de Buga</p>
              <p className="text-gray-500">Todos los derechos reservados - NIT: XXX.XXX.XXX-X</p>
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
