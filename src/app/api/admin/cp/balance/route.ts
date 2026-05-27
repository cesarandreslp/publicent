/**
 * /api/admin/cp/balance — Balance de cuentas para un periodo.
 * Devuelve saldos agregados por cuenta (sólo cuentas que tuvieron movimiento)
 * con débitos, créditos y saldo neto según naturaleza.
 *
 * Query: ?periodoId=... (requerido)
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const periodoId = searchParams.get('periodoId')
  if (!periodoId) return NextResponse.json({ error: "periodoId requerido" }, { status: 400 })

  const prisma = await getTenantPrisma()
  const asientos = await prisma.cpAsiento.findMany({
    where: {
      comprobante: { periodoId, estado: 'REGISTRADO' },
    },
    select: {
      debito: true,
      credito: true,
      cuenta: { select: { id: true, codigo: true, nombre: true, naturaleza: true, tipo: true } },
    },
  })

  const acumPorCuenta = new Map<string, {
    cuentaId: string; codigo: string; nombre: string;
    naturaleza: 'DEBITO' | 'CREDITO'; tipo: string;
    debito: number; credito: number; saldo: number;
  }>()

  for (const a of asientos) {
    const key = a.cuenta.id
    const debito = Number(a.debito)
    const credito = Number(a.credito)
    const prev = acumPorCuenta.get(key) ?? {
      cuentaId: a.cuenta.id,
      codigo: a.cuenta.codigo,
      nombre: a.cuenta.nombre,
      naturaleza: a.cuenta.naturaleza as 'DEBITO' | 'CREDITO',
      tipo: a.cuenta.tipo,
      debito: 0, credito: 0, saldo: 0,
    }
    prev.debito += debito
    prev.credito += credito
    prev.saldo = prev.naturaleza === 'DEBITO' ? prev.debito - prev.credito : prev.credito - prev.debito
    acumPorCuenta.set(key, prev)
  }

  const filas = Array.from(acumPorCuenta.values()).sort((a, b) => a.codigo.localeCompare(b.codigo))
  const totales = filas.reduce(
    (s, r) => ({ debito: s.debito + r.debito, credito: s.credito + r.credito }),
    { debito: 0, credito: 0 },
  )

  return NextResponse.json({ periodoId, filas, totales })
}
