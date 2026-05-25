/**
 * /admin/ventanilla/[id] — Detalle de radicado PQRSD
 * Server component: carga datos del PQRSD y lista de funcionarios para reasignación.
 */

import { Metadata } from 'next'
import { requireRoles } from '@/lib/authorization'
import { notFound, redirect } from 'next/navigation'
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from '@/lib/tenant'
import { auth } from '@/lib/auth'
import VentanillaDetalleClient from './client-page'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Radicado — Ventanilla Única`,
    description: `Detalle del radicado ${id}`,
  }
}

export default async function VentanillaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    await requireRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  } catch {
    redirect('/admin')
  }

  const vuActivo = await isTenantModuleActive(MODULO_IDS.VENTANILLA_UNICA)
  if (!vuActivo) redirect('/admin')

  const { id: pqrsId } = await params

  const session = await auth()
  const userId   = (session?.user as any)?.id as string
  const userRole = (session?.user as any)?.role as string

  const prisma = await getTenantPrisma()

  const [pqrs, funcionarios] = await Promise.all([
    prisma.pQRS.findUnique({
      where: { id: pqrsId },
      include: {
        asignado:     { select: { id: true, nombre: true, apellido: true, cargo: true, email: true } },
        vuAsignacion: true,
        vuRespuestas: {
          include: {
            funcionario: { select: { nombre: true, apellido: true, cargo: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        vuDemografia: true,
        historial: {
          include: {
            usuario: { select: { nombre: true, apellido: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    }),
    prisma.usuario.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, apellido: true, cargo: true },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    }),
  ])

  if (!pqrs) notFound()

  // Serializar fechas para el cliente
  const pqrsSerial = JSON.parse(JSON.stringify(pqrs))

  return (
    <VentanillaDetalleClient
      pqrs={pqrsSerial}
      funcionarios={funcionarios}
      userId={userId}
      userRole={userRole}
    />
  )
}
