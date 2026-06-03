/**
 * GET /api/admin/cp/libros/auxiliar?periodoId=&terceroId=
 *
 * Libro Auxiliar: movimientos vinculados a un tercero específico en el periodo.
 * Misma estructura que el Mayor pero filtrado por CpAsiento.terceroId.
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
  const terceroId = searchParams.get("terceroId")
  if (!periodoId) return NextResponse.json({ error: "periodoId requerido" }, { status: 400 })
  if (!terceroId) return NextResponse.json({ error: "terceroId requerido" }, { status: 400 })

  const prisma = await getTenantPrisma()

  const tercero = await prisma.cpAuxiliarTercero.findUnique({
    where: { id: terceroId },
    select: { documento: true, razonSocial: true, tipoDocumento: true },
  })
  if (!tercero) return NextResponse.json({ error: "Tercero no encontrado" }, { status: 404 })

  const asientos = await prisma.cpAsiento.findMany({
    where: {
      terceroId,
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
      cuenta: { select: { codigo: true, nombre: true, naturaleza: true } },
    },
  })

  // Acumular saldo por cuenta (el auxiliar puede cruzar múltiples cuentas)
  let saldoAcum = 0
  const filas = asientos.map(a => {
    const d = Number(a.debito)
    const c = Number(a.credito)
    // Para el auxiliar usamos la naturaleza de la cuenta para el saldo
    saldoAcum += a.cuenta.naturaleza === "DEBITO" ? (d - c) : (c - d)
    return {
      asientoId:    a.id,
      fecha:        a.comprobante.fecha,
      numero:       a.comprobante.numero,
      descripcion:  a.descripcion || a.comprobante.descripcion,
      cuentaCodigo: a.cuenta.codigo,
      cuentaNombre: a.cuenta.nombre,
      debito:       d,
      credito:      c,
      saldo:        saldoAcum,
    }
  })

  const totales = filas.reduce(
    (s, r) => ({ debito: s.debito + r.debito, credito: s.credito + r.credito }),
    { debito: 0, credito: 0 },
  )

  return NextResponse.json({
    periodoId,
    tercero: {
      id: terceroId,
      documento: tercero.documento,
      razonSocial: tercero.razonSocial,
      tipoDocumento: tercero.tipoDocumento,
    },
    filas,
    totales,
    saldoFinal: saldoAcum,
  })
}
