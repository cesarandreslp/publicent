import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Scale,
  FileText,
  Users,
  Shield,
  Search,
  Building,
  Clock,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  FileCheck,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

// Datos de servicios
const servicios = {
  'asesoria-juridica': {
    titulo: 'Asesoría Jurídica Gratuita',
    descripcion:
      'Orientación legal gratuita en temas de derechos humanos, administrativos, civiles, penales y laborales para la ciudadanía.',
    descripcionLarga: `
      La Personería Municipal de Guadalajara de Buga ofrece el servicio de asesoría jurídica 
      gratuita como parte de su compromiso con la defensa y promoción de los derechos de los 
      ciudadanos. Este servicio está dirigido a toda la población del municipio, con especial 
      atención a los sectores más vulnerables.

      Nuestros profesionales del derecho están capacitados para brindar orientación en diversas 
      áreas del derecho, incluyendo pero no limitándose a:
      
      - Derechos fundamentales y constitucionales
      - Derecho administrativo y relaciones con entidades públicas
      - Derecho civil (familia, contratos, bienes)
      - Orientación en procesos penales
      - Derecho laboral básico
      - Derechos del consumidor
    `,
    icono: Scale,
    categoria: 'Atención al Ciudadano',
    tiempo: 'Inmediato',
    costo: 'Gratuito',
    modalidad: ['Presencial', 'Virtual'],
    requisitos: [
      'Documento de identidad vigente',
      'Exposición clara del caso o situación jurídica',
      'Documentos de soporte (si los tiene)',
    ],
    pasos: [
      'Acercarse a las instalaciones de la Personería o solicitar cita',
      'Presentar documento de identidad',
      'Exponer el caso al profesional asignado',
      'Recibir orientación y recomendaciones jurídicas',
    ],
    poblacion: 'Todos los ciudadanos del municipio',
    contacto: {
      telefono: '(602) 2017004',
      direccion: 'Calle 7 N° 12-45, Guadalajara de Buga',
    },
  },
  'tutelas': {
    titulo: 'Interposición de Acciones de Tutela',
    descripcion:
      'Acompañamiento y orientación en la elaboración e interposición de acciones de tutela para la protección de derechos fundamentales.',
    descripcionLarga: `
      La acción de tutela es el mecanismo constitucional de protección inmediata de los 
      derechos fundamentales cuando estos resulten vulnerados o amenazados por la acción 
      u omisión de cualquier autoridad pública o particular.

      La Personería Municipal brinda acompañamiento integral en todo el proceso de 
      interposición de tutelas, desde la identificación del derecho vulnerado hasta 
      el seguimiento al cumplimiento del fallo judicial.

      Este servicio es especialmente importante para garantizar que todos los ciudadanos, 
      independientemente de su condición económica, puedan acceder a la justicia y defender 
      sus derechos fundamentales.
    `,
    icono: Shield,
    categoria: 'Defensa de Derechos',
    tiempo: 'Inmediato',
    costo: 'Gratuito',
    modalidad: ['Presencial'],
    requisitos: [
      'Documento de identidad',
      'Descripción detallada de los hechos vulneratorios',
      'Identificación del derecho fundamental afectado',
      'Pruebas documentales que soporten el caso',
      'Datos de contacto del demandado',
    ],
    pasos: [
      'Acudir a la Personería con la documentación requerida',
      'Recibir asesoría sobre la viabilidad de la tutela',
      'Elaboración conjunta del escrito de tutela',
      'Radicación ante el juez competente',
      'Seguimiento al proceso hasta obtener el fallo',
    ],
    poblacion: 'Todos los ciudadanos cuyos derechos fundamentales estén siendo vulnerados',
    contacto: {
      telefono: '(602) 2017004',
      direccion: 'Calle 7 N° 12-45, Guadalajara de Buga',
    },
  },
  'vigilancia-administrativa': {
    titulo: 'Vigilancia de la Conducta Oficial',
    descripcion:
      'Recepción y trámite de quejas contra servidores públicos municipales por faltas disciplinarias en ejercicio de sus funciones.',
    descripcionLarga: `
      Como parte de sus funciones de control disciplinario, la Personería Municipal recibe 
      y tramita las quejas contra servidores públicos del orden municipal que presuntamente 
      hayan incurrido en faltas disciplinarias en el ejercicio de sus funciones.

      Este servicio permite a los ciudadanos denunciar irregularidades como:
      - Incumplimiento de deberes
      - Extralimitación de funciones
      - Negligencia en el servicio
      - Maltrato a los ciudadanos
      - Corrupción administrativa
      
      La Personería adelanta las investigaciones disciplinarias correspondientes garantizando 
      el debido proceso y los derechos tanto del quejoso como del investigado.
    `,
    icono: Search,
    categoria: 'Control y Vigilancia',
    tiempo: '30 días hábiles para respuesta preliminar',
    costo: 'Gratuito',
    modalidad: ['Presencial', 'Virtual', 'Escrito'],
    requisitos: [
      'Documento de identidad (puede ser anónimo en caso de denuncias)',
      'Queja por escrito con descripción detallada de los hechos',
      'Identificación del servidor público (si se conoce)',
      'Pruebas o indicios de la conducta irregular',
      'Fecha y lugar de los hechos',
    ],
    pasos: [
      'Presentar la queja por cualquier canal habilitado',
      'Recibir número de radicado para seguimiento',
      'Evaluación de procedibilidad por la Personería',
      'Inicio de investigación disciplinaria si hay mérito',
      'Notificación del resultado al quejoso',
    ],
    poblacion: 'Todos los ciudadanos afectados por la conducta de servidores públicos',
    contacto: {
      telefono: '(602) 2017004',
      direccion: 'Calle 7 N° 12-45, Guadalajara de Buga',
    },
  },
  'veedurias': {
    titulo: 'Apoyo a Veedurías Ciudadanas',
    descripcion:
      'Asesoría y acompañamiento para la conformación de veedurías ciudadanas y ejercicio de control social a la gestión pública.',
    descripcionLarga: `
      Las veedurías ciudadanas son un mecanismo democrático de participación que permite 
      a los ciudadanos organizados ejercer vigilancia sobre la gestión pública, la 
      ejecución de programas, proyectos y contratos estatales.

      La Personería Municipal promueve y apoya la conformación de veedurías ciudadanas, 
      brindando:
      - Capacitación sobre el marco legal de las veedurías
      - Asesoría para el registro y formalización
      - Acompañamiento en el ejercicio del control social
      - Herramientas para acceder a información pública
      - Orientación sobre cómo presentar informes y alertas
      
      Este servicio fortalece la democracia participativa y contribuye a una 
      administración pública más transparente y eficiente.
    `,
    icono: Users,
    categoria: 'Participación Ciudadana',
    tiempo: '15 días hábiles para registro',
    costo: 'Gratuito',
    modalidad: ['Presencial'],
    requisitos: [
      'Grupo de mínimo 3 ciudadanos interesados',
      'Documento de identidad de los integrantes',
      'Acta de conformación de la veeduría',
      'Definición clara del objeto de la veeduría',
      'Elección de representante legal',
    ],
    pasos: [
      'Conformar el grupo de ciudadanos interesados',
      'Solicitar capacitación a la Personería',
      'Definir el objeto y alcance de la veeduría',
      'Elaborar acta de constitución',
      'Registrar la veeduría ante la Personería',
      'Iniciar el ejercicio de control social',
    ],
    poblacion: 'Organizaciones civiles y ciudadanos interesados en el control social',
    contacto: {
      telefono: '(602) 2017004',
      direccion: 'Calle 7 N° 12-45, Guadalajara de Buga',
    },
  },
  'pqrsd': {
    titulo: 'Radicación de PQRSD',
    descripcion:
      'Recepción de Peticiones, Quejas, Reclamos, Sugerencias y Denuncias sobre la prestación de servicios públicos y actuación de funcionarios.',
    descripcionLarga: `
      El sistema de Peticiones, Quejas, Reclamos, Sugerencias y Denuncias (PQRSD) es el 
      mecanismo mediante el cual los ciudadanos pueden comunicarse con la Personería 
      Municipal para:

      - PETICIONES: Solicitar información, documentos o actuaciones de la entidad
      - QUEJAS: Manifestar inconformidad por la atención recibida
      - RECLAMOS: Exigir el reconocimiento de un derecho
      - SUGERENCIAS: Proponer mejoras en los servicios
      - DENUNCIAS: Reportar irregularidades en la función pública

      Garantizamos respuesta oportuna según los términos establecidos por la ley, 
      con la debida reserva y confidencialidad cuando el caso lo amerite.
    `,
    icono: FileText,
    categoria: 'Atención al Ciudadano',
    tiempo: '15 días hábiles (peticiones generales)',
    costo: 'Gratuito',
    modalidad: ['Presencial', 'Virtual', 'Telefónico', 'Escrito'],
    requisitos: [
      'Documento de identidad (excepto denuncias anónimas)',
      'Descripción clara de la solicitud o situación',
      'Datos de contacto para notificación',
      'Documentos de soporte (si aplica)',
    ],
    pasos: [
      'Elegir el canal de atención preferido',
      'Diligenciar el formulario o presentar la solicitud',
      'Recibir número de radicado',
      'Esperar la respuesta en los términos de ley',
      'Consultar el estado de la solicitud si lo desea',
    ],
    poblacion: 'Todos los ciudadanos',
    contacto: {
      telefono: '(602) 2017004',
      direccion: 'Calle 7 N° 12-45, Guadalajara de Buga',
    },
  },
  'conciliaciones': {
    titulo: 'Conciliación en Equidad',
    descripcion:
      'Mecanismo alternativo de solución de conflictos para resolver controversias de manera pacífica y evitar procesos judiciales.',
    descripcionLarga: `
      La conciliación en equidad es un mecanismo alternativo de solución de conflictos 
      donde un tercero neutral (conciliador en equidad) ayuda a las partes en conflicto 
      a encontrar una solución justa y equitativa, basada en el sentido común y la 
      equidad natural.

      Este servicio permite resolver de manera pacífica conflictos de:
      - Convivencia vecinal
      - Deudas de menor cuantía
      - Daños a bienes
      - Conflictos familiares (cuando no involucren delitos)
      - Disputas comunitarias

      Las actas de conciliación tienen efectos de cosa juzgada y mérito ejecutivo, 
      lo que significa que son vinculantes y de obligatorio cumplimiento.
    `,
    icono: Building,
    categoria: 'Resolución de Conflictos',
    tiempo: 'Según disponibilidad de agenda',
    costo: 'Gratuito',
    modalidad: ['Presencial'],
    requisitos: [
      'Documento de identidad de todas las partes',
      'Solicitud de conciliación por escrito',
      'Descripción clara del conflicto',
      'Voluntad de las partes para conciliar',
      'Dirección y teléfono de la contraparte',
    ],
    pasos: [
      'Presentar solicitud de conciliación',
      'Citación a las partes involucradas',
      'Audiencia de conciliación con el conciliador',
      'Elaboración del acta de conciliación (si hay acuerdo)',
      'Seguimiento al cumplimiento del acuerdo',
    ],
    poblacion: 'Ciudadanos con conflictos susceptibles de conciliación',
    contacto: {
      telefono: '(602) 2017004',
      direccion: 'Casa de la Justicia - Calle 3 # 17-50',
    },
  },
}

type ServicioId = keyof typeof servicios

const iconMap = {
  Scale,
  FileText,
  Users,
  Shield,
  Search,
  Building,
}

export async function generateStaticParams() {
  return Object.keys(servicios).map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const servicio = servicios[id as ServicioId]

  if (!servicio) {
    return { title: 'Servicio no encontrado' }
  }

  return {
    title: `${servicio.titulo} | Personería Municipal de Guadalajara de Buga`,
    description: servicio.descripcion,
  }
}

export default async function ServicioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const servicio = servicios[id as ServicioId]

  if (!servicio) {
    notFound()
  }

  const IconComponent = servicio.icono

  return (
    <>
      <PageHeader
        title={servicio.titulo}
        description={servicio.descripcion}
        breadcrumbItems={[
          { label: 'Servicios', href: '/servicios' },
          { label: servicio.titulo },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Información general */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gov-blue/10 rounded-lg">
                    <IconComponent className="w-6 h-6 text-gov-blue" />
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {servicio.categoria}
                  </span>
                </div>
                <div className="prose prose-gray max-w-none">
                  {servicio.descripcionLarga.split('\n').map((parrafo, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed">
                      {parrafo.trim()}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar con información rápida */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Información del Servicio</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Tiempo de respuesta</p>
                      <p className="font-medium text-gray-900">{servicio.tiempo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Costo</p>
                      <p className="font-medium text-gov-green">{servicio.costo}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Modalidad</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {servicio.modalidad.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gov-blue/5 rounded-xl border border-gov-blue/20 p-6">
                <h3 className="font-bold text-gray-900 mb-3">¿Necesita este servicio?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contáctenos o radique su solicitud en línea
                </p>
                <div className="space-y-2">
                  <a
                    href={`tel:${servicio.contacto.telefono.replace(/\D/g, '')}`}
                    className="flex items-center gap-2 text-gov-blue hover:underline text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    {servicio.contacto.telefono}
                  </a>
                  <p className="flex items-start gap-2 text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    {servicio.contacto.direccion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requisitos */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <ul className="space-y-3">
                {servicio.requisitos.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gov-green shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Pasos */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">¿Cómo solicitar este servicio?</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="space-y-4">
                {servicio.pasos.map((paso, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gov-blue text-white flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-700">{paso}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Población */}
          <section className="mb-8">
            <div className="bg-gray-50 rounded-xl p-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-gov-blue shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 mb-1">¿A quién va dirigido?</h3>
                <p className="text-gray-600">{servicio.poblacion}</p>
              </div>
            </div>
          </section>

          {/* Navegación */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-8 border-t">
            <Link
              href="/servicios"
              className="flex items-center gap-2 text-gray-600 hover:text-gov-blue transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al catálogo
            </Link>
            <Link
              href="/atencion-ciudadano/pqrsd"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gov-blue text-white rounded-lg font-medium hover:bg-gov-blue-dark transition-colors"
            >
              Solicitar servicio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
