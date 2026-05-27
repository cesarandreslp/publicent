/**
 * /api/admin/nom/liquidar — Liquidar un periodo de nómina.
 *
 * POST body: { periodoId, diasLiquidados? }
 *
 * Flujo:
 *   1. Valida periodo ABIERTO.
 *   2. Carga empleados activos + conceptos del catálogo.
 *   3. Por cada empleado: corre `liquidarEmpleado` → resultado con líneas.
 *   4. En una sola transacción: upsert NomLiquidacion + reemplaza detalles.
 *   5. Marca periodo como LIQUIDADO.
 *
 * No genera comprobante contable ni obligación presupuestal aún — eso se
 * dispara en `/api/admin/nom/pagar` cuando la entidad confirma el pago.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"
import { nomLiquidarPeriodoSchema, validateBody } from "@/lib/validations"
import { liquidarEmpleado } from "@/lib/nomina-motor"

export async function POST(req: Request) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(nomLiquidarPeriodoSchema, body)
  if (!v.success) return v.response
  const { periodoId, diasLiquidados = 30 } = v.data

  const prisma = await getTenantPrisma()

  const periodo = await prisma.nomNominaPeriodo.findUnique({ where: { id: periodoId } })
  if (!periodo) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 })
  if (periodo.estado !== 'ABIERTO') {
    return NextResponse.json({ error: `Periodo en estado ${periodo.estado}, no se puede re-liquidar` }, { status: 409 })
  }

  const [empleados, conceptos] = await Promise.all([
    prisma.nomEmpleado.findMany({
      where: { activo: true, fechaIngreso: { lte: periodo.fechaFin } },
    }),
    prisma.nomConcepto.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }),
  ])

  if (!empleados.length) {
    return NextResponse.json({ error: "No hay empleados activos para liquidar" }, { status: 400 })
  }

  const conceptosTyped = conceptos.map((c: any) => ({
    id: c.id,
    codigo: c.codigo,
    nombre: c.nombre,
    tipo: c.tipo,
    formula: c.formula,
    porcentaje: c.porcentaje ? Number(c.porcentaje) : undefined,
    valorFijo: c.valorFijo ? Number(c.valorFijo) : undefined,
    aplicaA: c.aplicaA ?? [],
    baseRetencion: c.baseRetencion,
    baseAportes: c.baseAportes,
    constitutivoSalario: c.constitutivoSalario,
    cuentaContableCodigo: c.cuentaContableCodigo,
    rubroCcpetCodigo: c.rubroCcpetCodigo,
    orden: c.orden,
  }))

  const resumen = { liquidadas: 0, totalNeto: 0, totalDevengado: 0, totalDeducciones: 0, totalAportes: 0 }

  await prisma.$transaction(async (tx: any) => {
    for (const emp of empleados) {
      const r = liquidarEmpleado(
        { id: emp.id, tipoVinculacion: emp.tipoVinculacion, salarioBasico: Number(emp.salarioBasico) },
        conceptosTyped as any,
        diasLiquidados,
      )

      const liq = await tx.nomLiquidacion.upsert({
        where: { periodoId_empleadoId: { periodoId, empleadoId: emp.id } },
        create: {
          periodoId, empleadoId: emp.id,
          totalDevengado: r.totalDevengado,
          totalDeducciones: r.totalDeducciones,
          totalAportesPatronales: r.totalAportesPatronales,
          netoPagar: r.netoPagar,
          diasLiquidados,
          salarioBasico: emp.salarioBasico,
        },
        update: {
          totalDevengado: r.totalDevengado,
          totalDeducciones: r.totalDeducciones,
          totalAportesPatronales: r.totalAportesPatronales,
          netoPagar: r.netoPagar,
          diasLiquidados,
          salarioBasico: emp.salarioBasico,
        },
      })

      // Reemplazar detalles
      await tx.nomLiquidacionDetalle.deleteMany({ where: { liquidacionId: liq.id } })
      const detallesReales = r.lineas.filter(l => !l.conceptoId.startsWith("novedad"))
      if (detallesReales.length) {
        await tx.nomLiquidacionDetalle.createMany({
          data: detallesReales.map(l => ({
            liquidacionId: liq.id,
            conceptoId: l.conceptoId,
            valor: l.valor,
            base: l.base ?? null,
          })),
        })
      }

      resumen.liquidadas++
      resumen.totalNeto += r.netoPagar
      resumen.totalDevengado += r.totalDevengado
      resumen.totalDeducciones += r.totalDeducciones
      resumen.totalAportes += r.totalAportesPatronales
    }

    await tx.nomNominaPeriodo.update({
      where: { id: periodoId },
      data: { estado: 'LIQUIDADO', liquidadoEn: new Date(), liquidadoPor: guard.user?.id ?? null },
    })
  })

  return NextResponse.json({ periodoId, resumen })
}
