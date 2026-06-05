import { notFound, redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import DetalleTutelaClient from "./client-page"

export const metadata = { title: "Detalle de la tutela" }

export default async function DetalleTutelaPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  if (!(await isTenantModuleActive(MODULO_IDS.FUNCION_DISCIPLINARIA))) redirect("/admin")

  const { id } = await params
  const prisma = await getTenantPrisma()
  const t = await prisma.discTutela.findUnique({
    where: { id },
    include: { funcionario: { select: { nombre: true, apellido: true } }, proceso: { select: { id: true, numero: true } } },
  })
  if (!t) notFound()

  return (
    <DetalleTutelaClient
      tutela={{
        id: t.id, numero: t.numero, accionante: t.accionante, accionado: t.accionado,
        derechoVulnerado: t.derechoVulnerado, juzgado: t.juzgado, estado: t.estado,
        fechaRecepcion: t.fechaRecepcion.toISOString(),
        fechaVencimiento: t.fechaVencimiento?.toISOString() ?? null,
        fechaFallo: t.fechaFallo?.toISOString() ?? null,
        falloSentido: t.falloSentido, impugnada: t.impugnada,
        estadoCumplimiento: t.estadoCumplimiento, observaciones: t.observaciones,
        funcionario: t.funcionario ? `${t.funcionario.nombre} ${t.funcionario.apellido}` : null,
        proceso: t.proceso,
      }}
    />
  )
}
