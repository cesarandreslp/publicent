/**
 * POST /api/admin/cp/cierre-anual
 *
 * Genera el comprobante de cierre contable:
 *   1. Traslada saldos de cuentas clase 4 (ingresos) → 5905 (Ganancias y pérdidas)
 *   2. Traslada saldos de cuentas clase 5 (gastos) → 5905
 *   3. Traslada el saldo neto de 5905 → 3110 (Resultado del ejercicio)
 *   4. Cierra el periodo.
 *
 * Body: { periodoId: string, numero?: string }
 * Restricción: SUPER_ADMIN solamente.
 */

import { NextResponse } from "next/server"
import { z } from "zod"
import { requireContabilidad } from "@/lib/frisco-guard"
import { getTenantPrisma } from "@/lib/tenant"
import { validateBody } from "@/lib/validations"

const schema = z.object({
  periodoId: z.string().cuid(),
  numero:    z.string().min(1).max(40).optional(),
})

const CUENTA_GANAPERD = "5905" // Ganancias y pérdidas (CGC)
const CUENTA_RESULTADO = "3110" // Resultado del ejercicio (CGC)

export async function POST(req: Request) {
  const guard = await requireContabilidad(["SUPER_ADMIN"])
  if (guard.error) return guard.error

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const v = validateBody(schema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  // 1. Verificar periodo
  const periodo = await prisma.cpPeriodoContable.findUnique({ where: { id: v.data.periodoId } })
  if (!periodo) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 })
  if (periodo.estado === "CERRADO") {
    return NextResponse.json({ error: "El periodo ya está CERRADO" }, { status: 409 })
  }

  // 2. Verificar que existan las cuentas de cierre
  const cuentasCierre = await prisma.cpPlanCuenta.findMany({
    where: { codigo: { in: [CUENTA_GANAPERD, CUENTA_RESULTADO] }, activa: true },
    select: { id: true, codigo: true, nombre: true, naturaleza: true, permiteMovimientos: true },
  })
  const cGanaPerd = cuentasCierre.find(c => c.codigo === CUENTA_GANAPERD)
  const cResultado = cuentasCierre.find(c => c.codigo === CUENTA_RESULTADO)

  if (!cGanaPerd) {
    return NextResponse.json(
      { error: `Cuenta ${CUENTA_GANAPERD} (Ganancias y pérdidas) no encontrada o inactiva. Verifique el CGC sembrado.` },
      { status: 422 }
    )
  }
  if (!cResultado) {
    return NextResponse.json(
      { error: `Cuenta ${CUENTA_RESULTADO} (Resultado del ejercicio) no encontrada o inactiva. Verifique el CGC sembrado.` },
      { status: 422 }
    )
  }
  if (!cGanaPerd.permiteMovimientos) {
    return NextResponse.json({ error: `Cuenta ${CUENTA_GANAPERD} no permite movimientos.` }, { status: 422 })
  }
  if (!cResultado.permiteMovimientos) {
    return NextResponse.json({ error: `Cuenta ${CUENTA_RESULTADO} no permite movimientos.` }, { status: 422 })
  }

  // 3. Obtener saldos de cuentas clase 4 y clase 5 del periodo
  const asientosPeriodo = await prisma.cpAsiento.findMany({
    where: {
      comprobante: {
        periodoId: v.data.periodoId,
        estado: "REGISTRADO",
        tipo: { not: "CIERRE" }, // No re-cerrar lo que ya es cierre
      },
    },
    select: {
      debito: true,
      credito: true,
      cuenta: { select: { id: true, codigo: true, nombre: true, naturaleza: true } },
    },
  })

  // Acumular saldos por cuenta
  const acum = new Map<string, { id: string; codigo: string; nombre: string; naturaleza: string; debito: number; credito: number }>()
  for (const a of asientosPeriodo) {
    const c = a.cuenta
    const prev = acum.get(c.id) ?? { id: c.id, codigo: c.codigo, nombre: c.nombre, naturaleza: c.naturaleza, debito: 0, credito: 0 }
    prev.debito  += Number(a.debito)
    prev.credito += Number(a.credito)
    acum.set(c.id, prev)
  }

  // Separar clase 4 y clase 5 con saldo real
  const clase4 = Array.from(acum.values()).filter(c => c.codigo.startsWith("4"))
  const clase5 = Array.from(acum.values()).filter(c => c.codigo.startsWith("5") && !c.codigo.startsWith("59")) // Excluir 5905

  const asientosCierre: { cuentaId: string; debito: number; credito: number; descripcion: string }[] = []

  let saldoGanaPerd = 0 // positivo = utilidad (ingresos > gastos)

  // Traslado clase 4 → 5905: D cuenta4 / C 5905
  for (const c of clase4) {
    const saldo = c.naturaleza === "CREDITO" ? c.credito - c.debito : c.debito - c.credito
    if (saldo === 0) continue
    asientosCierre.push({ cuentaId: c.id, debito: saldo, credito: 0, descripcion: `Cierre ingreso ${c.codigo}` })
    asientosCierre.push({ cuentaId: cGanaPerd.id, debito: 0, credito: saldo, descripcion: `Cierre ingreso ${c.codigo}` })
    saldoGanaPerd += saldo
  }

  // Traslado clase 5 → 5905: D 5905 / C cuenta5
  for (const c of clase5) {
    const saldo = c.naturaleza === "DEBITO" ? c.debito - c.credito : c.credito - c.debito
    if (saldo === 0) continue
    asientosCierre.push({ cuentaId: cGanaPerd.id, debito: saldo, credito: 0, descripcion: `Cierre gasto ${c.codigo}` })
    asientosCierre.push({ cuentaId: c.id, debito: 0, credito: saldo, descripcion: `Cierre gasto ${c.codigo}` })
    saldoGanaPerd -= saldo
  }

  if (asientosCierre.length === 0) {
    return NextResponse.json(
      { error: "No hay cuentas de ingresos o gastos con saldo. El periodo puede estar sin movimientos." },
      { status: 422 }
    )
  }

  // Traslado neto 5905 → 3110
  if (saldoGanaPerd > 0.005) {
    // Utilidad: D 5905 / C 3110
    asientosCierre.push({ cuentaId: cGanaPerd.id,  debito: saldoGanaPerd, credito: 0, descripcion: "Traslado resultado a 3110" })
    asientosCierre.push({ cuentaId: cResultado.id, debito: 0, credito: saldoGanaPerd, descripcion: "Resultado del ejercicio" })
  } else if (saldoGanaPerd < -0.005) {
    // Déficit: D 3110 / C 5905
    const deficit = Math.abs(saldoGanaPerd)
    asientosCierre.push({ cuentaId: cResultado.id, debito: deficit, credito: 0, descripcion: "Déficit del ejercicio" })
    asientosCierre.push({ cuentaId: cGanaPerd.id,  debito: 0, credito: deficit, descripcion: "Traslado déficit a 3110" })
  }

  const totalDebito  = asientosCierre.reduce((s, a) => s + a.debito, 0)
  const totalCredito = asientosCierre.reduce((s, a) => s + a.credito, 0)

  const numero = v.data.numero ?? `CIERRE-${periodo.codigo}`

  // 4. Crear comprobante + cerrar periodo en una transacción
  const resultado = await prisma.$transaction(async (tx: any) => {
    const comprobante = await tx.cpComprobante.create({
      data: {
        numero,
        tipo: "CIERRE",
        fecha: new Date(),
        descripcion: `Cierre contable del periodo ${periodo.codigo}`,
        periodoId: v.data.periodoId,
        totalDebito,
        totalCredito,
        fuenteModulo: "cierre-anual",
        fuenteRef: v.data.periodoId,
        creadoPor: guard.user?.id ?? null,
        asientos: { create: asientosCierre },
      },
      include: { _count: { select: { asientos: true } } },
    })

    await tx.cpPeriodoContable.update({
      where: { id: v.data.periodoId },
      data: { estado: "CERRADO" },
    })

    return comprobante
  })

  return NextResponse.json({
    comprobante: {
      id: resultado.id,
      numero: resultado.numero,
      asientos: resultado._count.asientos,
      totalDebito,
      totalCredito,
    },
    resumen: {
      cuentas4Cerradas: clase4.filter(c => (c.credito - c.debito) !== 0).length,
      cuentas5Cerradas: clase5.filter(c => (c.debito - c.credito) !== 0).length,
      resultadoNeto: saldoGanaPerd,
      tipo: saldoGanaPerd >= 0 ? "UTILIDAD" : "DEFICIT",
    },
    periodoCerrado: periodo.codigo,
  }, { status: 201 })
}
