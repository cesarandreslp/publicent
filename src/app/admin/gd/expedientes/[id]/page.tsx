import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import { notFound } from "next/navigation"
import ExpedienteDetalleClient from "./client-page"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Expediente | Gestor Documental` }
}

export default async function ExpedienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  const prisma = await getTenantPrisma()

  const expediente = await prisma.gdExpediente.findUnique({
    where: { id },
    include: {
      creador: { select: { nombre: true, apellido: true } },
      dependencia: true,
      serie: true,
      subserie: true,
      indices: {
        include: { firmante: { select: { nombre: true, apellido: true, cargo: true } } },
        orderBy: { fechaCreacion: "desc" }
      },
      radicados: {
        include: {
          tramitador: { select: { nombre: true, apellido: true } },
          documentos: true
        },
        orderBy: { createdAt: "asc" }
      }
    }
  })

  // Obtener radicados disponibles que aún NO están en este expediente para poder anexar
  const radicadosDisponibles = await prisma.gdRadicado.findMany({
    where: { expedientes: { none: { id } } },
    take: 50,
    orderBy: { createdAt: "desc" }
  })

  if (!expediente) notFound()

  return <ExpedienteDetalleClient expediente={expediente as any} radicadosDisponibles={radicadosDisponibles} />
}
