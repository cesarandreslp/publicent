/**
 * /admin/nomina — Dashboard de nómina pública.
 * Periodos mensuales, empleados activos y resumen de la última liquidación.
 */
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import NominaClient from "./client-page"

export const metadata: Metadata = {
  title: "Nómina — Liquidación mensual",
  description: "Empleados, periodos y liquidación de nómina",
}

export default async function NominaPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.NOMINA_PUBLICA)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()

  const [empleados, periodos, conceptos] = await Promise.all([
    prisma.nomEmpleado.findMany({
      orderBy: [{ activo: 'desc' }, { primerApellido: 'asc' }],
      take: 200,
    }),
    prisma.nomNominaPeriodo.findMany({
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
      take: 12,
      include: {
        _count: { select: { liquidaciones: true } },
        liquidaciones: { select: { totalDevengado: true, totalDeducciones: true, totalAportesPatronales: true, netoPagar: true } },
      },
    }),
    prisma.nomConcepto.count({ where: { activo: true } }),
  ])

  const periodosResumen = periodos.map((p: any) => {
    const acc = p.liquidaciones.reduce(
      (s: any, l: any) => ({
        devengado: s.devengado + Number(l.totalDevengado),
        deducciones: s.deducciones + Number(l.totalDeducciones),
        aportes: s.aportes + Number(l.totalAportesPatronales),
        neto: s.neto + Number(l.netoPagar),
      }),
      { devengado: 0, deducciones: 0, aportes: 0, neto: 0 },
    )
    return {
      id: p.id, codigo: p.codigo, anio: p.anio, mes: p.mes, estado: p.estado,
      liquidaciones: p._count.liquidaciones, ...acc,
    }
  })

  const empleadosLista = empleados.map((e: any) => ({
    id: e.id, documento: e.documento,
    nombre: `${e.primerNombre} ${e.segundoNombre ?? ''} ${e.primerApellido} ${e.segundoApellido ?? ''}`.replace(/\s+/g, ' ').trim(),
    cargo: e.cargo, dependencia: e.dependencia,
    tipoVinculacion: e.tipoVinculacion, activo: e.activo,
    salarioBasico: Number(e.salarioBasico),
  }))

  const empleadosActivos = empleadosLista.filter(e => e.activo).length

  return (
    <NominaClient
      empleados={empleadosLista}
      empleadosActivos={empleadosActivos}
      periodos={periodosResumen}
      conceptosTotal={conceptos}
    />
  )
}
