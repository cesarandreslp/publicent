/**
 * /api/admin/rc/generar — Generar un reporte a entes de control.
 *
 * POST { tipo, periodoContableId?, vigencia?, icldManual?, topeCategoria?, observacion? }
 *
 * Persiste el snapshot en RcReporteGenerado y lo devuelve.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireReportesControl } from "@/lib/frisco-guard"
import { rcGenerarSchema, validateBody } from "@/lib/validations"
import { chipBalance, chipActividad } from "@/lib/reportes-control/chip"
import { futGastos, futIngresos } from "@/lib/reportes-control/fut"
import { ley617 } from "@/lib/reportes-control/ley617"

export async function POST(req: Request) {
  const guard = await requireReportesControl(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(rcGenerarSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()

  try {
    let datos: any = null
    let totales: any = null

    switch (d.tipo) {
      case 'CHIP_BALANCE':
        if (!d.periodoContableId) return NextResponse.json({ error: "periodoContableId requerido" }, { status: 400 })
        datos = await chipBalance(prisma, d.periodoContableId)
        totales = datos.totales
        break
      case 'CHIP_ACTIVIDAD':
        if (!d.periodoContableId) return NextResponse.json({ error: "periodoContableId requerido" }, { status: 400 })
        datos = await chipActividad(prisma, d.periodoContableId)
        totales = datos.totales
        break
      case 'FUT_GASTOS':
        if (!d.vigencia) return NextResponse.json({ error: "vigencia requerida" }, { status: 400 })
        datos = await futGastos(prisma, d.vigencia)
        totales = datos.totales
        break
      case 'FUT_INGRESOS':
        if (!d.vigencia) return NextResponse.json({ error: "vigencia requerida" }, { status: 400 })
        datos = await futIngresos(prisma, d.vigencia)
        totales = datos.totales
        break
      case 'LEY_617':
        if (!d.vigencia) return NextResponse.json({ error: "vigencia requerida" }, { status: 400 })
        datos = await ley617({ prisma, vigencia: d.vigencia, icldManual: d.icldManual, topeCategoria: d.topeCategoria })
        totales = { indicador: datos.indicador, cumple: datos.cumple, icld: datos.icld, funcionamiento: datos.funcionamientoObligado }
        break
    }

    const reporte = await prisma.rcReporteGenerado.create({
      data: {
        tipo: d.tipo,
        periodoContableId: d.periodoContableId ?? null,
        vigencia: d.vigencia ?? null,
        datos,
        totales,
        generadoPor: guard.user?.id ?? null,
        observacion: d.observacion ?? null,
      },
    })

    return NextResponse.json({ reporte }, { status: 201 })
  } catch (err) {
    console.error("[rc/generar POST]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al generar reporte" }, { status: 500 })
  }
}
