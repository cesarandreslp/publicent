import { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Política de Privacidad | Personería Municipal de Guadalajara de Buga',
  description:
    'Política de privacidad y manejo de datos personales de la Personería Municipal de Guadalajara de Buga',
}

export default function PrivacidadPage() {
  return (
    <>
      <PageHeader
        title="Política de Privacidad"
        description="Conoce cómo protegemos tu información personal"
        breadcrumbItems={[{ label: 'Política de Privacidad' }]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-500 text-sm">
                Última actualización: Enero 2026
              </p>

              <h2>1. Introducción</h2>
              <p>
                La Personería Municipal de Guadalajara de Buga, en cumplimiento de la Ley 1581 de 2012 
                (Ley de Protección de Datos Personales) y el Decreto 1377 de 2013, presenta la 
                presente Política de Privacidad que describe cómo recopilamos, usamos, compartimos 
                y protegemos la información personal de los usuarios de nuestro sitio web y servicios.
              </p>

              <h2>2. Responsable del Tratamiento</h2>
              <p>
                <strong>Personería Municipal de Guadalajara de Buga</strong><br />
                NIT: [NIT de la entidad]<br />
                Dirección: Calle 7 N° 12-45, Guadalajara de Buga, Valle del Cauca<br />
                Teléfono: (602) 2017004<br />
                Correo electrónico: contacto@personeriabuga.gov.co
              </p>

              <h2>3. Datos Personales que Recopilamos</h2>
              <p>Recopilamos los siguientes tipos de información personal:</p>
              <ul>
                <li><strong>Datos de identificación:</strong> Nombre completo, número de documento de identidad, dirección de correo electrónico, número de teléfono, dirección de residencia.</li>
                <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas, tiempo de permanencia.</li>
                <li><strong>Datos de solicitudes:</strong> Información proporcionada en formularios de PQRSD y solicitudes de servicios.</li>
              </ul>

              <h2>4. Finalidades del Tratamiento</h2>
              <p>Los datos personales serán tratados para las siguientes finalidades:</p>
              <ul>
                <li>Atender y dar trámite a las peticiones, quejas, reclamos, sugerencias y denuncias (PQRSD)</li>
                <li>Prestar los servicios ofrecidos por la entidad</li>
                <li>Enviar notificaciones y comunicaciones relacionadas con los trámites</li>
                <li>Realizar estudios estadísticos y análisis de uso del sitio web</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Mejorar la prestación de nuestros servicios</li>
              </ul>

              <h2>5. Derechos de los Titulares</h2>
              <p>De acuerdo con la Ley 1581 de 2012, los titulares de los datos tienen derecho a:</p>
              <ul>
                <li>Conocer, actualizar y rectificar sus datos personales</li>
                <li>Solicitar prueba de la autorización otorgada</li>
                <li>Ser informado sobre el uso dado a sus datos</li>
                <li>Revocar la autorización y solicitar la supresión de sus datos</li>
                <li>Presentar quejas ante la Superintendencia de Industria y Comercio</li>
                <li>Acceder de forma gratuita a sus datos personales</li>
              </ul>

              <h2>6. Mecanismos para Ejercer los Derechos</h2>
              <p>
                Los titulares pueden ejercer sus derechos mediante solicitud escrita dirigida a la 
                Personería Municipal a través de:
              </p>
              <ul>
                <li>Correo electrónico: contacto@personeriabuga.gov.co</li>
                <li>Correo físico: Calle 7 N° 12-45, Guadalajara de Buga</li>
                <li>Presencialmente en nuestras instalaciones</li>
              </ul>

              <h2>7. Medidas de Seguridad</h2>
              <p>
                La Personería Municipal implementa medidas técnicas, humanas y administrativas para 
                proteger la información personal, incluyendo:
              </p>
              <ul>
                <li>Cifrado de datos sensibles</li>
                <li>Control de acceso a la información</li>
                <li>Capacitación al personal en protección de datos</li>
                <li>Respaldos periódicos de información</li>
                <li>Protocolos de seguridad informática</li>
              </ul>

              <h2>8. Transferencia y Transmisión de Datos</h2>
              <p>
                Los datos personales podrán ser transferidos a otras entidades públicas cuando sea 
                necesario para el cumplimiento de funciones legales, previo cumplimiento de los 
                requisitos establecidos en la normatividad vigente.
              </p>

              <h2>9. Uso de Cookies</h2>
              <p>
                Nuestro sitio web utiliza cookies para mejorar la experiencia del usuario. Puede 
                configurar su navegador para rechazar cookies, aunque esto puede limitar algunas 
                funcionalidades del sitio. Para más información, consulte nuestra{' '}
                <Link href="/politica-cookies" className="text-gov-blue hover:underline">
                  Política de Cookies
                </Link>.
              </p>

              <h2>10. Modificaciones a la Política</h2>
              <p>
                La Personería Municipal se reserva el derecho de modificar esta Política de Privacidad 
                en cualquier momento. Los cambios serán publicados en esta página y, cuando sean 
                significativos, se notificará a los usuarios a través de los canales disponibles.
              </p>

              <h2>11. Contacto</h2>
              <p>
                Para cualquier consulta relacionada con esta Política de Privacidad o el tratamiento 
                de sus datos personales, puede contactarnos a través de:
              </p>
              <ul>
                <li>Teléfono: (602) 2017004</li>
                <li>Correo electrónico: contacto@personeriabuga.gov.co</li>
                <li>Dirección: Calle 7 N° 12-45, Guadalajara de Buga, Valle del Cauca</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/tratamiento-datos"
              className="text-gov-blue hover:underline"
            >
              Ver Política de Tratamiento de Datos Personales completa →
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
