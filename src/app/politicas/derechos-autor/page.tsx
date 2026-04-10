import { Metadata } from 'next'
import Link from 'next/link'
import { Copyright, ExternalLink, FileText, Scale } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Política de Derechos de Autor | Personería Municipal de Guadalajara de Buga',
  description:
    'Política de derechos de autor y propiedad intelectual del sitio web de la Personería Municipal de Guadalajara de Buga.',
}

export default function DerechosAutorPage() {
  return (
    <>
      <PageHeader
        title="Política de Derechos de Autor"
        description="Condiciones de uso y propiedad intelectual del contenido publicado"
        breadcrumbItems={[
          { label: 'Políticas', href: '/politicas' },
          { label: 'Derechos de Autor' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Introducción */}
          <section>
            <div className="bg-gov-blue/5 rounded-xl p-8 border border-gov-blue/20">
              <div className="flex items-start gap-4">
                <Copyright className="w-8 h-8 text-gov-blue shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Propiedad Intelectual
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Todo el contenido publicado en el sitio web de la Personería Municipal de
                    Guadalajara de Buga —incluyendo textos, documentos, imágenes, logotipos,
                    diseños gráficos, videos y demás material— está protegido por las leyes
                    colombianas de derechos de autor (Ley 23 de 1982 y Ley 1915 de 2018) y por
                    los tratados internacionales suscritos por Colombia en esta materia.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Uso permitido */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gov-blue" />
              Uso Permitido del Contenido
            </h2>
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <p className="text-gray-600">
                De conformidad con la Ley 1712 de 2014 (Ley de Transparencia y del Derecho de
                Acceso a la Información Pública Nacional), la información publicada en este
                sitio web es de carácter público y puede ser consultada, descargada y utilizada
                bajo las siguientes condiciones:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Uso informativo y educativo:</strong> Se permite la reproducción
                  parcial o total del contenido siempre que se cite la fuente y se incluya un
                  enlace al sitio web de la entidad.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Documentos públicos:</strong> Los actos administrativos, resoluciones,
                  normativa y demás documentos oficiales pueden ser descargados y compartidos
                  libremente.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Uso no comercial:</strong> El contenido no puede ser utilizado con
                  fines comerciales sin autorización previa y por escrito de la entidad.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Integridad del contenido:</strong> No se permite la modificación,
                  distorsión o alteración del contenido de modo que pueda inducir a error o
                  confusión sobre su origen o significado.
                </li>
              </ul>
            </div>
          </section>

          {/* Restricciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-gov-blue" />
              Restricciones
            </h2>
            <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
              <p className="text-gray-600">Queda expresamente prohibido:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>
                  Utilizar el escudo, logo o identidad visual de la Personería Municipal para
                  fines distintos a los institucionales sin autorización.
                </li>
                <li>
                  Reproducir el contenido dando a entender que proviene de una fuente distinta
                  a la Personería Municipal de Guadalajara de Buga.
                </li>
                <li>
                  Utilizar herramientas automatizadas para la extracción masiva de contenido
                  (scraping) sin autorización.
                </li>
                <li>
                  Utilizar la identidad visual GOV.CO fuera de los lineamientos establecidos
                  por el Ministerio de Tecnologías de la Información y las Comunicaciones.
                </li>
              </ul>
            </div>
          </section>

          {/* Marco normativo */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Marco Normativo</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <ul className="space-y-3 text-gray-600">
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Ley 23 de 1982:</strong> Sobre derechos de autor en Colombia.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Ley 1915 de 2018:</strong> Que modifica la Ley 23 de 1982 y
                  establece disposiciones en materia de derecho de autor y derechos conexos.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Ley 1712 de 2014:</strong> Ley de Transparencia y del Derecho de
                  Acceso a la Información Pública Nacional.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Decisión Andina 351 de 1993:</strong> Régimen Común sobre Derecho de
                  Autor y Derechos Conexos.
                </li>
              </ul>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <div className="bg-linear-to-r from-gov-blue to-gov-blue-dark rounded-xl p-8 text-white">
              <h2 className="text-xl font-bold mb-3">¿Necesita autorización de uso?</h2>
              <p className="text-white/90 mb-6">
                Si desea utilizar contenido de este sitio web con fines no contemplados en
                esta política, por favor comuníquese con la entidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/atencion-ciudadano/contacto"
                  className="px-6 py-3 bg-white text-gov-blue rounded-lg font-medium hover:bg-gray-100 transition-colors text-center"
                >
                  Contactar a la Entidad
                </Link>
                <Link
                  href="/atencion-ciudadano/pqrsd"
                  className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors text-center"
                >
                  Radicar solicitud formal
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
