import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import NuevaTutelaClient from "./client-page"

export const metadata = { title: "Nueva tutela" }

export default async function NuevaTutelaPage() {
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
  return <NuevaTutelaClient usuarios={usuarios.map((u) => ({ id: u.id, nombre: `${u.nombre} ${u.apellido}` }))} />
}
