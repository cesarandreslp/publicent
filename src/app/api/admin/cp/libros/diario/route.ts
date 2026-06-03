/**
 * GET /api/admin/cp/libros/diario?periodoId=&page=1&limit=100
 *
 * Libro Diario: lista cronológica de todos los asientos del periodo,
 * agrupados por comprobante. Columnas: fecha, numero, descripcion,
 * cuenta, debito, credito, tercero.
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
  if (!periodoId) return NextResponse.json({ error: "periodoId requerido" }, { status: 400 })

  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1))
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") ?? 100)))
  const skip  = (page - 1) * limit

  const prisma = await getTenantPrisma()

  // Conteo total de asientos del periodo
  const total = await prisma.cpAsiento.count({
    where: { comprobante: { periodoId, estado: "REGISTRADO" } },
  })

  const asientos = await prisma.cpAsiento.findMany({
    where: { comprobante: { periodoId, estado: "REGISTRADO" } },
    orderBy: [
      { comprobante: { fecha: "asc" } },
      { id: "asc" },
    ],
    skip,
    take: limit,
    select: {
      id: true,
      debito: true,
      credito: true,
      descripcion: true,
      comprobante: {
        select: {
          id: true,
          numero: true,
          fecha: true,
          descripcion: true,
          tipo: true,
        },
      },
      cuenta: {
        select: { codigo: true, nombre: true, naturaleza: true },
      },
      tercero: {
        select: { razonSocial: true, documento: true },
      },
    },
  })

  const filas = asientos.map(a => ({
    asientoId:      a.id,
    comprobanteId:  a.comprobante.id,
    fecha:          a.comprobante.fecha,
    numero:         a.comprobante.numero,
    tipo:           a.comprobante.tipo,
    descripcionComp: a.comprobante.descripcion,
    cuentaCodigo:   a.cuenta.codigo,
    cuentaNombre:   a.cuenta.nombre,
    naturaleza:     a.cuenta.naturaleza,
    descripcion:    a.descripcion,
    debito:         Number(a.debito),
    credito:        Number(a.credito),
    tercero:        a.tercero ? `${a.tercero.razonSocial} (${a.tercero.documento})` : null,
  }))

  return NextResponse.json({
    periodoId,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    filas,
  })
}
