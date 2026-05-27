/**
 * /api/admin/nom/pagar-pasivo — Liquida un pasivo de nómina a un tercero.
 *
 * Genera CpComprobante EGRESO: D <cuentaPasivo> / C <banco>. Persiste
 * NomPagoPasivo para descontar el saldo en futuras consultas de
 * pasivos-pendientes.
 *
 * Validaciones:
 *   - El periodo debe estar PAGADO (sólo entonces hay pasivos por liquidar).
 *   - La cuenta pasivo debe existir, ser clase 2, activa y permitir movimiento.
 *   - El valor no puede exceder el saldo pendiente para esa cuenta+periodo.
 *   - Debe haber periodo contable ABIERTO.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"
import { nomPagarPasivoSchema, validateBody } from "@/lib/validations"

export async function POST(req: Request) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(nomPagarPasivoSchema, body)
  if (!v.success) return v.response
  const d = v.data

  if (!(await isTenantModuleActive(MODULO_IDS.CONTABILIDAD_PUBLICA))) {
    return NextResponse.json({ error: "Active el módulo contabilidad_publica para pagar pasivos" }, { status: 409 })
  }

  const prisma = await getTenantPrisma()

  const periodo = await prisma.nomNominaPeriodo.findUnique({ where: { id: d.periodoId } })
  if (!periodo) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 })
  if (periodo.estado !== 'PAGADO' && periodo.estado !== 'CERRADO') {
    return NextResponse.json({ error: "Sólo se pagan pasivos de periodos PAGADO" }, { status: 409 })
  }

  // Cuenta pasivo + cuenta banco
  const [cuentaPasivo, cuentaBanco] = await Promise.all([
    prisma.cpPlanCuenta.findFirst({ where: { codigo: d.cuentaCodigo, activa: true, permiteMovimientos: true } }),
    prisma.cpPlanCuenta.findUnique({ where: { id: d.cuentaBancoId } }),
  ])
  if (!cuentaPasivo) {
    return NextResponse.json({ error: `Cuenta pasivo ${d.cuentaCodigo} no encontrada o no permite movimiento` }, { status: 400 })
  }
  if (!cuentaPasivo.codigo.startsWith('2')) {
    return NextResponse.json({ error: `Cuenta ${d.cuentaCodigo} no es de pasivo (clase 2)` }, { status: 400 })
  }
  if (!cuentaBanco || !cuentaBanco.codigo.startsWith('111')) {
    return NextResponse.json({ error: "Cuenta banco inválida (debe ser 111*)" }, { status: 400 })
  }

  // Calcular saldo disponible del pasivo en el periodo
  const comprobantes = await prisma.cpComprobante.findMany({
    where: { fuenteModulo: 'nomina', fuenteRef: d.periodoId, estado: 'REGISTRADO' },
    include: { asientos: { where: { cuentaId: cuentaPasivo.id } } },
  })
  let generado = 0
  for (const c of comprobantes) for (const a of c.asientos) generado += Number(a.credito)

  const pagosPrevios = await prisma.nomPagoPasivo.findMany({
    where: { periodoId: d.periodoId, cuentaCodigo: d.cuentaCodigo },
    select: { valor: true },
  })
  const pagado = pagosPrevios.reduce((s: number, p: any) => s + Number(p.valor), 0)
  const saldo = generado - pagado

  if (d.valor > saldo + 0.005) {
    return NextResponse.json(
      { error: `Saldo insuficiente. Generado: ${generado.toFixed(2)} · Pagado: ${pagado.toFixed(2)} · Disponible: ${saldo.toFixed(2)}` },
      { status: 409 },
    )
  }

  // Periodo contable abierto
  const periodoCont = await prisma.cpPeriodoContable.findFirst({
    where: { estado: 'ABIERTO' },
    orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
  })
  if (!periodoCont) {
    return NextResponse.json({ error: "No hay periodo contable ABIERTO" }, { status: 409 })
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const comp = await tx.cpComprobante.create({
        data: {
          numero: d.numero,
          tipo: 'EGRESO',
          fecha: new Date(d.fecha),
          descripcion: `Pago pasivo nómina ${periodo.codigo} · ${cuentaPasivo.codigo} ${cuentaPasivo.nombre} → ${d.tercero}`,
          periodoId: periodoCont.id,
          totalDebito: d.valor,
          totalCredito: d.valor,
          fuenteModulo: 'nomina-pasivo',
          fuenteRef: d.periodoId,
          creadoPor: guard.user?.id ?? null,
          asientos: {
            create: [
              { cuentaId: cuentaPasivo.id, debito: d.valor, credito: 0, descripcion: `Cancela pasivo a ${d.tercero}` },
              { cuentaId: cuentaBanco.id, debito: 0, credito: d.valor, descripcion: `Pago a ${d.tercero}` },
            ],
          },
        },
      })

      const pago = await tx.nomPagoPasivo.create({
        data: {
          periodoId: d.periodoId,
          cuentaCodigo: cuentaPasivo.codigo,
          cuentaNombre: cuentaPasivo.nombre,
          tercero: d.tercero,
          terceroNit: d.terceroNit ?? null,
          valor: d.valor,
          fecha: new Date(d.fecha),
          cuentaBancoCodigo: cuentaBanco.codigo,
          comprobanteId: comp.id,
          observacion: d.observacion ?? null,
          creadoPor: guard.user?.id ?? null,
        },
      })

      return { comp, pago }
    })

    return NextResponse.json({
      comprobante: { id: result.comp.id, numero: result.comp.numero },
      pago: result.pago,
      saldoRestante: saldo - d.valor,
    }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Comprobante "${d.numero}" ya existe` }, { status: 409 })
    }
    console.error("[nom/pagar-pasivo POST]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al pagar pasivo" }, { status: 500 })
  }
}
