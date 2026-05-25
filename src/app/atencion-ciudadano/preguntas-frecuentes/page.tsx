import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/page-header'
import { getTenantPrisma } from '@/lib/tenant'
import { FaqsList } from './faqs-list'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description:
    'Encuentre respuestas a las dudas más comunes sobre nuestros servicios.',
}

export default async function PreguntasFrecuentesPage() {
  let faqs: Awaited<
    ReturnType<Awaited<ReturnType<typeof getTenantPrisma>>['preguntaFrecuente']['findMany']>
  > = []

  try {
    const prisma = await getTenantPrisma()
    faqs = await prisma.preguntaFrecuente.findMany({
      where: { publicada: true },
      orderBy: [{ categoria: 'asc' }, { orden: 'asc' }, { createdAt: 'asc' }],
    })
  } catch {}

  const items = faqs.map((f) => ({
    id: f.id,
    pregunta: f.pregunta,
    respuesta: f.respuesta,
    categoria: f.categoria,
    orden: f.orden,
  }))

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
          <FaqsList faqs={items} />

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
