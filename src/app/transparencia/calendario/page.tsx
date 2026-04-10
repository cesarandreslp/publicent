import { Metadata } from 'next'
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Calendario de Actividades | Personería Municipal de Guadalajara de Buga',
  description: 'Conozca los eventos, audiencias, capacitaciones y demás actividades programadas por la entidad.',
}

const eventos = [
  {
    id: 1,
    titulo: 'Audiencia Pública de Rendición de Cuentas',
    fecha: '2026-05-15',
    hora: '09:00 AM',
    lugar: 'Teatro Municipal o Transmisión vía Facebook Live',
    tipo: 'Participación Ciudadana',
    descripcion: 'Presentación del informe de gestión correspondiente a la vigencia anterior, dirigido a toda la ciudadanía, entes de control y veedurías.',
  },
  {
    id: 2,
    titulo: 'Jornada de Asesoría Jurídica Móvil',
    fecha: '2026-06-05',
    hora: '08:00 AM - 04:00 PM',
    lugar: 'Parque Principal (Frente a la Alcaldía)',
    tipo: 'Servicios de Atención',
    descripcion: 'Atención descentralizada para brindar asesoría jurídica gratuita a población vulnerable en temas de familia, civil y acceso a la salud.',
  },
  {
    id: 3,
    titulo: 'Mesa de Participación de Víctimas',
    fecha: '2026-06-20',
    hora: '10:00 AM',
    lugar: 'Auditorio Comfandi Buga',
    tipo: 'Derechos Humanos',
    descripcion: 'Reunión ordinaria con la mesa municipal de participación efectiva de víctimas del conflicto armado.',
  },
]

export default function CalendarioPage() {
  return (
    <>
      <PageHeader
        title="Calendario de Actividades y Eventos"
        description="Agéndese con las actividades, programas y espacios de participación de la Personería Municipal"
        breadcrumbItems={[
          { label: 'Transparencia', href: '/transparencia' },
          { label: '1. Información de la Entidad', href: '/transparencia/informacion-entidad' },
          { label: 'Calendario' },
        ]}
      />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid gap-6">
          {eventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
                <div>
                  <Badge variant="outline" className="mb-2 bg-gov-blue/10 text-gov-blue border-gov-blue/20">
                    {evento.tipo}
                  </Badge>
                  <CardTitle className="text-xl text-gray-900">{evento.titulo}</CardTitle>
                </div>
                <div className="flex flex-col bg-gray-50 rounded-lg p-3 min-w-[140px] text-center shrink-0 border border-gray-100">
                  <span className="text-sm font-semibold text-gray-500 uppercase">
                    {new Date(evento.fecha).toLocaleDateString('es-CO', { month: 'short' })}
                  </span>
                  <span className="text-3xl font-bold text-gov-blue leading-none py-1">
                    {new Date(evento.fecha).toLocaleDateString('es-CO', { day: '2-digit' })}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(evento.fecha).toLocaleDateString('es-CO', { year: 'numeric' })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{evento.descripcion}</p>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gov-blue" />
                    <span>{evento.hora}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gov-blue" />
                    <span>{evento.lugar}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {eventos.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No hay eventos programados</h3>
              <p className="text-gray-500 mt-1">Actualmente no tenemos actividades en nuestro calendario público.</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
