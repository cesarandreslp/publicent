/**
 * /api/admin/rc/reportes/[id] — Descargar el JSON completo del reporte.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireReportesControl } from "@/lib/frisco-guard"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireReportesControl(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const reporte = await prisma.rcReporteGenerado.findUnique({ where: { id } })
  if (!reporte) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json({ reporte })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireReportesControl(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  await prisma.rcReporteGenerado.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
