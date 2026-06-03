/**
 * GET /api/admin/frisco/alertas-polizas?diasAnticipacion=30
 *
 * Lista los depositarios cuya póliza vence dentro del rango indicado.
 * Consulta on-demand para el panel admin (el cron usa la misma lógica de lib).
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireFrisco } from "@/lib/frisco-guard"
import { alertasPolizasFrisco } from "@/lib/alertas"

export async function GET(req: NextRequest) {
  const guard = await requireFrisco(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const dias = Math.min(365, Math.max(1, Number(searchParams.get("diasAnticipacion") ?? 30)))

  const prisma = await getTenantPrisma()
  const alertas = await alertasPolizasFrisco(prisma, dias)

  return NextResponse.json({ diasAnticipacion: dias, total: alertas.length, alertas })
}
