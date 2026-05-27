/**
 * /api/admin/psu/ejecucion — Vista consolidada de ejecución por rubro.
 * GET ?vigencia=YYYY → para cada rubro con apropiación, devuelve:
 *   apropiado · comprometido (CDP) · obligado · pagado · disponible.
 */
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePresupuesto } from "@/lib/frisco-guard"

export async function GET(req: NextRequest) {
  const guard = await requirePresupuesto(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) return guard.error

  const { searchParams } = new URL(req.url)
  const vigencia = Number(searchParams.get('vigencia') ?? new Date().getFullYear())

  const prisma = await getTenantPrisma()
  const apropiaciones = await prisma.psuApropiacion.findMany({
    where: { vigencia },
    include: {
      rubro: {
        select: {
          id: true, codigo: true, nombre: true, tipo: true,
          cdps: {
            where: { vigencia, estado: { not: 'ANULADO' } },
            select: {
              valor: true,
              rps: {
                where: { estado: { not: 'ANULADO' } },
                select: {
                  valor: true,
                  obligaciones: {
                    where: { estado: { not: 'ANULADO' } },
                    select: {
                      valor: true,
                      pagos: { where: { estado: { not: 'ANULADO' } }, select: { valor: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { rubro: { codigo: 'asc' } },
  })

  const filas = apropiaciones.map((a: any) => {
    const apropiado = Number(a.apropiacionInicial) + Number(a.adiciones) - Number(a.reducciones)
    let comprometido = 0, obligado = 0, pagado = 0
    for (const cdp of a.rubro.cdps) {
      comprometido += Number(cdp.valor)
      for (const rp of cdp.rps) {
        for (const o of rp.obligaciones) {
          obligado += Number(o.valor)
          for (const p of o.pagos) {
            pagado += Number(p.valor)
          }
        }
      }
    }
    return {
      rubroId: a.rubro.id,
      codigo: a.rubro.codigo,
      nombre: a.rubro.nombre,
      tipo: a.rubro.tipo,
      apropiado,
      comprometido,
      obligado,
      pagado,
      disponible: apropiado - comprometido,
      porEjecutar: apropiado - pagado,
    }
  })

  const totales = filas.reduce(
    (s, r) => ({
      apropiado: s.apropiado + r.apropiado,
      comprometido: s.comprometido + r.comprometido,
      obligado: s.obligado + r.obligado,
      pagado: s.pagado + r.pagado,
    }),
    { apropiado: 0, comprometido: 0, obligado: 0, pagado: 0 }
  )

  return NextResponse.json({ vigencia, filas, totales })
}
