/**
 * GET /api/admin/cp/libros/mayor?periodoId=&cuentaId=
 *
 * Libro Mayor: movimientos de una cuenta específica en el periodo.
 * Columnas: fecha, numero comprobante, referencia, descripcion,
 * debito, credito, saldo acumulado.
 * El saldo inicial del periodo es 0 (dentro del periodo abierto).
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const guard = await requireContabilidad(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const periodoId = searchParams.get("periodoId")
  const cuentaId  = searchParams.get("cuentaId")
  if (!periodoId) return NextResponse.json({ error: "periodoId requerido" }, { status: 400 })
  if (!cuentaId)  return NextResponse.json({ error: "cuentaId requerido" }, { status: 400 })

  const prisma = await getTenantPrisma()

  const cuenta = await prisma.cpPlanCuenta.findUnique({
    where: { id: cuentaId },
    select: { codigo: true, nombre: true, naturaleza: true },
  })
  if (!cuenta) return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })

  const asientos = await prisma.cpAsiento.findMany({
    where: {
      cuentaId,
      comprobante: { periodoId, estado: "REGISTRADO" },
    },
    orderBy: [
      { comprobante: { fecha: "asc" } },
      { id: "asc" },
    ],
    select: {
      id: true,
      debito: true,
      credito: true,
      descripcion: true,
      comprobante: {
        select: { numero: true, fecha: true, descripcion: true },
      },
      tercero: { select: { razonSocial: true } },
    },
  })

  let saldoAcum = 0
  const filas = asientos.map(a => {
    const d = Number(a.debito)
    const c = Number(a.credito)
    saldoAcum += cuenta.naturaleza === "DEBITO" ? (d - c) : (c - d)
    return {
      asientoId:   a.id,
      fecha:       a.comprobante.fecha,
      numero:      a.comprobante.numero,
      descripcion: a.descripcion || a.comprobante.descripcion,
      tercero:     a.tercero?.razonSocial ?? null,
      debito:      d,
      credito:     c,
      saldo:       saldoAcum,
    }
  })

  const totales = filas.reduce(
    (s, r) => ({ debito: s.debito + r.debito, credito: s.credito + r.credito }),
    { debito: 0, credito: 0 },
  )

  return NextResponse.json({
    periodoId,
    cuenta: { id: cuentaId, codigo: cuenta.codigo, nombre: cuenta.nombre, naturaleza: cuenta.naturaleza },
    filas,
    totales,
    saldoFinal: saldoAcum,
  })
}
