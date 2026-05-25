import { Metadata } from 'next'
import { getTenantPrisma } from '@/lib/tenant'
import { CanalesClient } from './canales-client'

export const metadata: Metadata = {
  title: 'Canales de Atención | Panel de Administración',
  description: 'Gestionar los canales de atención al ciudadano',
}

export default async function CanalesPage() {
  const prisma = await getTenantPrisma()
  const canales = await prisma.canalAtencion.findMany({
    orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
  })

  return <CanalesClient initialCanales={canales} />
}
