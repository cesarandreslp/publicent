/**
 * /admin/presupuesto — Dashboard de ejecución presupuestal.
 * Server: vigencia actual, tabla de ejecución por rubro, listas para los flujos.
 */
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import PresupuestoClient from "./client-page"

export const metadata: Metadata = {
  title: "Presupuesto — Ejecución",
  description: "CDP → RP → Obligación → Pago",
}

export default async function PresupuestoPage({ searchParams }: { searchParams: Promise<{ vigencia?: string }> }) {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.PRESUPUESTO_EJECUCION)
  if (!activo) redirect("/admin")

  const sp = await searchParams
  const vigencia = Number(sp.vigencia ?? new Date().getFullYear())

  const prisma = await getTenantPrisma()

  const [apropiaciones, rubrosMov, cdpsRecientes, rpsRecientes, obligacionesVigentes, terceros, cuentasBanco] = await Promise.all([
    prisma.psuApropiacion.findMany({
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
    }),
    prisma.psuRubro.findMany({
      where: { activa: true, permiteMovimientos: true },
      orderBy: { codigo: 'asc' },
      select: { id: true, codigo: true, nombre: true, tipo: true },
      take: 500,
    }),
    prisma.psuCdp.findMany({
      where: { vigencia, estado: { not: 'ANULADO' } },
      include: { rubro: { select: { codigo: true, nombre: true } }, _count: { select: { rps: true } } },
      orderBy: { fecha: 'desc' },
      take: 25,
    }),
    prisma.psuRp.findMany({
      where: { estado: { not: 'ANULADO' } },
      include: {
        cdp: { select: { numero: true, rubro: { select: { codigo: true } } } },
        tercero: { select: { razonSocial: true } },
        _count: { select: { obligaciones: true } },
      },
      orderBy: { fecha: 'desc' },
      take: 25,
    }),
    prisma.psuObligacion.findMany({
      where: { estado: 'VIGENTE' },
      orderBy: { fecha: 'desc' },
      take: 50,
      select: { id: true, numero: true, valor: true, concepto: true, rp: { select: { numero: true, tercero: { select: { razonSocial: true } } } } },
    }),
    prisma.cpAuxiliarTercero.findMany({
      where: { activo: true },
      orderBy: { razonSocial: 'asc' },
      take: 200,
      select: { id: true, documento: true, razonSocial: true },
    }),
    prisma.cpPlanCuenta.findMany({
      where: { activa: true, permiteMovimientos: true, codigo: { startsWith: '111' } },
      orderBy: { codigo: 'asc' },
      select: { id: true, codigo: true, nombre: true },
    }),
  ])

  const filas = apropiaciones.map((a: any) => {
    const apropiado = Number(a.apropiacionInicial) + Number(a.adiciones) - Number(a.reducciones)
    let comprometido = 0, obligado = 0, pagado = 0
    for (const cdp of a.rubro.cdps) {
      comprometido += Number(cdp.valor)
      for (const rp of cdp.rps) {
        for (const o of rp.obligaciones) {
          obligado += Number(o.valor)
          for (const p of o.pagos) pagado += Number(p.valor)
        }
      }
    }
    return {
      rubroId: a.rubro.id, codigo: a.rubro.codigo, nombre: a.rubro.nombre, tipo: a.rubro.tipo,
      apropiado, comprometido, obligado, pagado,
      disponible: apropiado - comprometido,
    }
  })

  const data = JSON.parse(JSON.stringify({
    vigencia, filas, rubrosMov, cdpsRecientes, rpsRecientes, obligacionesVigentes, terceros, cuentasBanco,
  }))

  return <PresupuestoClient {...data} />
}
