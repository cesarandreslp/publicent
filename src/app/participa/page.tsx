import { Metadata } from "next"
import Link from "next/link"
import { Users, FileText, CheckSquare, MessageSquare, BarChart, Lightbulb } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = {
  title: "Participa | Personería Municipal de Guadalajara de Buga",
  description: "Espacios de participación ciudadana de la Personería Municipal",
}

const participaSections = [
  {
    title: "1. Participación para el Diagnóstico",
    description: "Identificación de problemas y necesidades de la ciudadanía para formular políticas o proyectos.",
    icon: Users,
    href: "/participa/diagnostico",
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "2. Planeación y Presupuesto Participativo",
    description: "Espacios donde los ciudadanos inciden en las decisiones sobre cómo se invierten los recursos públicos.",
    icon: FileText,
    href: "/participa/planeacion-participativa",
    color: "bg-green-50 text-green-700",
  },
  {
    title: "3. Consulta Ciudadana",
    description: "Procesos para conocer la opinión de la ciudadanía frente a proyectos, normas o decisiones.",
    icon: MessageSquare,
    href: "/participa/consulta-ciudadana",
    color: "bg-purple-50 text-purple-700",
  },
  {
    title: "4. Colaboración e Innovación Abierta",
    description: "Convocatorias para que los ciudadanos propongan soluciones innovadoras a retos públicos.",
    icon: Lightbulb,
    href: "/participa/colaboracion",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    title: "5. Rendición de Cuentas",
    description: "Información sobre la gestión, los resultados logrados y las metas alcanzadas por la entidad.",
    icon: BarChart,
    href: "/participa/rendicion-cuentas",
    color: "bg-red-50 text-red-700",
  },
  {
    title: "6. Control Social",
    description: "Mecanismos para que los ciudadanos vigilen y evalúen la gestión pública de la entidad.",
    icon: CheckSquare,
    href: "/participa/control-social",
    color: "bg-teal-50 text-teal-700",
  },
]

export default function ParticipaPage() {
  return (
    <>
      <PageHeader
        title="Menú Participa"
        description="Conozca los diferentes espacios donde puede interactuar, proponer, vigilar y decidir sobre la gestión pública."
        breadcrumbItems={[
          { label: "Transparencia", href: "/transparencia" },
          { label: "Participa" },
        ]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Qué es el Menú Participa?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              De acuerdo con los lineamientos de MinTIC y el Departamento Administrativo de la Función Pública, 
              esta sección consolida todos los espacios, mecanismos y acciones que permiten a los ciudadanos 
              ser parte de las decisiones y la gestión de la Personería Municipal de Guadalajara de Buga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participaSections.map((section) => {
              const Icon = section.icon
              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gov-blue hover:-translate-y-1 block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gov-blue"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${section.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-gov-blue transition-colors mb-2">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {section.description}
                  </p>
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-gov-blue">
                    Conocer más
                    <svg
                      className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
