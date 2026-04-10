import { Metadata } from 'next'
import Link from 'next/link'
import {
  Eye,
  Type,
  MousePointer,
  Keyboard,
  Monitor,
  Volume2,
  ZoomIn,
  Contrast,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

export const metadata: Metadata = {
  title: 'Accesibilidad | Personería Municipal de Guadalajara de Buga',
  description:
    'Información sobre las características de accesibilidad del sitio web de la Personería Municipal de Guadalajara de Buga',
}

const caracteristicas = [
  {
    titulo: 'Texto Alternativo',
    descripcion:
      'Todas las imágenes incluyen texto alternativo descriptivo para usuarios que utilizan lectores de pantalla.',
    icono: Eye,
  },
  {
    titulo: 'Tamaño de Texto Ajustable',
    descripcion:
      'Puede aumentar o disminuir el tamaño del texto usando las funciones del navegador o la barra de accesibilidad lateral.',
    icono: Type,
  },
  {
    titulo: 'Navegación por Teclado',
    descripcion:
      'El sitio puede navegarse completamente usando solo el teclado (Tab, Enter, flechas).',
    icono: Keyboard,
  },
  {
    titulo: 'Enlaces Descriptivos',
    descripcion:
      'Los enlaces incluyen textos descriptivos que indican claramente su destino o función.',
    icono: MousePointer,
  },
  {
    titulo: 'Diseño Responsivo',
    descripcion:
      'El sitio se adapta a diferentes tamaños de pantalla y dispositivos.',
    icono: Monitor,
  },
  {
    titulo: 'Contraste Adecuado',
    descripcion:
      'Los colores utilizados cumplen con los estándares de contraste. Puede activar alto contraste desde la barra de accesibilidad.',
    icono: Contrast,
  },
  {
    titulo: 'Lector de Texto',
    descripcion:
      'Puede escuchar el contenido de la página o el texto seleccionado usando el lector incorporado en la barra de accesibilidad.',
    icono: Volume2,
  },
]

const atajosTeclado = [
  { tecla: 'Tab', funcion: 'Navegar entre elementos interactivos' },
  { tecla: 'Shift + Tab', funcion: 'Navegar hacia atrás entre elementos' },
  { tecla: 'Enter', funcion: 'Activar enlaces y botones' },
  { tecla: 'Espacio', funcion: 'Activar botones y casillas de verificación' },
  { tecla: 'Esc', funcion: 'Cerrar ventanas emergentes y menús' },
  { tecla: 'Ctrl + +', funcion: 'Aumentar el tamaño del texto' },
  { tecla: 'Ctrl + -', funcion: 'Disminuir el tamaño del texto' },
  { tecla: 'Ctrl + 0', funcion: 'Restablecer el tamaño del texto' },
]

export default function AccesibilidadPage() {
  return (
    <>
      <PageHeader
        title="Accesibilidad"
        description="Nuestro compromiso con un sitio web accesible para todos"
        breadcrumbItems={[{ label: 'Accesibilidad' }]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Introducción */}
          <section className="mb-12">
            <div className="bg-gov-blue/5 rounded-xl p-8 border border-gov-blue/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Compromiso con la Accesibilidad
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                La Personería Municipal de Guadalajara de Buga está comprometida con garantizar 
                que su sitio web sea accesible para todas las personas, independientemente de sus 
                capacidades o el tipo de tecnología que utilicen para navegar. Trabajamos 
                continuamente para cumplir con las Pautas de Accesibilidad para el Contenido Web 
                (WCAG) 2.1 nivel AA y la normativa colombiana sobre accesibilidad web.
              </p>
              <div className="bg-white/50 rounded-lg p-4 border border-gov-blue/10">
                <p className="text-sm text-gov-blue font-medium mb-2">
                  💡 Barra de Accesibilidad
                </p>
                <p className="text-gray-600 text-sm">
                  En el lado izquierdo de la pantalla encontrará nuestra <strong>barra de 
                  accesibilidad</strong>, donde puede ajustar el tamaño del texto, activar 
                  alto contraste, escala de grises, resaltar enlaces, y usar el <strong>lector 
                  de texto</strong> para escuchar el contenido de la página.
                </p>
              </div>
            </div>
          </section>

          {/* Características de accesibilidad */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Características de Accesibilidad
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {caracteristicas.map((item) => (
                <div
                  key={item.titulo}
                  className="bg-white rounded-xl shadow-sm border p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gov-blue/10 rounded-lg">
                      <item.icono className="w-6 h-6 text-gov-blue" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{item.titulo}</h3>
                      <p className="text-gray-600 text-sm">{item.descripcion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Atajos de teclado */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Atajos de Teclado
            </h2>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Tecla
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Función
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {atajosTeclado.map((atajo) => (
                    <tr key={atajo.tecla} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <kbd className="px-2 py-1 bg-gray-100 text-gray-800 text-sm font-mono rounded">
                          {atajo.tecla}
                        </kbd>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{atajo.funcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tecnologías asistivas */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Tecnologías Asistivas Compatibles
            </h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <p className="text-gray-600 mb-4">
                Nuestro sitio web ha sido diseñado para ser compatible con las siguientes 
                tecnologías asistivas:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gov-blue" />
                  Lectores de pantalla (NVDA, JAWS, VoiceOver)
                </li>
                <li className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-gov-blue" />
                  Software de magnificación de pantalla
                </li>
                <li className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-gov-blue" />
                  Navegación solo por teclado
                </li>
                <li className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-gov-blue" />
                  Dispositivos de entrada alternativos
                </li>
              </ul>
            </div>
          </section>

          {/* Normativa */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Marco Normativo
            </h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <p className="text-gray-600 mb-4">
                Cumplimos con la siguiente normativa relacionada con accesibilidad web:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Ley 1618 de 2013:</strong> Por medio de la cual se establecen las 
                  disposiciones para garantizar el pleno ejercicio de los derechos de las 
                  personas con discapacidad.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>Resolución 1519 de 2020:</strong> Que establece los lineamientos 
                  para la publicación de información en sitios web de entidades del Estado.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>NTC 5854:</strong> Norma Técnica Colombiana sobre accesibilidad 
                  en páginas web.
                </li>
                <li className="pl-4 border-l-2 border-gov-blue">
                  <strong>WCAG 2.1:</strong> Pautas de Accesibilidad para el Contenido Web 
                  del W3C.
                </li>
              </ul>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <div className="bg-linear-to-r from-gov-blue to-gov-blue-dark rounded-xl p-8 text-white">
              <div className="flex items-start gap-4">
                <HelpCircle className="w-8 h-8 shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-3">
                    ¿Tiene problemas de accesibilidad?
                  </h2>
                  <p className="text-white/90 mb-6">
                    Si encuentra barreras de accesibilidad en nuestro sitio web o tiene 
                    sugerencias para mejorarlo, por favor contáctenos. Estamos comprometidos 
                    con hacer nuestro sitio accesible para todos.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/atencion-ciudadano/pqrsd"
                      className="px-6 py-3 bg-white text-gov-blue rounded-lg font-medium hover:bg-gray-100 transition-colors text-center"
                    >
                      Reportar problema de accesibilidad
                    </Link>
                    <Link
                      href="/atencion-ciudadano/canales-atencion"
                      className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors text-center"
                    >
                      Otros canales de contacto
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
