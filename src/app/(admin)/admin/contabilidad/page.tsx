/**
 * /admin/contabilidad — Dashboard contabilidad pública (CGN).
 * Server component: carga periodo activo, KPIs, últimos comprobantes y cuentas para el form.
 */
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import ContabilidadDashboardClient from "./client-page"

export const metadata: Metadata = {
  title: "Contabilidad pública",
  description: "Motor de doble partida + Plan Único de Cuentas (CGN).",
}

export default async function ContabilidadPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }

  const activo = await isTenantModuleActive(MODULO_IDS.CONTABILIDAD_PUBLICA)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()

  const [periodos, cuentasMov, totalCuentas, ultimosComprobantes, terceros] = await Promise.all([
    prisma.cpPeriodoContable.findMany({
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      take: 24,
      include: { _count: { select: { comprobantes: true } } },
    }),
    prisma.cpPlanCuenta.findMany({
      where: { activa: true, permiteMovimientos: true },
      orderBy: { codigo: 'asc' },
      select: { id: true, codigo: true, nombre: true, naturaleza: true },
      take: 500,
    }),
    prisma.cpPlanCuenta.count({ where: { activa: true } }),
    prisma.cpComprobante.findMany({
      orderBy: { fecha: 'desc' },
      take: 15,
      include: {
        periodo: { select: { codigo: true } },
        _count: { select: { asientos: true } },
      },
    }),
    prisma.cpAuxiliarTercero.findMany({
      where: { activo: true },
      orderBy: { razonSocial: 'asc' },
      take: 200,
      select: { id: true, documento: true, razonSocial: true },
    }),
  ])

  const periodoActivo = periodos.find(p => p.estado === 'ABIERTO') ?? periodos[0] ?? null

  let balance: { codigo: string; nombre: string; tipo: string; debito: number; credito: number; saldo: number }[] = []
  if (periodoActivo) {
    const asientos = await prisma.cpAsiento.findMany({
      where: { comprobante: { periodoId: periodoActivo.id, estado: 'REGISTRADO' } },
      select: {
        debito: true, credito: true,
        cuenta: { select: { codigo: true, nombre: true, naturaleza: true, tipo: true } },
      },
    })
    const acc = new Map<string, { codigo: string; nombre: string; tipo: string; naturaleza: string; debito: number; credito: number }>()
    for (const a of asientos) {
      const k = a.cuenta.codigo
      const prev = acc.get(k) ?? { codigo: a.cuenta.codigo, nombre: a.cuenta.nombre, tipo: a.cuenta.tipo, naturaleza: a.cuenta.naturaleza, debito: 0, credito: 0 }
      prev.debito += Number(a.debito)
      prev.credito += Number(a.credito)
      acc.set(k, prev)
    }
    balance = Array.from(acc.values())
      .map(r => ({ ...r, saldo: r.naturaleza === 'DEBITO' ? r.debito - r.credito : r.credito - r.debito }))
      .sort((a, b) => a.codigo.localeCompare(b.codigo))
  }

  const data = JSON.parse(JSON.stringify({ periodos, periodoActivo, totalCuentas, cuentasMov, ultimosComprobantes, balance, terceros }))

  return <ContabilidadDashboardClient {...data} />
}
