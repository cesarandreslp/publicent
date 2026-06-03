import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireTesoreria } from "@/lib/frisco-guard"
import { tesoConciliarSchema, validateBody } from "@/lib/validations"

/**
 * POST /api/admin/teso/conciliar
 * Marca un TesoMovimiento y una TesoExtractoLinea como conciliados entre sí.
 * Validaciones: misma cuenta, mismo tipo (ingreso↔crédito / egreso↔débito),
 * valor compatible (tolerancia 0.5 COP), ambos aún sin conciliar.
 */
export async function POST(req: NextRequest) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (error) return error

  const body = await req.json()
  const v = validateBody(tesoConciliarSchema, body)
  if (!v.success) return v.response

  const prisma = await getTenantPrisma()

  const [mov, linea] = await Promise.all([
    prisma.tesoMovimiento.findUnique({ where: { id: v.data.movimientoId } }),
    prisma.tesoExtractoLinea.findUnique({
      where: { id: v.data.extractoLineaId },
      include: { extracto: true },
    }),
  ])

  if (!mov)   return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
  if (!linea) return NextResponse.json({ error: 'Línea de extracto no encontrada' }, { status: 404 })
  if (mov.conciliado)   return NextResponse.json({ error: 'El movimiento ya está conciliado' }, { status: 409 })
  if (linea.conciliada) return NextResponse.json({ error: 'La línea de extracto ya está conciliada' }, { status: 409 })
  if (mov.cuentaId !== linea.extracto.cuentaId)
    return NextResponse.json({ error: 'El movimiento y la línea pertenecen a cuentas distintas' }, { status: 400 })

  // Verificar coherencia tipo ↔ débito/crédito
  const esIngreso = mov.tipo === 'INGRESO'
  const valorExtracto = esIngreso
    ? Number(linea.credito ?? 0)
    : Number(linea.debito ?? 0)
  const valorMov = Number(mov.valor)
  if (Math.abs(valorMov - valorExtracto) > 0.5)
    return NextResponse.json({
      error: `Diferencia de valor mayor a $0.50: movimiento $${valorMov.toLocaleString()} vs extracto $${valorExtracto.toLocaleString()}`,
    }, { status: 400 })

  const ahora = new Date()
  await prisma.$transaction(async (tx) => {
    await tx.tesoMovimiento.update({
      where: { id: mov.id },
      data: { conciliado: true, conciliadoEn: ahora, extractoLineaId: linea.id },
    })
    await tx.tesoExtractoLinea.update({
      where: { id: linea.id },
      data: { conciliada: true, movimientoId: mov.id },
    })
  })

  return NextResponse.json({ conciliado: true })
}

/**
 * DELETE /api/admin/teso/conciliar
 * Revierte la conciliación de un movimiento (y su línea de extracto).
 */
export async function DELETE(req: NextRequest) {
  const { error } = await requireTesoreria(['SUPER_ADMIN', 'ADMIN'])
  if (error) return error

  const { searchParams } = new URL(req.url)
  const movimientoId = searchParams.get('movimientoId')
  if (!movimientoId)
    return NextResponse.json({ error: 'Falta movimientoId' }, { status: 400 })

  const prisma = await getTenantPrisma()
  const mov = await prisma.tesoMovimiento.findUnique({ where: { id: movimientoId } })
  if (!mov) return NextResponse.json({ error: 'Movimiento no encontrado' }, { status: 404 })
  if (!mov.conciliado) return NextResponse.json({ error: 'El movimiento no está conciliado' }, { status: 409 })

  await prisma.$transaction(async (tx) => {
    // Limpia TODAS las líneas vinculadas al movimiento (cubre conciliación 1:1 y N:1)
    await tx.tesoExtractoLinea.updateMany({
      where: { movimientoId },
      data: { conciliada: false, movimientoId: null },
    })
    await tx.tesoMovimiento.update({
      where: { id: movimientoId },
      data: { conciliado: false, conciliadoEn: null, extractoLineaId: null },
    })
  })
  return NextResponse.json({ revertido: true })
}
