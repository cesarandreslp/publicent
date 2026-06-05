import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import NuevaVisitaClient from "./client-page"

export const metadata = { title: "Nueva visita preventiva" }

export default async function NuevaVisitaPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  } catch {
    redirect("/admin")
  }
  if (!(await isTenantModuleActive(MODULO_IDS.FUNCION_DISCIPLINARIA))) redirect("/admin")

  const prisma = await getTenantPrisma()
  const usuarios = await prisma.usuario.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, apellido: true },
    orderBy: { nombre: "asc" },
  })
  return <NuevaVisitaClient usuarios={usuarios.map((u) => ({ id: u.id, nombre: `${u.nombre} ${u.apellido}` }))} />
}
