import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import NuevoRadicadoClient from "./client-page"

export const metadata = {
  title: "Nuevo Radicado | Gestor Documental",
}

export default async function NuevoRadicadoPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])

  const prisma = await getTenantPrisma()

  // Árbol TRD para el selector
  const dependencias = await prisma.gdTrdDependencia.findMany({
    where: { activa: true },
    include: {
      series: {
        include: {
          subseries: {
            include: { tiposDoc: { where: { activo: true } } },
          },
        },
      },
    },
    orderBy: { codigo: "asc" },
  })

  // Tramitadores disponibles
  const tramitadores = await prisma.usuario.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true, cargo: true },
    orderBy: { nombre: "asc" },
  })

  return (
    <NuevoRadicadoClient
      dependencias={dependencias}
      tramitadores={tramitadores}
    />
  )
}
