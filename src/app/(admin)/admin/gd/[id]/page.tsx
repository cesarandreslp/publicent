import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import { notFound } from "next/navigation"
import RadicadoDetalleClient from "./client-page"

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Radicado ${params.id} | Gestor Documental` }
}

export default async function RadicadoDetallePage({ params }: { params: { id: string } }) {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])

  const prisma = await getTenantPrisma()

  const radicado = await prisma.gdRadicado.findUnique({
    where: { id: params.id },
    include: {
      dependencia: true,
      subserie: { include: { serie: { include: { dependencia: true } } } },
      tipoDocumental: true,
      tramitador: { select: { id: true, nombre: true, apellido: true, cargo: true, email: true } },
      creador: { select: { id: true, nombre: true, apellido: true } },
      remitentes: true,
      documentos: { orderBy: [{ esPrincipal: "desc" }, { createdAt: "asc" }] },
      transacciones: {
        include: {
          usuario: { select: { nombre: true, apellido: true, cargo: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      pqrs: { select: { id: true, radicado: true, tipo: true, estado: true, asunto: true } },
    },
  })

  if (!radicado) notFound()

  return <RadicadoDetalleClient radicado={radicado as any} />
}
