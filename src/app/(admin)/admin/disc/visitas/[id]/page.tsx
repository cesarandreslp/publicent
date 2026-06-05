import { notFound, redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import DetalleVisitaClient from "./client-page"

export const metadata = { title: "Detalle de la visita preventiva" }

export default async function DetalleVisitaPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  if (!(await isTenantModuleActive(MODULO_IDS.FUNCION_DISCIPLINARIA))) redirect("/admin")

  const { id } = await params
  const prisma = await getTenantPrisma()
  const v = await prisma.discVisitaPreventiva.findUnique({
    where: { id },
    include: { funcionario: { select: { nombre: true, apellido: true } } },
  })
  if (!v) notFound()

  return (
    <DetalleVisitaClient
      visita={{
        id: v.id, numero: v.numero, entidadVisitada: v.entidadVisitada, dependencia: v.dependencia,
        fecha: v.fecha.toISOString(), objetivo: v.objetivo, hallazgos: v.hallazgos,
        recomendaciones: v.recomendaciones, compromisos: v.compromisos,
        fechaSeguimiento: v.fechaSeguimiento?.toISOString() ?? null,
        estadoSeguimiento: v.estadoSeguimiento,
        funcionario: v.funcionario ? `${v.funcionario.nombre} ${v.funcionario.apellido}` : null,
      }}
    />
  )
}
