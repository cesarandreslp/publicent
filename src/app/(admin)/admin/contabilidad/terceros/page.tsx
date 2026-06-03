import { getTenantPrisma } from "@/lib/tenant"
import { requireContabilidad } from "@/lib/frisco-guard"
import { redirect } from "next/navigation"
import TercerosClient from "./client-page"

export const metadata = { title: "Terceros — Contabilidad" }

export default async function TercerosPage() {
  const guard = await requireContabilidad(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'USER'])
  if (guard.error) redirect("/admin")

  const prisma = await getTenantPrisma()
  const terceros = await prisma.cpAuxiliarTercero.findMany({
    orderBy: { razonSocial: "asc" },
  })

  return <TercerosClient terceros={terceros} />
}
