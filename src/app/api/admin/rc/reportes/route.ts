/**
 * /api/admin/rc/reportes — Lista reportes generados.
 * GET ?tipo=&vigencia=&periodoContableId=
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireReportesControl } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const guard = await requireReportesControl(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') ?? undefined
  const vigencia = searchParams.get('vigencia')
  const periodoContableId = searchParams.get('periodoContableId') ?? undefined

  const prisma = await getTenantPrisma()
  const reportes = await prisma.rcReporteGenerado.findMany({
    where: {
      ...(tipo ? { tipo: tipo as any } : {}),
      ...(vigencia ? { vigencia: Number(vigencia) } : {}),
      ...(periodoContableId ? { periodoContableId } : {}),
    },
    orderBy: { generadoEn: 'desc' },
    take: 100,
    select: {
      id: true, tipo: true, vigencia: true, periodoContableId: true,
      totales: true, generadoEn: true, generadoPor: true, observacion: true,
    },
  })
  return NextResponse.json({ reportes })
}
