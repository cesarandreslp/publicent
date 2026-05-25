import { Metadata } from 'next'
import { getTenantPrisma } from '@/lib/tenant'
import { SedesClient } from './sedes-client'

export const metadata: Metadata = {
  title: 'Sedes Físicas | Panel de Administración',
  description: 'Gestionar las sedes físicas de la entidad',
}

export default async function SedesPage() {
  const prisma = await getTenantPrisma()
  const sedes = await prisma.sede.findMany({
    orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
  })

  return <SedesClient initialSedes={sedes} />
}
