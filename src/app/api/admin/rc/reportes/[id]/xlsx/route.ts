/**
 * /api/admin/rc/reportes/[id]/xlsx — Descarga del snapshot como XLSX.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireReportesControl } from "@/lib/frisco-guard"
import { exportarReporteXlsx } from "@/lib/reportes-control/xlsx"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireReportesControl(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { id } = await params
  const prisma = await getTenantPrisma()
  const reporte = await prisma.rcReporteGenerado.findUnique({ where: { id } })
  if (!reporte) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  try {
    const bytes = await exportarReporteXlsx(reporte.tipo, reporte.datos, reporte.observacion)
    const fecha = new Date(reporte.generadoEn).toISOString().slice(0, 10)
    const cve = reporte.vigencia ?? reporte.periodoContableId ?? ''
    const filename = `${reporte.tipo}_${cve}_${fecha}.xlsx`
    return new Response(bytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error("[rc/reportes/[id]/xlsx]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error generando XLSX" }, { status: 500 })
  }
}
