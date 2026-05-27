/**
 * /api/admin/psu/pagos — Pagos.
 * Afecta a una obligación. Genera comprobante contable (gasto/banco) si
 * `generarComprobante` !== false y el módulo `contabilidad_publica` está activo.
 *
 * Comprobante generado:
 *   D  cuentaGastoId (o 511121 "Honorarios" si no se pasa)   = valor
 *   C  cuentaBancoId (banco/caja del PUC)                    = valor
 * El comprobante usa el periodo ABIERTO actual del tenant.
 */
import { NextResponse } from "next/server"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { requirePresupuesto } from "@/lib/frisco-guard"
import { psuPagoCreateSchema, validateBody } from "@/lib/validations"
import { saldoObligacion } from "@/lib/presupuesto-saldos"

export async function POST(req: Request) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(psuPagoCreateSchema, body)
  if (!v.success) return v.response
  const d = v.data

  const prisma = await getTenantPrisma()
  const saldo = await saldoObligacion(prisma, d.obligacionId)
  if (!saldo) return NextResponse.json({ error: "Obligación no encontrada" }, { status: 404 })
  if (saldo.obligacion.estado === 'ANULADO') {
    return NextResponse.json({ error: "La obligación está anulada" }, { status: 409 })
  }
  if (d.valor > saldo.disponible + 0.005) {
    return NextResponse.json(
      { error: `Saldo obligación insuficiente. Disponible: ${saldo.disponible.toFixed(2)}` },
      { status: 409 }
    )
  }

  const generarComp = d.generarComprobante !== false && await isTenantModuleActive(MODULO_IDS.CONTABILIDAD_PUBLICA)

  try {
    const pago = await prisma.$transaction(async (tx: any) => {
      let comprobanteId: string | null = null

      if (generarComp && d.cuentaBancoId) {
        const periodo = await tx.cpPeriodoContable.findFirst({
          where: { estado: 'ABIERTO' },
          orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
        })
        if (!periodo) throw new Error("No hay periodo contable ABIERTO para generar el comprobante")

        // cuenta de gasto: usa la indicada o intenta una por defecto "5111" (Generales)
        let cuentaGastoId = d.cuentaGastoId
        if (!cuentaGastoId) {
          const generales = await tx.cpPlanCuenta.findFirst({
            where: { codigo: { startsWith: '5111' }, permiteMovimientos: true, activa: true },
            orderBy: { codigo: 'asc' },
          })
          if (!generales) throw new Error("No se encontró cuenta de gasto por defecto (5111*). Pase cuentaGastoId.")
          cuentaGastoId = generales.id
        }

        const numComp = `PG-${d.numero}`
        const comp = await tx.cpComprobante.create({
          data: {
            numero: numComp,
            tipo: 'EGRESO',
            fecha: new Date(d.fecha),
            descripcion: `Pago ${d.numero}: ${saldo.obligacion.concepto}`,
            periodoId: periodo.id,
            totalDebito: d.valor,
            totalCredito: d.valor,
            fuenteModulo: 'presupuesto',
            fuenteRef: '<pendiente>',
            creadoPor: guard.user?.id ?? null,
            asientos: {
              create: [
                { cuentaId: cuentaGastoId, debito: d.valor, credito: 0, descripcion: 'Gasto ejecutado' },
                { cuentaId: d.cuentaBancoId, debito: 0, credito: d.valor, descripcion: `Pago vía ${d.medioPago}` },
              ],
            },
          },
        })
        comprobanteId = comp.id
      }

      const created = await tx.psuPago.create({
        data: {
          numero: d.numero,
          fecha: new Date(d.fecha),
          obligacionId: d.obligacionId,
          valor: d.valor,
          medioPago: d.medioPago,
          referencia: d.referencia ?? null,
          cuentaBancoId: d.cuentaBancoId ?? null,
          comprobanteId,
          creadoPor: guard.user?.id ?? null,
        },
      })

      // Actualiza el fuenteRef del comprobante para cerrar el círculo
      if (comprobanteId) {
        await tx.cpComprobante.update({
          where: { id: comprobanteId },
          data: { fuenteRef: created.id },
        })
      }

      return created
    })

    return NextResponse.json({ pago }, { status: 201 })
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return NextResponse.json({ error: `Pago "${d.numero}" ya existe` }, { status: 409 })
    }
    console.error("[psu/pagos POST]", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al registrar pago" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const obligacionId = searchParams.get('obligacionId') ?? undefined

  const prisma = await getTenantPrisma()
  const pagos = await prisma.psuPago.findMany({
    where: { ...(obligacionId ? { obligacionId } : {}) },
    include: {
      obligacion: { select: { numero: true, rp: { select: { numero: true } } } },
    },
    orderBy: { fecha: 'desc' },
    take: 100,
  })
  return NextResponse.json({ pagos })
}
