/**
 * /admin/frisco/bienes/[id] — detalle del bien con sub-tabs:
 * resumen, depositarios, contratos y destinación.
 */

import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import BienDetalleClient from "./client-page"

export const metadata: Metadata = { title: "FRISCO — Detalle de bien" }

export default async function BienPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }

  if (!(await isTenantModuleActive(MODULO_IDS.FRISCO_BIENES))) redirect("/admin")

  const { id } = await params
  const prisma = await getTenantPrisma()

  const bien = await prisma.friscoBien.findUnique({
    where: { id },
    include: {
      depositarios: { orderBy: { fechaAsignacion: "desc" } },
      contratos:    { orderBy: { fechaInicio: "desc" } },
      destinacion:  true,
      expediente:   { select: { id: true, codigo: true, nombre: true } },
      carpetaFisica:{ select: { id: true, codigo: true, titulo: true } },
    },
  })

  if (!bien) notFound()

  const interopActivo = await isTenantModuleActive(MODULO_IDS.FRISCO_INTEROP)
  const portalActivo  = await isTenantModuleActive(MODULO_IDS.PORTAL_EXTERNO)

  const bienSerial = JSON.parse(JSON.stringify(bien))
  return <BienDetalleClient bien={bienSerial} interopActivo={interopActivo} portalActivo={portalActivo} />
}
