import { Metadata } from 'next'
import { getTenantPrisma } from '@/lib/tenant'
import { FaqsClient } from './faqs-client'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Panel de Administración',
  description: 'Gestionar las preguntas frecuentes del sitio',
}

export default async function FaqsPage() {
  const prisma = await getTenantPrisma()
  const faqs = await prisma.preguntaFrecuente.findMany({
    orderBy: [{ categoria: 'asc' }, { orden: 'asc' }, { createdAt: 'asc' }],
  })

  return <FaqsClient initialFaqs={faqs} />
}
