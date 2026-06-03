import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import AlmacenClient from "./client-page"

export const metadata: Metadata = {
  title: "Almacén",
  description: "Gestión de inventario de suministros y elementos de consumo",
}

export default async function AlmacenPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.ALMACEN)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()

  const [articulos, entradasRecientes, salidasRecientes] = await Promise.all([
    prisma.almArticulo.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.almEntrada.findMany({
      include: { articulo: { select: { codigo: true, nombre: true, unidad: true } } },
      orderBy: { fechaEntrada: 'desc' },
      take: 30,
    }),
    prisma.almSalida.findMany({
      include: { articulo: { select: { codigo: true, nombre: true, unidad: true } } },
      orderBy: { fechaSalida: 'desc' },
      take: 30,
    }),
  ])

  const alertas = articulos.filter(a => a.stockMinimo > 0 && a.stockActual <= a.stockMinimo)

  const kpis = {
    totalArticulos: articulos.length,
    enAlerta:       alertas.length,
    valorInventario: articulos.reduce((sum, a) => sum + a.stockActual, 0),
  }

  return (
    <AlmacenClient
      articulos={JSON.parse(JSON.stringify(articulos))}
      entradasRecientes={JSON.parse(JSON.stringify(entradasRecientes))}
      salidasRecientes={JSON.parse(JSON.stringify(salidasRecientes))}
      alertas={JSON.parse(JSON.stringify(alertas))}
      kpis={kpis}
    />
  )
}
