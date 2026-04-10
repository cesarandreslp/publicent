import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import TrdClient from "./client-page"

export const metadata = {
  title: "TRD — Tabla de Retención Documental | Gestor Documental",
  description: "Gestión de Dependencias, Series, Subseries y Tipos Documentales — AGN",
}

export default async function TrdPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])

  const prisma = await getTenantPrisma()

  const dependencias = await prisma.gdTrdDependencia.findMany({
    where: { activa: true },
    include: {
      hijas: {
        where: { activa: true },
        orderBy: { codigo: "asc" },
      },
      series: {
        include: {
          subseries: {
            include: {
              tiposDoc: {
                where: { activo: true },
                orderBy: { nombre: "asc" },
              },
            },
            orderBy: { codigo: "asc" },
          },
        },
        orderBy: { codigo: "asc" },
      },
      _count: { select: { radicados: true, expedientes: true } },
    },
    orderBy: { codigo: "asc" },
  })

  return <TrdClient dependencias={JSON.parse(JSON.stringify(dependencias))} />
}
