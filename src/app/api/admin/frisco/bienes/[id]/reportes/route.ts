/**
 * /api/admin/frisco/bienes/[id]/reportes
 * GET — lista los reportes mensuales (de todos los depositarios) del bien,
 *       incluyendo el análisis IA si existe.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const guard = await requireFrisco(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()

  const reportes = await prisma.friscoReporteDepositario.findMany({
    where: { depositario: { bienId: id } },
    orderBy: [{ periodo: "desc" }, { createdAt: "desc" }],
    take: 60,
    include: {
      depositario: { select: { id: true, nombre: true, documento: true } },
      analisisIA:  true,
    },
  })

  return NextResponse.json({ reportes })
}
