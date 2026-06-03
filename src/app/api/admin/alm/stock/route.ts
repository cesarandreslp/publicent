import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requireAlmacen } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const { error } = await requireAlmacen(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (error) return error

  void req
  const prisma = await getTenantPrisma()

  const [totalArticulos, enAlerta, totalEntradas, totalSalidas] = await Promise.all([
    prisma.almArticulo.count({ where: { activo: true } }),
    // artículos con stock <= mínimo (alertas)
    prisma.almArticulo.count({
      where: {
        activo: true,
        // Prisma no permite comparar dos campos directamente; usamos stockMinimo > 0 y filtramos después
        stockMinimo: { gt: 0 },
      },
    }),
    prisma.almEntrada.aggregate({ _sum: { cantidad: true } }),
    prisma.almSalida.aggregate({ _sum: { cantidad: true } }),
  ])

  // Artículos realmente en alerta (SQL directo para la comparación campo-a-campo)
  const alertas = await prisma.$queryRaw<{ id: string; codigo: string; nombre: string; unidad: string; stockActual: number; stockMinimo: number }[]>`
    SELECT id, codigo, nombre, unidad, "stockActual", "stockMinimo"
    FROM alm_articulos
    WHERE activo = true AND "stockMinimo" > 0 AND "stockActual" <= "stockMinimo"
    ORDER BY nombre
  `

  return NextResponse.json({
    totalArticulos,
    enAlerta: alertas.length,
    alertas,
    totalEntradas: totalEntradas._sum.cantidad ?? 0,
    totalSalidas:  totalSalidas._sum.cantidad  ?? 0,
  })
}
