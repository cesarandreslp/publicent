import { Metadata } from 'next'
import { getTenantPrisma } from '@/lib/tenant'
import { FuncionariosClient } from './funcionarios-client'

export const metadata: Metadata = {
  title: 'Funcionarios | Panel de Administración',
  description: 'Gestionar el directorio de funcionarios públicos',
}

export default async function FuncionariosPage() {
  const prisma = await getTenantPrisma()
  const funcionarios = await prisma.funcionario.findMany({
    orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
  })

  return <FuncionariosClient initialFuncionarios={funcionarios} />
}
