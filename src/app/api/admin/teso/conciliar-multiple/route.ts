import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"
import { tesoConciliarMultipleSchema, validateBody } from "@/lib/validations"

/**
 * POST /api/admin/teso/conciliar-multiple
 * Concilia UN movimiento contra VARIAS líneas de extracto (relación N:1).
 * Caso típico: un único movimiento de libro corresponde a varias líneas del
 * extracto bancario (p. ej. principal + retenciones desglosadas por el banco).
 *
 * Validaciones:
 *  - todas las líneas pertenecen a la misma cuenta del movimiento,
 *  - ninguna línea ni el movimiento están ya conciliados,
 *  - la suma de las líneas (según tipo) ≈ valor del movimiento (tolerancia $1).
 */
export async function POST(req: NextRequest) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (error) return error

  const body = await req.json()
  const v = validateBody(tesoConciliarMultipleSchema, body)
  if (!v.success) return v.response

  const ids = Array.from(new Set(v.data.extractoLineaIds))
  if (ids.length < 2)
    return NextResponse.json({ error: 'Seleccione al menos 2 líneas distintas' }, { status: 400 })

  const prisma = await getTenantPrisma()

  const [mov, lineas] = await Promise.all([
    prisma.tesoMovimiento.findUnique({ where: { id: v.data.movimientoId } }),
    prisma.tesoExtractoLinea.findMany({
      where: { id: { in: ids } },
      include: { extracto: true },
    }),
  ])

  if (!mov) return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
  if (mov.conciliado) return NextResponse.json({ error: 'El movimiento ya está conciliado' }, { status: 409 })
  if (lineas.length !== ids.length)
    return NextResponse.json({ error: 'Alguna línea de extracto no existe' }, { status: 404 })

  const yaConciliada = lineas.find(l => l.conciliada)
  if (yaConciliada)
    return NextResponse.json({ error: 'Una de las líneas ya está conciliada' }, { status: 409 })

  const otraCuenta = lineas.find(l => l.extracto.cuentaId !== mov.cuentaId)
  if (otraCuenta)
    return NextResponse.json({ error: 'Hay líneas de una cuenta distinta a la del movimiento' }, { status: 400 })

  // Suma de líneas según el tipo del movimiento (ingreso → créditos, egreso → débitos)
  const esIngreso = mov.tipo === 'INGRESO'
  const sumaLineas = lineas.reduce(
    (s, l) => s + (esIngreso ? Number(l.credito ?? 0) : Number(l.debito ?? 0)),
    0,
  )
  const valorMov = Number(mov.valor)
  if (Math.abs(valorMov - sumaLineas) > 1)
    return NextResponse.json({
      error: `La suma de las líneas ($${sumaLineas.toLocaleString()}) no coincide con el movimiento ($${valorMov.toLocaleString()}). Diferencia mayor a $1.`,
    }, { status: 400 })

  const ahora = new Date()
  await prisma.$transaction(async (tx) => {
    await tx.tesoMovimiento.update({
      where: { id: mov.id },
      // extractoLineaId apunta a la primera línea (referencia); el vínculo N:1 vive
      // en TesoExtractoLinea.movimientoId de cada línea.
      data: { conciliado: true, conciliadoEn: ahora, extractoLineaId: lineas[0].id },
    })
    await tx.tesoExtractoLinea.updateMany({
      where: { id: { in: ids } },
      data: { conciliada: true, movimientoId: mov.id },
    })
  })

  return NextResponse.json({ conciliado: true, lineasConciliadas: ids.length })
}
