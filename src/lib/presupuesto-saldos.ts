/**
 * presupuesto-saldos.ts — Cálculo de saldos disponibles en cada paso de la
 * cadena CDP → RP → Obligación → Pago.
 *
 * Las "vigentes" excluyen documentos en estado ANULADO. Cada nivel suma los
 * documentos hijos no-anulados y resta del valor del padre.
 */
import type { PrismaClient } from "@prisma/client"

type Tx = PrismaClient | any

export async function saldoApropiacion(prisma: Tx, rubroId: string, vigencia: number) {
  const apr = await prisma.psuApropiacion.findUnique({ where: { rubroId_vigencia: { rubroId, vigencia } } })
  if (!apr) return { existe: false, total: 0, comprometido: 0, disponible: 0 }
  const total = Number(apr.apropiacionInicial) + Number(apr.adiciones) - Number(apr.reducciones)
  const cdps = await prisma.psuCdp.findMany({
    where: { rubroId, vigencia, estado: { not: 'ANULADO' } },
    select: { valor: true },
  })
  const comprometido = cdps.reduce((s: number, c: { valor: any }) => s + Number(c.valor), 0)
  return { existe: true, total, comprometido, disponible: total - comprometido }
}

export async function saldoCdp(prisma: Tx, cdpId: string) {
  const cdp = await prisma.psuCdp.findUnique({ where: { id: cdpId } })
  if (!cdp) return null
  const rps = await prisma.psuRp.findMany({
    where: { cdpId, estado: { not: 'ANULADO' } },
    select: { valor: true },
  })
  const comprometido = rps.reduce((s: number, r: { valor: any }) => s + Number(r.valor), 0)
  return { cdp, total: Number(cdp.valor), comprometido, disponible: Number(cdp.valor) - comprometido }
}

export async function saldoRp(prisma: Tx, rpId: string) {
  const rp = await prisma.psuRp.findUnique({ where: { id: rpId } })
  if (!rp) return null
  const obs = await prisma.psuObligacion.findMany({
    where: { rpId, estado: { not: 'ANULADO' } },
    select: { valor: true },
  })
  const obligado = obs.reduce((s: number, o: { valor: any }) => s + Number(o.valor), 0)
  return { rp, total: Number(rp.valor), obligado, disponible: Number(rp.valor) - obligado }
}

export async function saldoObligacion(prisma: Tx, obligacionId: string) {
  const o = await prisma.psuObligacion.findUnique({ where: { id: obligacionId } })
  if (!o) return null
  const pagos = await prisma.psuPago.findMany({
    where: { obligacionId, estado: { not: 'ANULADO' } },
    select: { valor: true },
  })
  const pagado = pagos.reduce((s: number, p: { valor: any }) => s + Number(p.valor), 0)
  return { obligacion: o, total: Number(o.valor), pagado, disponible: Number(o.valor) - pagado }
}
