/**
 * /admin/ventanilla — Bandeja de Ventanilla Única
 * Server component: pre-carga métricas y lista de funcionarios para filtros.
 */

import { Metadata } from 'next'
import { requireRoles } from '@/lib/authorization'
import { redirect } from 'next/navigation'
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from '@/lib/tenant'
import { auth } from '@/lib/auth'
import VentanillaClientPage from './client-page'

export const metadata: Metadata = {
  title: 'Ventanilla Única — Bandeja | Admin Personería Buga',
  description: 'Bandeja de radicados PQRSD con semáforo de vencimientos y clasificación IA',
}

export default async function VentanillaPage() {
  try {
    await requireRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  } catch {
    redirect('/admin')
  }

  // Verificar que el módulo está activo para este tenant
  const vuActivo = await isTenantModuleActive(MODULO_IDS.VENTANILLA_UNICA)
  if (!vuActivo) redirect('/admin')

  const session = await auth()
  const userId = (session?.user as any)?.id as string
  const userRole = (session?.user as any)?.role as string

  const prisma = await getTenantPrisma()

  // Lista de funcionarios para el filtro de "asignado a"
  const funcionarios = await prisma.usuario.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true, cargo: true },
    orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
  })

  // Métricas iniciales para el header
  const [totalPendientes, totalVencidos, totalUrgentes, totalMios] = await Promise.all([
    prisma.pQRS.count({ where: { estado: { notIn: ['RESPONDIDA', 'CERRADA', 'ANULADA'] } } }),
    prisma.pQRS.count({ where: { colorSemaforo: 'NEGRO' as any, estado: { notIn: ['RESPONDIDA', 'CERRADA', 'ANULADA'] } } }),
    prisma.pQRS.count({ where: { colorSemaforo: { in: ['ROJO', 'NEGRO'] as any }, estado: { notIn: ['RESPONDIDA', 'CERRADA', 'ANULADA'] } } }),
    prisma.pQRS.count({ where: { asignadoId: userId, estado: { notIn: ['RESPONDIDA', 'CERRADA', 'ANULADA'] } } }),
  ])

  return (
    <VentanillaClientPage
      userId={userId}
      userRole={userRole}
      funcionarios={funcionarios}
      metricasIniciales={{ totalPendientes, totalVencidos, totalUrgentes, totalMios }}
    />
  )
}
