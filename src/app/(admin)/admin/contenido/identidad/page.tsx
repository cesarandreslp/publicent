import { Metadata } from 'next'
import { getTenantPrisma } from '@/lib/tenant'
import { IdentidadClient } from './identidad-client'

export const metadata: Metadata = {
  title: 'Identidad Institucional | Panel de Administración',
  description: 'Configurar nombre, contacto, branding y SEO de la entidad',
}

export default async function IdentidadPage() {
  const prisma = await getTenantPrisma()
  const identidad = await prisma.identidadInstitucional.findFirst({
    where: { singletonKey: 'default' },
  })

  return <IdentidadClient initialData={identidad} />
}
