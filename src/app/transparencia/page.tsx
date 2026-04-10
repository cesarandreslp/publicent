import Link from "next/link"
import { ChevronRight, FileText, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Categorías según Resolución 1519 de 2020
const categoriasTransparencia = [
  {
    numero: 1,
    titulo: "Información de la Entidad",
    descripcion: "Mecanismos de contacto, información de interés, estructura orgánica y talento humano",
    href: "/transparencia/informacion-entidad",
    subcategorias: [
      "1.1 Mecanismos de contacto",
      "1.2 Información de interés",
      "1.3 Estructura orgánica y talento humano",
      "1.4. Directorio de Entidades",
      "1.11. Calendario de actividades",
      "1.13. Entes y autoridades que vigilan",
    ]
  },
  {
    numero: 2,
    titulo: "Normativa",
    descripcion: "Normatividad que rige a la entidad y normatividad aplicable",
    href: "/transparencia/normativa",
    subcategorias: [
      "2.1 Normativa de la entidad",
      "2.2 Búsqueda de normas",
      "2.3 Proyectos de normas",
    ]
  },
  {
    numero: 3,
    titulo: "Contratación",
    descripcion: "Plan anual de adquisiciones, información contractual y ejecución de contratos",
    href: "/transparencia/contratacion",
    subcategorias: [
      "3.1 Plan anual de adquisiciones",
      "3.2 Publicación de la información contractual",
      "3.3 Publicación de la ejecución de contratos",
      "3.4 Manual de contratación",
      "3.5 Formatos o modelos de contratos",
    ]
  },
  {
    numero: 4,
    titulo: "Planeación, Presupuesto e Informes",
    descripcion: "Presupuesto general, ejecución presupuestal, plan de acción e informes de gestión",
    href: "/transparencia/planeacion",
    subcategorias: [
      "4.1 Presupuesto general",
      "4.2 Ejecución presupuestal",
      "4.3 Plan de acción",
      "4.4 Proyectos de inversión",
      "4.5 Informes de empalme",
      "4.6 Informe de gestión y auditoría",
      "4.7 Planes de mejoramiento",
    ]
  },
  {
    numero: 5,
    titulo: "Trámites y Servicios",
    descripcion: "Trámites que se pueden adelantar ante la entidad",
    href: "/transparencia/tramites",
    subcategorias: [
      "5.1 Trámites",
      "5.2 Otros procedimientos administrativos",
    ]
  },
  {
    numero: 6,
    titulo: "Participa",
    descripcion: "Mecanismos de participación ciudadana",
    href: "/transparencia/participa",
    subcategorias: [
      "6.1 Diagnóstico e identificación de problemas",
      "6.2 Planeación y presupuesto participativo",
      "6.3 Consulta ciudadana",
      "6.4 Colaboración e innovación abierta",
      "6.5 Rendición de cuentas",
      "6.6 Control social",
    ]
  },
  {
    numero: 7,
    titulo: "Datos Abiertos",
    descripcion: "Instrumentos de gestión de la información",
    href: "/transparencia/datos-abiertos",
    subcategorias: [
      "7.1 Datos abiertos",
      "7.2 Estudios e investigaciones",
    ]
  },
  {
    numero: 8,
    titulo: "Información Específica para Grupos de Interés",
    descripcion: "Información para ciudadanos, empresarios y contratistas",
    href: "/transparencia/informacion-especifica",
    subcategorias: [
      "8.1 Información para ciudadanos",
      "8.2 Información para empresarios",
      "8.3 Información para contratistas",
    ]
  },
  {
    numero: 9,
    titulo: "Obligación de Reporte de Información Específica",
    descripcion: "Reportes de información requeridos por organismos de control",
    href: "/transparencia/obligacion-reporte",
    subcategorias: [
      "9.1 Informes a organismos de inspección y vigilancia",
      "9.2 Informes a organismos de regulación",
    ]
  },
  {
    numero: 10,
    titulo: "Información Tributaria en Entidades Territoriales",
    descripcion: "Información tributaria (solo para entidades territoriales)",
    href: "/transparencia/informacion-tributaria",
    subcategorias: [
      "10.1 No aplica para la Personería Municipal",
    ]
  },
]

export const metadata = {
  title: "Transparencia y Acceso a la Información Pública",
  description: "Acceda a toda la información pública de la Personería Municipal de Guadalajara de Buga según la Ley 1712 de 2014 y la Resolución 1519 de 2020",
}

export default function TransparenciaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gov-blue">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Transparencia</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gov-blue text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Transparencia y Acceso a la Información Pública
          </h1>
          <p className="text-blue-100 max-w-3xl text-lg">
            De acuerdo con la Ley 1712 de 2014 y la Resolución 1519 de 2020 del MinTIC, 
            ponemos a disposición de la ciudadanía la información pública de la entidad.
          </p>
          
          {/* Buscador */}
          <div className="mt-8 max-w-xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Buscar en transparencia..." 
                  className="pl-10 bg-white text-gray-900"
                />
              </div>
              <Button className="bg-white text-gov-blue hover:bg-gray-100">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {categoriasTransparencia.map((categoria) => (
            <Link
              key={categoria.numero}
              href={categoria.href}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <span className="shrink-0 w-10 h-10 bg-gov-blue text-white rounded-lg flex items-center justify-center font-bold text-lg">
                  {categoria.numero}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-gov-blue transition-colors mb-2">
                    {categoria.titulo}
                  </h2>
                  <p className="text-gray-600 text-sm mb-3">
                    {categoria.descripcion}
                  </p>
                  <ul className="space-y-1">
                    {categoria.subcategorias.slice(0, 3).map((sub, index) => (
                      <li key={index} className="text-xs text-gray-500 flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        {sub}
                      </li>
                    ))}
                    {categoria.subcategorias.length > 3 && (
                      <li className="text-xs text-gov-blue font-medium">
                        +{categoria.subcategorias.length - 3} más...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gov-blue" />
            Instrumentos de Gestión de Información Pública
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/transparencia/esquema-publicacion"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Esquema de Publicación</h3>
              <p className="text-sm text-gray-600">Información publicada de manera proactiva</p>
            </Link>
            <Link 
              href="/transparencia/registro-activos"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Registro de Activos de Información</h3>
              <p className="text-sm text-gray-600">Inventario de información de la entidad</p>
            </Link>
            <Link 
              href="/transparencia/indice-informacion"
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Índice de Información Clasificada</h3>
              <p className="text-sm text-gray-600">Información reservada y clasificada</p>
            </Link>
          </div>
        </div>

        {/* Sección Adicional Res 1519 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gov-blue" />
            Otras Secciones Obligatorias
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/transparencia/calendario"
              className="p-4 border border-gray-100 rounded-lg hover:border-gov-blue transition-colors group"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-gov-blue mb-1">Calendario de Actividades</h3>
              <p className="text-sm text-gray-600">Eventos y actividades (Art. 1.11)</p>
            </Link>
            <Link 
              href="/transparencia/entes-vigilancia"
              className="p-4 border border-gray-100 rounded-lg hover:border-gov-blue transition-colors group"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-gov-blue mb-1">Entes que Vigilan</h3>
              <p className="text-sm text-gray-600">Autoridades de control (Art. 1.13)</p>
            </Link>
            <Link 
              href="/entidad/directorio"
              className="p-4 border border-gray-100 rounded-lg hover:border-gov-blue transition-colors group"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-gov-blue mb-1">Directorio Institucional</h3>
              <p className="text-sm text-gray-600">Contactos y dependencias (Art. 1.4)</p>
            </Link>
          </div>
        </div>

        {/* Fecha de actualización */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Última actualización: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="mt-1">
            Responsable: Personería Municipal de Guadalajara de Buga | 
            <Link href="/atencion-ciudadano/pqrsd" className="text-gov-blue hover:underline ml-1">
              Reportar información desactualizada
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
