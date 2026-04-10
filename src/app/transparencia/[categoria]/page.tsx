import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  Building2, 
  Scale, 
  FileSignature, 
  BarChart3, 
  ClipboardList, 
  Users, 
  Database,
  UserCheck,
  FileOutput,
  Receipt,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { SidebarMenu } from '@/components/shared/sidebar-menu'

// Definición de categorías según Resolución 1519 de 2020
const categorias: Record<string, {
  numero: number
  nombre: string
  descripcion: string
  icono: any
  subcategorias: Array<{
    codigo: string
    nombre: string
    descripcion: string
    enlace?: string
  }>
}> = {
  'informacion-entidad': {
    numero: 1,
    nombre: 'Información de la Entidad',
    descripcion: 'Mecanismos de contacto, información de interés, estructura orgánica y talento humano',
    icono: Building2,
    subcategorias: [
      { codigo: '1.1', nombre: 'Mecanismos de contacto', descripcion: 'Datos de localización, horarios y canales de atención', enlace: '/contactenos' },
      { codigo: '1.2', nombre: 'Información de interés', descripcion: 'Noticias, calendario, FAQ, glosario', enlace: '/noticias' },
      { codigo: '1.3', nombre: 'Estructura orgánica y talento humano', descripcion: 'Organigrama, directorio de funcionarios, ofertas de empleo', enlace: '/entidad/organigrama' },
    ],
  },
  'normativa': {
    numero: 2,
    nombre: 'Normativa',
    descripcion: 'Normatividad que rige a la entidad y normatividad aplicable',
    icono: Scale,
    subcategorias: [
      { codigo: '2.1', nombre: 'Normativa de la entidad', descripcion: 'Leyes, decretos, resoluciones y acuerdos que aplican a la entidad' },
      { codigo: '2.2', nombre: 'Búsqueda de normas', descripcion: 'Herramienta de búsqueda en el normograma institucional' },
      { codigo: '2.3', nombre: 'Proyectos de normas para comentarios', descripcion: 'Propuestas normativas en consulta pública' },
    ],
  },
  'contratacion': {
    numero: 3,
    nombre: 'Contratación',
    descripcion: 'Plan anual de adquisiciones, información contractual y ejecución de contratos',
    icono: FileSignature,
    subcategorias: [
      { codigo: '3.1', nombre: 'Plan anual de adquisiciones', descripcion: 'Programación de compras y contrataciones del año' },
      { codigo: '3.2', nombre: 'Publicación de la información contractual', descripcion: 'Procesos de contratación publicados en SECOP' },
      { codigo: '3.3', nombre: 'Publicación de la ejecución de contratos', descripcion: 'Estado de ejecución de contratos vigentes' },
      { codigo: '3.4', nombre: 'Manual de contratación y supervisión', descripcion: 'Procedimientos internos de contratación' },
      { codigo: '3.5', nombre: 'Formatos y modelos de contratos', descripcion: 'Plantillas y formatos para contratación' },
    ],
  },
  'planeacion': {
    numero: 4,
    nombre: 'Planeación, Presupuesto e Informes',
    descripcion: 'Presupuesto general, ejecución presupuestal, plan de acción e informes de gestión',
    icono: BarChart3,
    subcategorias: [
      { codigo: '4.1', nombre: 'Presupuesto general', descripcion: 'Presupuesto aprobado para la vigencia' },
      { codigo: '4.2', nombre: 'Ejecución presupuestal', descripcion: 'Informes de ejecución presupuestal histórica' },
      { codigo: '4.3', nombre: 'Plan de acción', descripcion: 'Metas y actividades programadas' },
      { codigo: '4.4', nombre: 'Proyectos de inversión', descripcion: 'Proyectos en ejecución y sus avances' },
      { codigo: '4.5', nombre: 'Informes de empalme', descripcion: 'Informes de gestión para cambio de administración' },
      { codigo: '4.6', nombre: 'Informes de gestión, evaluación y auditoría', descripcion: 'Reportes de control interno y auditoría' },
      { codigo: '4.7', nombre: 'Informes de rendición de cuentas', descripcion: 'Audiencias públicas y reportes a la ciudadanía' },
      { codigo: '4.8', nombre: 'Planes de mejoramiento', descripcion: 'Acciones correctivas y de mejora' },
    ],
  },
  'tramites': {
    numero: 5,
    nombre: 'Trámites y Servicios',
    descripcion: 'Trámites que se pueden adelantar ante la entidad',
    icono: ClipboardList,
    subcategorias: [
      { codigo: '5.1', nombre: 'Trámites', descripcion: 'Listado de trámites disponibles', enlace: '/servicios' },
      { codigo: '5.2', nombre: 'Otros procedimientos administrativos', descripcion: 'Procedimientos no clasificados como trámites' },
    ],
  },
  'participa': {
    numero: 6,
    nombre: 'Participa',
    descripcion: 'Mecanismos de participación ciudadana',
    icono: Users,
    subcategorias: [
      { codigo: '6.1', nombre: 'Diagnóstico e identificación de problemas', descripcion: 'Espacios para identificar necesidades' },
      { codigo: '6.2', nombre: 'Planeación y presupuesto participativo', descripcion: 'Participación en la definición del presupuesto' },
      { codigo: '6.3', nombre: 'Consulta ciudadana', descripcion: 'Encuestas y consultas a la ciudadanía' },
      { codigo: '6.4', nombre: 'Colaboración e innovación abierta', descripcion: 'Espacios de co-creación con la ciudadanía' },
      { codigo: '6.5', nombre: 'Rendición de cuentas', descripcion: 'Participación en audiencias de rendición de cuentas' },
      { codigo: '6.6', nombre: 'Control social', descripcion: 'Veedurías ciudadanas y control social' },
    ],
  },
  'datos-abiertos': {
    numero: 7,
    nombre: 'Datos Abiertos',
    descripcion: 'Instrumentos de gestión de la información y datos abiertos',
    icono: Database,
    subcategorias: [
      { codigo: '7.1', nombre: 'Datos abiertos', descripcion: 'Conjuntos de datos en formato abierto' },
      { codigo: '7.2', nombre: 'Estudios, investigaciones y otras publicaciones', descripcion: 'Documentos de investigación y estudios' },
    ],
  },
  'informacion-especifica': {
    numero: 8,
    nombre: 'Información Específica para Grupos de Interés',
    descripcion: 'Información para ciudadanos, empresarios y contratistas',
    icono: UserCheck,
    subcategorias: [
      { codigo: '8.1', nombre: 'Información para ciudadanos', descripcion: 'Información general para la ciudadanía' },
      { codigo: '8.2', nombre: 'Información para empresarios', descripcion: 'Información relevante para el sector empresarial' },
      { codigo: '8.3', nombre: 'Información para contratistas', descripcion: 'Información para proveedores y contratistas' },
    ],
  },
  'obligacion-reporte': {
    numero: 9,
    nombre: 'Obligación de Reporte de Información Específica',
    descripcion: 'Reportes de información requeridos por organismos de control',
    icono: FileOutput,
    subcategorias: [
      { codigo: '9.1', nombre: 'Informes a organismos de inspección, vigilancia y control', descripcion: 'Reportes a entes de control' },
      { codigo: '9.2', nombre: 'Informes a organismos de regulación', descripcion: 'Reportes a entidades reguladoras' },
    ],
  },
  'informacion-tributaria': {
    numero: 10,
    nombre: 'Información Tributaria',
    descripcion: 'Información tributaria en entidades territoriales',
    icono: Receipt,
    subcategorias: [
      { codigo: '10.1', nombre: 'No aplica', descripcion: 'Esta categoría no aplica para la Personería Municipal' },
    ],
  },
}

// Menú lateral para transparencia
const menuTransparencia = Object.entries(categorias).map(([slug, cat]) => ({
  label: `${cat.numero}. ${cat.nombre}`,
  href: `/transparencia/${slug}`,
}))

interface PageProps {
  params: Promise<{ categoria: string }>
}

export async function generateStaticParams() {
  return Object.keys(categorias).map((categoria) => ({
    categoria,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params
  const cat = categorias[categoria]
  
  if (!cat) {
    return { title: 'Categoría no encontrada' }
  }

  return {
    title: `${cat.nombre} | Transparencia - Personería Municipal de Guadalajara de Buga`,
    description: cat.descripcion,
  }
}

export default async function CategoriaTransparenciaPage({ params }: PageProps) {
  const { categoria } = await params
  const cat = categorias[categoria]

  if (!cat) {
    notFound()
  }

  const IconComponent = cat.icono

  return (
    <>
      <PageHeader
        title={cat.nombre}
        description={cat.descripcion}
        breadcrumbItems={[
          { label: 'Transparencia', href: '/transparencia' },
          { label: cat.nombre },
        ]}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <SidebarMenu title="Transparencia" items={menuTransparencia} />
          </aside>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Encabezado de categoría */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gov-blue rounded-lg flex items-center justify-center shrink-0">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="inline-block px-2 py-1 bg-gov-blue/10 text-gov-blue text-xs font-semibold rounded mb-2">
                    Categoría {cat.numero}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900">{cat.nombre}</h2>
                  <p className="text-gray-600 mt-1">{cat.descripcion}</p>
                </div>
              </div>
            </div>

            {/* Subcategorías */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Subcategorías</h3>
              
              {cat.subcategorias.map((sub) => (
                <div 
                  key={sub.codigo}
                  className="bg-white rounded-lg shadow-sm border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded">
                          {sub.codigo}
                        </span>
                        <h4 className="font-semibold text-gray-900">{sub.nombre}</h4>
                      </div>
                      <p className="text-gray-600 text-sm">{sub.descripcion}</p>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      {sub.enlace ? (
                        <Link
                          href={sub.enlace}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gov-blue text-white text-sm rounded hover:bg-gov-blue-dark transition-colors"
                        >
                          Ver
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          Documentos
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista de documentos placeholder */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 italic">
                      Los documentos de esta subcategoría se cargarán desde la base de datos.
                    </p>
                    
                    {/* Ejemplo de documentos */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="text-gray-700">Documento de ejemplo.pdf</span>
                        </div>
                        <button className="text-gov-blue hover:underline flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nota de actualización */}
            <div className="bg-blue-50 border-l-4 border-gov-blue rounded-r-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Última actualización:</strong> Esta sección se actualiza de acuerdo con los 
                lineamientos de la Resolución 1519 de 2020 del MinTIC. Si requiere información 
                adicional, puede solicitarla a través de nuestros{' '}
                <Link href="/atencion-ciudadano/pqrsd" className="text-gov-blue hover:underline">
                  canales de atención
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
