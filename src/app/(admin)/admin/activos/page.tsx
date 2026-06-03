import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import ActivosClient from "./client-page"

export const metadata: Metadata = {
  title: "Activos y bienes",
  description: "Inventario institucional de bienes muebles e inmuebles",
}

export default async function ActivosPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.ACTIVOS_BIENES)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()

  const [bienes, kpis] = await Promise.all([
    prisma.activoBien.findMany({
      include: { _count: { select: { asignaciones: true, mantenimientos: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    Promise.all([
      prisma.activoBien.count(),
      prisma.activoBien.count({ where: { estado: 'EN_SERVICIO' } }),
      prisma.activoBien.count({ where: { estado: 'EN_MANTENIMIENTO' } }),
      prisma.activoBien.count({ where: { estado: 'DADO_DE_BAJA' } }),
      prisma.activoBien.aggregate({ _sum: { valorAdquisicion: true } }),
      prisma.activoMantenimiento.findMany({
        where: { proximoMantenimiento: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
        include: { activo: { select: { codigo: true, nombre: true } } },
        orderBy: { proximoMantenimiento: 'asc' },
        take: 10,
      }),
    ]),
  ])

  const [total, enServicio, enMantenimiento, dadosDeBaja, valorAgg, proximosMantenimientos] = kpis

  return (
    <ActivosClient
      bienes={JSON.parse(JSON.stringify(bienes))}
      proximosMantenimientos={JSON.parse(JSON.stringify(proximosMantenimientos))}
      kpis={{
        total,
        enServicio,
        enMantenimiento,
        dadosDeBaja,
        valorTotal: Number(valorAgg._sum.valorAdquisicion ?? 0),
      }}
    />
  )
}
