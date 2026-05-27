/**
 * /portal/frisco/[token] — Portal externo del depositario FRISCO.
 *
 * Acceso sin login: el token actúa como credencial de un único usuario.
 * Si el token es inválido, expiró o el módulo no está activo → notFound().
 */

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { resolverAcceso, periodoActual } from "@/lib/frisco-portal"
import PortalDepositarioClient from "./client-page"

export const metadata: Metadata = {
  title: "Portal de depositario — FRISCO",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function PortalDepositarioPage({ params }: { params: Promise<{ token: string }> }) {
  if (!(await isTenantModuleActive(MODULO_IDS.PORTAL_EXTERNO))) notFound()

  const { token } = await params
  const prisma = await getTenantPrisma()
  const acceso = await resolverAcceso(prisma, token)
  if (!acceso) notFound()

  // Registrar el acceso (no bloqueante en caso de error).
  prisma.friscoPortalAcceso.update({
    where: { id: acceso.id },
    data:  { ultimoAccesoEn: new Date(), accesoCount: { increment: 1 } },
  }).catch(() => {})

  const periodo = periodoActual()
  const yaReporto = acceso.depositario.reportes.some(r => r.periodo === periodo)

  const data = JSON.parse(JSON.stringify({
    depositario: acceso.depositario,
    bien:        acceso.depositario.bien,
    reportes:    acceso.depositario.reportes,
    expiraEn:    acceso.expiraEn,
    periodoActual: periodo,
    yaReporto,
  }))

  return <PortalDepositarioClient token={token} data={data} />
}
