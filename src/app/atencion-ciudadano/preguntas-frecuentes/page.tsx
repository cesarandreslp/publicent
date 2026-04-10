'use client'

import { useState } from 'react'
import { ChevronDown, Search, HelpCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

const categorias = [
  { id: 'todas', label: 'Todas las categorías' },
  { id: 'pqrsd', label: 'PQRSD' },
  { id: 'tramites', label: 'Trámites' },
  { id: 'derechos', label: 'Derechos Humanos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'general', label: 'General' },
]

const preguntas = [
  {
    id: 1,
    categoria: 'pqrsd',
    pregunta: '¿Qué es una PQRSD?',
    respuesta: 'PQRSD significa Peticiones, Quejas, Reclamos, Sugerencias y Denuncias. Es el mecanismo mediante el cual los ciudadanos pueden comunicarse con la Personería Municipal para solicitar información, manifestar inconformidades, realizar reclamos, proponer mejoras o reportar irregularidades en la función pública.',
  },
  {
    id: 2,
    categoria: 'pqrsd',
    pregunta: '¿Cuánto tiempo tiene la entidad para responder una petición?',
    respuesta: 'De acuerdo con la Ley 1755 de 2015, las peticiones de interés general o particular deben responderse en un término máximo de 15 días hábiles. Las consultas tienen un término de 30 días hábiles, y las peticiones de documentos públicos 10 días hábiles. Si no es posible responder en estos términos, la entidad debe informar al ciudadano los motivos y el plazo en que se dará respuesta.',
  },
  {
    id: 3,
    categoria: 'pqrsd',
    pregunta: '¿Puedo radicar una PQRSD de forma anónima?',
    respuesta: 'Sí, las denuncias pueden presentarse de forma anónima. Sin embargo, para las peticiones, quejas, reclamos y sugerencias es necesario identificarse para poder recibir una respuesta. La información personal de los denunciantes está protegida por la ley y se maneja con absoluta confidencialidad.',
  },
  {
    id: 4,
    categoria: 'pqrsd',
    pregunta: '¿Cómo puedo consultar el estado de mi PQRSD?',
    respuesta: 'Puede consultar el estado de su solicitud ingresando a la sección de "Consulta PQRSD" en nuestro sitio web e ingresando el número de radicado que le fue asignado al momento de presentar su solicitud. También puede comunicarse telefónicamente al (602) 2017004.',
  },
  {
    id: 5,
    categoria: 'tramites',
    pregunta: '¿Qué documentos necesito para solicitar una certificación?',
    respuesta: 'Para solicitar certificaciones ante la Personería Municipal, generalmente requiere: copia de su documento de identidad, solicitud por escrito indicando el tipo de certificación requerida y el uso que le dará. Los requisitos específicos pueden variar según el tipo de certificación solicitada.',
  },
  {
    id: 6,
    categoria: 'tramites',
    pregunta: '¿Cuál es el horario de atención al público?',
    respuesta: 'El horario de atención al público es de lunes a viernes de 8:00 a.m. a 12:00 m. y de 2:00 p.m. a 6:00 p.m. en la sede principal ubicada en la Calle 7 N° 12-45 de Guadalajara de Buga. También puede comunicarse telefónicamente en este horario.',
  },
  {
    id: 7,
    categoria: 'derechos',
    pregunta: '¿Qué hacer si me vulneran mis derechos fundamentales?',
    respuesta: 'Si considera que le están vulnerando sus derechos fundamentales, puede acudir a la Personería Municipal para recibir orientación y asesoría jurídica gratuita. Podemos ayudarle a interponer una acción de tutela o los mecanismos legales pertinentes para la protección de sus derechos.',
  },
  {
    id: 8,
    categoria: 'derechos',
    pregunta: '¿La Personería puede representarme en un proceso judicial?',
    respuesta: 'La Personería Municipal no representa a ciudadanos en procesos judiciales particulares. Sin embargo, brindamos orientación jurídica gratuita, podemos intervenir ante autoridades para la defensa de los derechos colectivos, y canalizamos los casos a las entidades competentes cuando sea necesario.',
  },
  {
    id: 9,
    categoria: 'servicios',
    pregunta: '¿Qué servicios gratuitos ofrece la Personería?',
    respuesta: 'La Personería Municipal ofrece servicios gratuitos como: orientación jurídica y asesoría legal, recepción de denuncias y quejas contra funcionarios públicos, vigilancia de la conducta oficial, defensa de derechos humanos, veeduría a la contratación pública, y apoyo a población vulnerable.',
  },
  {
    id: 10,
    categoria: 'servicios',
    pregunta: '¿Qué es la Casa de la Justicia y qué servicios ofrece?',
    respuesta: 'La Casa de la Justicia es un centro multiagencial donde diferentes entidades ofrecen servicios de acceso a la justicia de manera gratuita. Allí encuentra servicios de la Personería, Fiscalía, ICBF, Defensoría del Pueblo, Comisaría de Familia, entre otros. Está ubicada en la Calle 3 # 17-50 con atención de lunes a viernes.',
  },
  {
    id: 11,
    categoria: 'general',
    pregunta: '¿Cuáles son las funciones principales del Personero Municipal?',
    respuesta: 'El Personero Municipal es el representante del Ministerio Público a nivel municipal. Sus funciones principales incluyen: velar por el cumplimiento de la Constitución y las leyes, vigilar la conducta de los servidores públicos, defender los derechos humanos, recibir quejas contra funcionarios públicos, y ejercer veeduría ciudadana sobre la gestión municipal.',
  },
  {
    id: 12,
    categoria: 'general',
    pregunta: '¿Cómo puedo hacer veeduría ciudadana?',
    respuesta: 'La veeduría ciudadana es un mecanismo de participación que permite a los ciudadanos vigilar la gestión pública. Puede conformar una veeduría registrándose ante la Personería Municipal. Le brindamos capacitación, acompañamiento y las herramientas necesarias para ejercer control ciudadano sobre la administración pública.',
  },
]

export default function PreguntasFrecuentesPage() {
  const [categoriaActiva, setCategoriaActiva] = useState('todas')
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const preguntasFiltradas = preguntas.filter((p) => {
    const matchCategoria = categoriaActiva === 'todas' || p.categoria === categoriaActiva
    const matchBusqueda = 
      p.pregunta.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.respuesta.toLowerCase().includes(busqueda.toLowerCase())
    return matchCategoria && matchBusqueda
  })

  return (
    <>
      <PageHeader
        title="Preguntas Frecuentes"
        description="Encuentre respuestas a las dudas más comunes sobre nuestros servicios"
        breadcrumbItems={[
          { label: 'Atención al Ciudadano', href: '/atencion-ciudadano' },
          { label: 'Preguntas Frecuentes' },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Buscador */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en las preguntas frecuentes..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-gov-blue"
              />
            </div>
          </div>

          {/* Filtro por categoría */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoriaActiva === cat.id
                    ? 'bg-gov-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Lista de preguntas */}
          <div className="space-y-4">
            {preguntasFiltradas.length > 0 ? (
              preguntasFiltradas.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border overflow-hidden"
                >
                  <button
                    onClick={() => setPreguntaAbierta(preguntaAbierta === item.id ? null : item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">{item.pregunta}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                        preguntaAbierta === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {preguntaAbierta === item.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{item.respuesta}</p>
                      <span className="inline-block mt-3 px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        {categorias.find((c) => c.id === item.categoria)?.label}
                      </span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-600">
                  No hay preguntas que coincidan con su búsqueda. Intente con otros términos o{' '}
                  <button
                    onClick={() => {
                      setBusqueda('')
                      setCategoriaActiva('todas')
                    }}
                    className="text-gov-blue hover:underline"
                  >
                    ver todas las preguntas
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* CTA para contacto */}
          <div className="mt-12 bg-linear-to-r from-gov-blue to-gov-blue-dark rounded-xl p-8 text-center text-white">
            <h3 className="text-xl font-bold mb-2">¿No encontró la respuesta que buscaba?</h3>
            <p className="text-white/80 mb-6">
              Contáctenos y con gusto resolveremos todas sus dudas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/atencion-ciudadano/pqrsd"
                className="px-6 py-3 bg-white text-gov-blue rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Radicar PQRSD
              </a>
              <a
                href="/atencion-ciudadano/canales-atencion"
                className="px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Ver canales de atención
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
