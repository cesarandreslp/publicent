/**
 * /api/admin/nom/pasivos-pendientes?periodoId=
 *
 * Calcula los pasivos generados por el comprobante de nómina del periodo
 * (asientos crédito en cuentas 24xx / 2505 / 2510) y descuenta lo ya pagado
 * vía NomPagoPasivo. Devuelve filas listas para pagar.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireNomina } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const guard = await requireNomina(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const periodoId = searchParams.get('periodoId')
  if (!periodoId) return NextResponse.json({ error: "periodoId requerido" }, { status: 400 })

  const prisma = await getTenantPrisma()

  const periodo = await prisma.nomNominaPeriodo.findUnique({ where: { id: periodoId } })
  if (!periodo) return NextResponse.json({ error: "Periodo no encontrado" }, { status: 404 })

  // Comprobantes de nómina del periodo (creados por /api/admin/nom/pagar)
  const comprobantes = await prisma.cpComprobante.findMany({
    where: { fuenteModulo: 'nomina', fuenteRef: periodoId, estado: 'REGISTRADO' },
    include: { asientos: { include: { cuenta: true } } },
  })

  // Agrupa créditos en cuentas pasivo (clase 2) por código
  type Generado = { cuentaCodigo: string; cuentaNombre: string; valor: number }
  const generadosMap = new Map<string, Generado>()
  for (const c of comprobantes) {
    for (const a of c.asientos) {
      const codigo = a.cuenta.codigo
      if (!codigo.startsWith('2')) continue
      const credito = Number(a.credito)
      if (credito <= 0) continue
      const prev = generadosMap.get(codigo) ?? { cuentaCodigo: codigo, cuentaNombre: a.cuenta.nombre, valor: 0 }
      prev.valor += credito
      generadosMap.set(codigo, prev)
    }
  }

  // Suma pagos ya realizados por código
  const pagos = await prisma.nomPagoPasivo.findMany({
    where: { periodoId },
    select: { cuentaCodigo: true, valor: true, tercero: true, fecha: true, comprobanteId: true, id: true, terceroNit: true, observacion: true },
  })
  const pagadoMap = new Map<string, number>()
  for (const p of pagos) {
    pagadoMap.set(p.cuentaCodigo, (pagadoMap.get(p.cuentaCodigo) ?? 0) + Number(p.valor))
  }

  const filas = Array.from(generadosMap.values()).map(g => {
    const pagado = pagadoMap.get(g.cuentaCodigo) ?? 0
    return {
      cuentaCodigo: g.cuentaCodigo,
      cuentaNombre: g.cuentaNombre,
      generado: g.valor,
      pagado,
      saldo: g.valor - pagado,
    }
  }).sort((a, b) => a.cuentaCodigo.localeCompare(b.cuentaCodigo))

  return NextResponse.json({
    periodo: { id: periodo.id, codigo: periodo.codigo, estado: periodo.estado },
    filas,
    pagos,
    totalGenerado: filas.reduce((s, f) => s + f.generado, 0),
    totalPagado: filas.reduce((s, f) => s + f.pagado, 0),
    totalSaldo: filas.reduce((s, f) => s + f.saldo, 0),
  })
}
