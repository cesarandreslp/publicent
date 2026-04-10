import { Metadata } from 'next'
import { Link2, Shield, Eye, Building, Scale, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Entes y Autoridades que nos Vigilan | Personería Municipal',
  description: 'Conozca las autoridades y organismos que ejercen control sobre la Personería Municipal de Guadalajara de Buga.',
}

const entesControl = [
  {
    id: 1,
    nombre: 'Procuraduría General de la Nación',
    tipoControl: 'Disciplinario',
    descripcion: 'Ejerce control disciplinario sobre los servidores públicos y particulares que cumplen funciones públicas.',
    direccion: 'Carrera 5 No. 15-80, Bogotá D.C.',
    telefono: '+57 (601) 587 8750',
    email: 'quejas@procuraduria.gov.co',
    sitioWeb: 'https://www.procuraduria.gov.co',
    icono: Scale,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    id: 2,
    nombre: 'Contraloría General de la República',
    tipoControl: 'Fiscal',
    descripcion: 'Vigila la gestión fiscal de la administración y de los particulares o entidades que manejan fondos o bienes de la Nación.',
    direccion: 'Carrera 69 No 44-35, Bogotá D.C.',
    telefono: '+57 (601) 518 7000',
    email: 'cgr@contraloria.gov.co',
    sitioWeb: 'https://www.contraloria.gov.co',
    icono: Eye,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    id: 3,
    nombre: 'Contaduría General de la Nación',
    tipoControl: 'Contable',
    descripcion: 'Determina las políticas, principios y normas de contabilidad que rigen en el país para el sector público.',
    direccion: 'Calle 26 No 69-76 Edificio Elemento Torre 1 Piso 15, Bogotá D.C.',
    telefono: '+57 (601) 492 6400',
    email: 'contactenos@contaduria.gov.co',
    sitioWeb: 'https://www.contaduria.gov.co',
    icono: Building,
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    id: 4,
    nombre: 'Concejo Municipal de Guadalajara de Buga',
    tipoControl: 'Político',
    descripcion: 'Ejerce control político sobre la administración municipal, incluyendo a la Personería Municipal.',
    direccion: 'Calle 6 # 14-50, Buga, Valle del Cauca',
    telefono: '+57 (602) 228 1234',
    email: 'contacto@concejodebuga.gov.co',
    sitioWeb: 'https://www.concejodebuga.gov.co',
    icono: Shield,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
  },
  {
    id: 5,
    nombre: 'Archivo General de la Nación',
    tipoControl: 'Archivístico y Gestión Documental',
    descripcion: 'Vigila el cumplimiento de las políticas y normativas en materia de gestión documental y archivo.',
    direccion: 'Carrera 6 No. 6-91, Bogotá D.C.',
    telefono: '+57 (601) 328 2888',
    email: 'contacto@archivogeneral.gov.co',
    sitioWeb: 'https://www.archivogeneral.gov.co',
    icono: AlertCircle,
    color: 'text-teal-600',
    bg: 'bg-teal-100',
  },
]

export default function EntesVigilanciaPage() {
  return (
    <>
      <PageHeader
        title="Entes y Autoridades que nos Vigilan"
        description="Organismos de control disciplinario, fiscal, político y contable"
        breadcrumbItems={[
          { label: 'Transparencia', href: '/transparencia' },
          { label: '1. Información de la Entidad', href: '/transparencia/informacion-entidad' },
          { label: 'Entes que nos Vigilan' },
        ]}
      />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Info */}
        <div className="bg-blue-50 border-l-4 border-gov-blue rounded-r-lg p-5 mb-10 max-w-4xl">
          <p className="text-gray-700 leading-relaxed">
            De acuerdo con lo establecido en el <strong>Artículo 1.13 del Anexo 2 de la Resolución 1519 de 2020</strong>, 
            la Personería Municipal de Guadalajara de Buga pone a disposición de la ciudadanía la relación de todas 
            las entidades y autoridades que vigilan y supervisan nuestro actuar administrativo, financiero y disciplinario.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entesControl.map((ente) => {
            const Icono = ente.icono
            return (
              <Card key={ente.id} className="hover:shadow-lg transition-shadow border-gray-200">
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${ente.bg} shrink-0`}>
                      <Icono className={`w-6 h-6 ${ente.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gov-blue mb-1 block">
                        Control {ente.tipoControl}
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">
                        {ente.nombre}
                      </h2>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6 flex-1">
                    {ente.descripcion}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900 min-w-[70px]">Dirección:</span>
                      <span className="text-gray-600">{ente.direccion}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900 min-w-[70px]">Teléfono:</span>
                      <span className="text-gray-600">{ente.telefono}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900 min-w-[70px]">Correo:</span>
                      <a href={`mailto:${ente.email}`} className="text-gov-blue hover:underline break-all">
                        {ente.email}
                      </a>
                    </div>
                    <div className="pt-2">
                      <a 
                        href={ente.sitioWeb} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gov-blue hover:text-gov-blue-dark font-medium group"
                      >
                        Visitar sitio web
                        <Link2 className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </>
  )
}
