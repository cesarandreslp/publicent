/**
 * /api/admin/nom/liquidaciones — Lista liquidaciones por periodo + drill-down.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const periodoId = searchParams.get('periodoId') ?? undefined
  const empleadoId = searchParams.get('empleadoId') ?? undefined

  const prisma = await getTenantPrisma()
  const liquidaciones = await prisma.nomLiquidacion.findMany({
    where: {
      ...(periodoId ? { periodoId } : {}),
      ...(empleadoId ? { empleadoId } : {}),
    },
    include: {
      empleado: {
        select: { documento: true, primerNombre: true, segundoNombre: true, primerApellido: true, segundoApellido: true, cargo: true, tipoVinculacion: true },
      },
      periodo: { select: { codigo: true, estado: true } },
      detalles: {
        include: { concepto: { select: { codigo: true, nombre: true, tipo: true } } },
      },
    },
    orderBy: [{ periodo: { codigo: 'desc' } }, { empleado: { primerApellido: 'asc' } }],
    take: 500,
  })
  return NextResponse.json({ liquidaciones })
}
