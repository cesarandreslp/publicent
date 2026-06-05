/**
 * GET /api/admin/disc/estadisticas
 * Conteos por estado, tipo e instructor; tasa de resolución; vencidos.
 */

import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireDisc } from "@/lib/frisco-guard"

export async function GET() {
  const guard = await requireDisc(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const prisma = await getTenantPrisma()
  const ahora = new Date()

  const [
    total,
    porEstado,
    porTipo,
    porInstructor,
    vencidos,
    totalTutelas,
    tutelasActivas,
    totalVisitas,
  ] = await Promise.all([
    prisma.discProceso.count(),
    prisma.discProceso.groupBy({ by: ['estado'], _count: { id: true } }),
    prisma.discProceso.groupBy({ by: ['tipo'], _count: { id: true } }),
    prisma.discProceso.groupBy({ by: ['instructorId'], _count: { id: true } }),
    prisma.discProceso.count({
      where: {
        estado: { notIn: ['EJECUTORIADO', 'ARCHIVADO'] },
        fechaVencimiento: { lt: ahora },
      },
    }),
    prisma.discTutela.count(),
    prisma.discTutela.count({ where: { estado: { in: ['RECIBIDA', 'EN_TRAMITE', 'IMPUGNADA', 'EN_CUMPLIMIENTO'] } } }),
    prisma.discVisitaPreventiva.count(),
  ])

  const resueltos = porEstado
    .filter((e) => e.estado === 'EJECUTORIADO' || e.estado === 'ARCHIVADO')
    .reduce((acc, e) => acc + e._count.id, 0)
  const abiertos = total - resueltos

  // Resolver nombres de instructores
  const instructorIds = porInstructor.map((i) => i.instructorId).filter((x): x is string => !!x)
  const instructores = instructorIds.length
    ? await prisma.usuario.findMany({
        where: { id: { in: instructorIds } },
        select: { id: true, nombre: true, apellido: true },
      })
    : []
  const nombreInstructor = new Map(instructores.map((u) => [u.id, `${u.nombre} ${u.apellido}`]))

  return NextResponse.json({
    total,
    abiertos,
    resueltos,
    vencidos,
    tasaResolucion: total > 0 ? Number(((resueltos / total) * 100).toFixed(1)) : 0,
    porEstado: porEstado.map((e) => ({ estado: e.estado, total: e._count.id })),
    porTipo: porTipo.map((t) => ({ tipo: t.tipo, total: t._count.id })),
    porInstructor: porInstructor.map((i) => ({
      instructorId: i.instructorId,
      nombre: i.instructorId ? (nombreInstructor.get(i.instructorId) ?? 'Desconocido') : 'Sin asignar',
      total: i._count.id,
    })),
    tutelas: { total: totalTutelas, activas: tutelasActivas },
    visitas: { total: totalVisitas },
  })
}
