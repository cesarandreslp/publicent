/**
 * /api/admin/nom/pagar — Pagar nómina de un periodo.
 *
 * Genera UN solo comprobante contable agregando todas las liquidaciones del
 * periodo (NomEstadoPeriodo LIQUIDADO → PAGADO):
 *
 *   DEVENGADOS         → D  cuenta gasto (5101.. por concepto.cuentaContableCodigo)
 *   APORTE_PATRONAL    → D  cuenta gasto (5103/5104) + C pasivo (2505/2510)
 *   PRESTACION_SOCIAL  → D  cuenta gasto (5101.x prestaciones) + C pasivo (2510)
 *   DEDUCCION_EMPLEADO → C  pasivo (2425 retenciones, 2436 retefuente, etc.)
 *   NETO al empleado   → C  banco (cuentaBancoId)
 *
 * Para simplificar el modelo MVP: las deducciones del empleado se asientan
 * directamente como pasivo en el mismo comprobante (no se crea cxp de sueldos).
 * Los aportes patronales generan también su pasivo (la entidad queda debiendo
 * a la EPS/AFP/ARL/parafiscales — se pagan en otra obligación posterior).
 *
 * El neto a pagar a los empleados sale directo del banco — flujo simplificado
 * típico de personerías/alcaldías que pagan por dispersión bancaria el mismo día.
 *
 * Tras crear el comprobante:
 *   - Cada NomLiquidacion.comprobanteId = comp.id
 *   - Periodo pasa a PAGADO con liquidadoEn/liquidadoPor preservados
 */
import { NextResponse } from "next/server"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"
import { nomPagarPeriodoSchema, validateBody } from "@/lib/validations"

export async function POST(req: Request) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(nomPagarPeriodoSchema, body)
  if (!v.success) return v.response
  const d = v.data

  if (!(await isTenantModuleActive(MODULO_IDS.CONTABILIDAD_PUBLICA))) {
    return NextResponse.json({ error: "Active el módulo contabilidad_publica para pagar nómina" }, { status: 409 })
  }

  const prisma = await getTenantPrisma()

  const periodo = await prisma.nomNominaPeriodo.findUnique({
    where: { id: d.periodoId },
    include: {
      liquidaciones: {
        include: { detalles: { include: { concepto: true } } },
      },
    },
  })
  if (!periodo) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 })
  if (periodo.estado !== 'LIQUIDADO') {
    return NextResponse.json({ error: `Periodo en estado ${periodo.estado}, sólo se pagan periodos LIQUIDADO` }, { status: 409 })
  }
  if (!periodo.liquidaciones.length) {
    return NextResponse.json({ error: "El periodo no tiene liquidaciones" }, { status: 400 })
  }

  // ── Agregar movimientos por código contable ─────────────────────────────────
  type Movs = Map<string, { debito: number; credito: number }>
  const movs: Movs = new Map()
  const add = (codigo: string, lado: 'D' | 'C', valor: number) => {
    const prev = movs.get(codigo) ?? { debito: 0, credito: 0 }
    if (lado === 'D') prev.debito += valor
    else prev.credito += valor
    movs.set(codigo, prev)
  }

  let totalNeto = 0
  let totalDeducciones = 0
  for (const liq of periodo.liquidaciones) {
    totalNeto += Number(liq.netoPagar)
    totalDeducciones += Number(liq.totalDeducciones)
    for (const det of liq.detalles) {
      const c = det.concepto
      const valor = Number(det.valor)
      if (!c.cuentaContableCodigo) continue   // sin código → no afecta libros (advertencia silenciosa)

      switch (c.tipo) {
        case 'DEVENGADO':
          add(c.cuentaContableCodigo, 'D', valor)
          break
        case 'APORTE_PATRONAL':
        case 'PRESTACION_SOCIAL': {
          add(c.cuentaContableCodigo, 'D', valor)
          // Contrapartida pasivo: 2510 prestaciones, 2505 nómina/aportes
          const pasivo = c.tipo === 'PRESTACION_SOCIAL' ? '2510' : '2505'
          add(pasivo, 'C', valor)
          break
        }
        case 'DEDUCCION_EMPLEADO':
          // Pasivo a la entidad receptora (EPS/AFP/DIAN/embargante)
          add(c.cuentaContableCodigo, 'C', valor)
          break
      }
    }
  }

  // Neto al empleado vía banco
  // Lado contable: ya cargamos gastos (D) y pasivos por deducciones (C); falta
  // descontar el neto del banco. El cuadre es: D(devengados) = C(deducciones) + C(banco).
  // Aportes patronales y prestaciones cuadran solos (D gasto = C pasivo).
  // Resolvemos: get banco codigo desde cuentaBancoId
  const bancoAcct = await prisma.cpPlanCuenta.findUnique({ where: { id: d.cuentaBancoId } })
  if (!bancoAcct) return NextResponse.json({ error: "Cuenta banco no encontrada" }, { status: 400 })
  add(bancoAcct.codigo, 'C', totalNeto)

  // ── Resolver códigos → cpPlanCuenta.id ──────────────────────────────────────
  const codigosUsados = Array.from(movs.keys())
  const cuentas = await prisma.cpPlanCuenta.findMany({
    where: { codigo: { in: codigosUsados }, activa: true, permiteMovimientos: true },
    select: { id: true, codigo: true, nombre: true },
  })
  const byCodigo = new Map(cuentas.map((c: any) => [c.codigo, c]))
  const faltantes = codigosUsados.filter(k => !byCodigo.has(k))
  if (faltantes.length) {
    return NextResponse.json(
      { error: `Cuentas CGC faltantes o no permiten movimiento: ${faltantes.join(', ')}` },
      { status: 400 },
    )
  }

  // ── Validar partida doble ────────────────────────────────────────────────────
  let totalD = 0, totalC = 0
  for (const m of movs.values()) { totalD += m.debito; totalC += m.credito }
  if (Math.abs(totalD - totalC) > 0.5) {
    return NextResponse.json(
      { error: `Comprobante no cuadra: D=${totalD.toFixed(2)} C=${totalC.toFixed(2)}` },
      { status: 500 },
    )
  }

  // ── Periodo contable abierto ────────────────────────────────────────────────
  const periodoCont = await prisma.cpPeriodoContable.findFirst({
    where: { estado: 'ABIERTO' },
    orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
  })
  if (!periodoCont) {
    return NextResponse.json({ error: "No hay periodo contable ABIERTO" }, { status: 409 })
  }

  // ── Crear comprobante + actualizar liquidaciones + cerrar periodo ───────────
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const comp = await tx.cpComprobante.create({
        data: {
          numero: d.numero,
          tipo: 'EGRESO',
          fecha: new Date(d.fecha),
          descripcion: `Pago nómina ${periodo.codigo} (${periodo.liquidaciones.length} empleados)`,
          periodoId: periodoCont.id,
          totalDebito: totalD,
          totalCredito: totalC,
          fuenteModulo: 'nomina',
          fuenteRef: periodo.id,
          creadoPor: guard.user?.id ?? null,
          asientos: {
            create: Array.from(movs.entries()).map(([codigo, m]) => {
              const cuenta = byCodigo.get(codigo)!
              return {
                cuentaId: (cuenta as any).id,
                debito: m.debito,
                credito: m.credito,
                descripcion: `Nómina ${periodo.codigo} · ${(cuenta as any).nombre}`,
              }
            }),
          },
        },
      })

      await tx.nomLiquidacion.updateMany({
        where: { periodoId: periodo.id },
        data: { comprobanteId: comp.id },
      })

      await tx.nomNominaPeriodo.update({
        where: { id: periodo.id },
        data: { estado: 'PAGADO' },
      })

      return comp
    })

    return NextResponse.json({
      comprobante: { id: result.id, numero: result.numero },
      totalDebito: totalD,
      totalCredito: totalC,
      totalNeto,
      totalDeducciones,
      asientos: movs.size,
      empleados: periodo.liquidaciones.length,
    }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Comprobante "${d.numero}" ya existe` }, { status: 409 })
    }
    console.error("[nom/pagar POST]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al pagar nómina" }, { status: 500 })
  }
}
