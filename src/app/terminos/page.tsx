import { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Personería Municipal de Guadalajara de Buga',
  description:
    'Términos y condiciones de uso del sitio web de la Personería Municipal de Guadalajara de Buga',
}

export default function TerminosPage() {
  return (
    <>
      <PageHeader
        title="Términos y Condiciones de Uso"
        description="Condiciones que rigen el uso de nuestro sitio web"
        breadcrumbItems={[{ label: 'Términos y Condiciones' }]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-500 text-sm">
                Última actualización: Enero 2026
              </p>

              <h2>1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar el sitio web de la Personería Municipal de Guadalajara de Buga, 
                usted acepta estar sujeto a estos Términos y Condiciones de Uso, todas las leyes y 
                regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes 
                locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene 
                prohibido usar o acceder a este sitio.
              </p>

              <h2>2. Uso del Sitio Web</h2>
              <p>
                Este sitio web es proporcionado por la Personería Municipal de Guadalajara de Buga 
                como un servicio público para facilitar el acceso a información institucional y la 
                realización de trámites en línea.
              </p>
              <p>El usuario se compromete a:</p>
              <ul>
                <li>Utilizar el sitio de manera legal y apropiada</li>
                <li>No interferir con el funcionamiento del sitio</li>
                <li>No intentar acceder a áreas restringidas sin autorización</li>
                <li>Proporcionar información veraz y actualizada</li>
                <li>No realizar actividades que puedan dañar la imagen de la entidad</li>
              </ul>

              <h2>3. Propiedad Intelectual</h2>
              <p>
                Los contenidos de este sitio web, incluyendo textos, gráficos, logotipos, imágenes, 
                documentos y software, son propiedad de la Personería Municipal de Guadalajara de 
                Buga o de terceros que han autorizado su uso, y están protegidos por las leyes de 
                propiedad intelectual.
              </p>
              <p>
                Se permite la reproducción total o parcial de los contenidos, siempre que se cite 
                la fuente y se utilice para fines no comerciales, de acuerdo con lo establecido en 
                la Ley 1712 de 2014 sobre transparencia y acceso a la información pública.
              </p>

              <h2>4. Servicios en Línea</h2>
              <p>
                El sitio web ofrece diversos servicios en línea, incluyendo:
              </p>
              <ul>
                <li>Radicación de PQRSD (Peticiones, Quejas, Reclamos, Sugerencias y Denuncias)</li>
                <li>Consulta de trámites</li>
                <li>Descarga de documentos públicos</li>
                <li>Acceso a información institucional</li>
              </ul>
              <p>
                La disponibilidad de estos servicios está sujeta al mantenimiento y operación de 
                los sistemas informáticos de la entidad.
              </p>

              <h2>5. Responsabilidad sobre la Información</h2>
              <p>
                La Personería Municipal se esfuerza por mantener la información del sitio web 
                actualizada y precisa. Sin embargo:
              </p>
              <ul>
                <li>No garantizamos que toda la información esté libre de errores</li>
                <li>La información puede ser modificada sin previo aviso</li>
                <li>Los documentos oficiales prevalecen sobre la información publicada en línea</li>
              </ul>

              <h2>6. Enlaces a Terceros</h2>
              <p>
                Este sitio puede contener enlaces a sitios web de terceros. Estos enlaces se 
                proporcionan únicamente para conveniencia del usuario. La Personería Municipal 
                no tiene control sobre el contenido de dichos sitios y no asume responsabilidad 
                por ellos.
              </p>

              <h2>7. Protección de Datos</h2>
              <p>
                El tratamiento de datos personales se rige por nuestra{' '}
                <Link href="/privacidad" className="text-gov-blue hover:underline">
                  Política de Privacidad
                </Link>{' '}
                y la{' '}
                <Link href="/tratamiento-datos" className="text-gov-blue hover:underline">
                  Política de Tratamiento de Datos Personales
                </Link>
                , en cumplimiento de la Ley 1581 de 2012.
              </p>

              <h2>8. Disponibilidad del Servicio</h2>
              <p>
                La Personería Municipal no garantiza la disponibilidad continua e ininterrumpida 
                del sitio web. El servicio puede verse interrumpido por:
              </p>
              <ul>
                <li>Mantenimiento programado o de emergencia</li>
                <li>Fallas técnicas o de conectividad</li>
                <li>Causas de fuerza mayor</li>
                <li>Actualizaciones del sistema</li>
              </ul>

              <h2>9. Limitación de Responsabilidad</h2>
              <p>
                La Personería Municipal de Guadalajara de Buga no será responsable por:
              </p>
              <ul>
                <li>Daños derivados del uso o imposibilidad de uso del sitio</li>
                <li>Errores u omisiones en el contenido</li>
                <li>Virus informáticos que puedan afectar los equipos del usuario</li>
                <li>Interrupciones en el servicio por causas ajenas a la entidad</li>
              </ul>

              <h2>10. Legislación Aplicable</h2>
              <p>
                Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. 
                Cualquier controversia será sometida a los tribunales competentes de Colombia.
              </p>

              <h2>11. Modificaciones</h2>
              <p>
                La Personería Municipal se reserva el derecho de modificar estos Términos y 
                Condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente 
                después de su publicación en el sitio web. El uso continuado del sitio después 
                de dichas modificaciones constituye su aceptación de los nuevos términos.
              </p>

              <h2>12. Contacto</h2>
              <p>
                Para consultas sobre estos Términos y Condiciones, contáctenos a través de:
              </p>
              <ul>
                <li>Teléfono: (602) 2017004</li>
                <li>Correo electrónico: contacto@personeriabuga.gov.co</li>
                <li>Dirección: Calle 7 N° 12-45, Guadalajara de Buga, Valle del Cauca</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
