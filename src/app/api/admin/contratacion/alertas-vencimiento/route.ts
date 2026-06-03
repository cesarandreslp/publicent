/**
 * GET /api/admin/contratacion/alertas-vencimiento?diasAnticipacion=30
 *
 * Lista los contratos vigentes que terminan dentro del rango indicado.
 * Consulta on-demand para el panel admin (el cron usa la misma lógica de lib).
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContratacion } from "@/lib/frisco-guard"
import { alertasVencimientoContratos } from "@/lib/alertas"

export async function GET(req: NextRequest) {
  const guard = await requireContratacion(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const dias = Math.min(365, Math.max(1, Number(searchParams.get("diasAnticipacion") ?? 30)))

  const prisma = await getTenantPrisma()
  const alertas = await alertasVencimientoContratos(prisma, dias)

  return NextResponse.json({ diasAnticipacion: dias, total: alertas.length, alertas })
}
