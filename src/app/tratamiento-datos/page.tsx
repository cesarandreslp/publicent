import { Metadata } from 'next'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Tratamiento de Datos Personales | Personería Municipal de Guadalajara de Buga',
  description:
    'Política de tratamiento de datos personales de la Personería Municipal de Guadalajara de Buga según la Ley 1581 de 2012',
}

export default function TratamientoDatosPage() {
  return (
    <>
      <PageHeader
        title="Política de Tratamiento de Datos Personales"
        description="Documento oficial según la Ley 1581 de 2012"
        breadcrumbItems={[{ label: 'Tratamiento de Datos' }]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Botón de descarga */}
          <div className="bg-gov-blue/5 border border-gov-blue/20 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-gray-900">Descargar documento completo</h2>
              <p className="text-gray-600 text-sm">
                Política de Tratamiento de Datos Personales en formato PDF
              </p>
            </div>
            <button className="px-6 py-3 bg-gov-blue text-white rounded-lg font-medium hover:bg-gov-blue-dark transition-colors flex items-center gap-2 whitespace-nowrap">
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-500 text-sm">
                Última actualización: Enero 2026 | Versión 2.0
              </p>

              <h2>CAPÍTULO I. DISPOSICIONES GENERALES</h2>

              <h3>Artículo 1. Objeto</h3>
              <p>
                La presente Política de Tratamiento de Datos Personales tiene como objeto establecer 
                los criterios para la recolección, almacenamiento, uso, circulación y supresión de 
                los datos personales tratados por la Personería Municipal de Guadalajara de Buga, 
                en cumplimiento de las disposiciones contenidas en la Ley Estatutaria 1581 de 2012, 
                el Decreto Reglamentario 1377 de 2013 y demás normas concordantes.
              </p>

              <h3>Artículo 2. Ámbito de Aplicación</h3>
              <p>
                Esta política aplica a todas las bases de datos y/o archivos que contengan datos 
                personales que sean objeto de tratamiento por parte de la Personería Municipal de 
                Guadalajara de Buga, ya sea como responsable y/o encargado del tratamiento.
              </p>

              <h3>Artículo 3. Definiciones</h3>
              <ul>
                <li><strong>Autorización:</strong> Consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento de datos personales.</li>
                <li><strong>Base de datos:</strong> Conjunto organizado de datos personales que sea objeto de tratamiento.</li>
                <li><strong>Dato personal:</strong> Cualquier información vinculada o que pueda asociarse a una o varias personas naturales determinadas o determinables.</li>
                <li><strong>Dato público:</strong> Dato que no sea semiprivado, privado o sensible.</li>
                <li><strong>Dato sensible:</strong> Dato que afecta la intimidad del titular o cuyo uso indebido puede generar discriminación.</li>
                <li><strong>Encargado del tratamiento:</strong> Persona natural o jurídica que realiza el tratamiento de datos por cuenta del responsable.</li>
                <li><strong>Responsable del tratamiento:</strong> Persona natural o jurídica que decide sobre la base de datos y/o el tratamiento de los datos.</li>
                <li><strong>Titular:</strong> Persona natural cuyos datos personales sean objeto de tratamiento.</li>
                <li><strong>Tratamiento:</strong> Cualquier operación sobre datos personales como recolección, almacenamiento, uso, circulación o supresión.</li>
              </ul>

              <h2>CAPÍTULO II. PRINCIPIOS RECTORES</h2>

              <h3>Artículo 4. Principios</h3>
              <p>
                El tratamiento de datos personales por parte de la Personería Municipal se regirá 
                por los siguientes principios:
              </p>
              <ul>
                <li><strong>Legalidad:</strong> El tratamiento es una actividad reglada que debe sujetarse a la ley.</li>
                <li><strong>Finalidad:</strong> El tratamiento debe obedecer a una finalidad legítima que debe ser informada al titular.</li>
                <li><strong>Libertad:</strong> El tratamiento solo puede ejercerse con el consentimiento previo, expreso e informado del titular.</li>
                <li><strong>Veracidad:</strong> La información sujeta a tratamiento debe ser veraz, completa, exacta y actualizada.</li>
                <li><strong>Transparencia:</strong> Debe garantizarse el derecho del titular a obtener información sobre sus datos.</li>
                <li><strong>Acceso y circulación restringida:</strong> El tratamiento se sujeta a los límites de la ley y solo podrán acceder personas autorizadas.</li>
                <li><strong>Seguridad:</strong> La información debe manejarse con medidas técnicas, humanas y administrativas para evitar adulteración, pérdida, consulta o uso no autorizado.</li>
                <li><strong>Confidencialidad:</strong> Todas las personas que intervengan en el tratamiento están obligadas a garantizar la reserva de la información.</li>
              </ul>

              <h2>CAPÍTULO III. AUTORIZACIÓN Y CONSENTIMIENTO</h2>

              <h3>Artículo 5. Autorización del Titular</h3>
              <p>
                La recolección, almacenamiento, uso, circulación o supresión de datos personales 
                requiere del consentimiento libre, previo, expreso e informado del titular. La 
                Personería Municipal implementará mecanismos para obtener la autorización de los 
                titulares, que pueden ser:
              </p>
              <ul>
                <li>Formato físico de autorización</li>
                <li>Formato electrónico de autorización</li>
                <li>Autorización mediante conducta inequívoca</li>
              </ul>

              <h3>Artículo 6. Casos en que no se requiere Autorización</h3>
              <p>No se requiere autorización del titular en los siguientes casos:</p>
              <ul>
                <li>Información requerida por entidad pública en ejercicio de sus funciones legales</li>
                <li>Datos de naturaleza pública</li>
                <li>Casos de urgencia médica o sanitaria</li>
                <li>Tratamiento de información autorizado por la ley para fines históricos, estadísticos o científicos</li>
                <li>Datos relacionados con el Registro Civil de las Personas</li>
              </ul>

              <h2>CAPÍTULO IV. DERECHOS DE LOS TITULARES</h2>

              <h3>Artículo 7. Derechos de los Titulares</h3>
              <p>Los titulares de datos personales tienen los siguientes derechos:</p>
              <ul>
                <li>Conocer, actualizar y rectificar sus datos personales</li>
                <li>Solicitar prueba de la autorización otorgada</li>
                <li>Ser informado respecto del uso que se ha dado a sus datos</li>
                <li>Presentar quejas ante la Superintendencia de Industria y Comercio</li>
                <li>Revocar la autorización y/o solicitar la supresión del dato</li>
                <li>Acceder en forma gratuita a sus datos personales</li>
              </ul>

              <h2>CAPÍTULO V. DEBERES DE LA PERSONERÍA MUNICIPAL</h2>

              <h3>Artículo 8. Deberes como Responsable del Tratamiento</h3>
              <p>La Personería Municipal tiene los siguientes deberes:</p>
              <ul>
                <li>Garantizar el ejercicio del derecho de habeas data</li>
                <li>Solicitar y conservar copia de la autorización otorgada</li>
                <li>Informar debidamente al titular sobre la finalidad del tratamiento</li>
                <li>Conservar la información bajo condiciones de seguridad</li>
                <li>Garantizar que la información sea veraz, completa y actualizada</li>
                <li>Actualizar la información cuando sea necesario</li>
                <li>Rectificar la información cuando sea incorrecta</li>
                <li>Suministrar al encargado solo datos autorizados para su tratamiento</li>
                <li>Tramitar consultas y reclamos en los términos de ley</li>
                <li>Informar a la Superintendencia cuando se presenten violaciones a los códigos de seguridad</li>
              </ul>

              <h2>CAPÍTULO VI. PROCEDIMIENTOS</h2>

              <h3>Artículo 9. Procedimiento para Consultas</h3>
              <p>
                Los titulares podrán consultar la información personal que repose en cualquier base 
                de datos de la Personería. La consulta será atendida en un término máximo de diez 
                (10) días hábiles contados a partir de la fecha de recibo de la solicitud.
              </p>

              <h3>Artículo 10. Procedimiento para Reclamos</h3>
              <p>
                Los titulares que consideren que la información contenida en una base de datos debe 
                ser objeto de corrección, actualización o supresión, o cuando adviertan el presunto 
                incumplimiento de cualquiera de los deberes, podrán presentar un reclamo que será 
                tramitado en un término máximo de quince (15) días hábiles.
              </p>

              <h2>CAPÍTULO VII. SEGURIDAD DE LA INFORMACIÓN</h2>

              <h3>Artículo 11. Medidas de Seguridad</h3>
              <p>
                La Personería Municipal implementa medidas de seguridad técnicas, humanas y 
                administrativas que sean necesarias para otorgar seguridad a los registros, 
                evitando su adulteración, pérdida, consulta, uso o acceso no autorizado o fraudulento.
              </p>

              <h2>CAPÍTULO VIII. VIGENCIA</h2>

              <h3>Artículo 12. Vigencia</h3>
              <p>
                La presente Política rige a partir de su publicación y estará vigente mientras la 
                Personería Municipal de Guadalajara de Buga realice tratamiento de datos personales 
                y los datos reposen en sus bases de datos.
              </p>

              <hr />

              <p className="text-sm text-gray-500">
                Para el ejercicio de sus derechos o consultas adicionales, comuníquese con:<br />
                <strong>Personería Municipal de Guadalajara de Buga</strong><br />
                Calle 7 N° 12-45, Guadalajara de Buga, Valle del Cauca<br />
                Teléfono: (602) 2017004<br />
                Correo: contacto@personeriabuga.gov.co
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/privacidad"
              className="text-gov-blue hover:underline"
            >
              ← Ver Política de Privacidad resumida
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
