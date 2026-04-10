import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import { notFound } from "next/navigation"
import RespuestaRadicadoClient from "./client-page"

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Generar Respuesta | Radicado ${params.id}` }
}

export default async function RespuestaRadicadoPage({ params }: { params: { id: string } }) {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  const prisma = await getTenantPrisma()

  // Buscar radicado base (el de Entrada/Interno)
  const radicadoOrigen = await prisma.gdRadicado.findUnique({
    where: { id: params.id },
    include: {
      remitentes: true,
      dependencia: true,
      subserie: { include: { serie: true } }
    }
  })

  // Obtener plantillas activas
  const plantillas = await prisma.gdPlantilla.findMany({
    where: { activa: true },
    orderBy: { createdAt: "asc" }
  })

  // Obtener dependencias para la TRD del nuevo radicado (Salida)
  const dependencias = await prisma.gdTrdDependencia.findMany({
    include: {
      series: {
        include: {
          subseries: {
            include: { tiposDoc: true }
          }
        }
      }
    }
  })

  if (!radicadoOrigen) notFound()

  return <RespuestaRadicadoClient radicadoOrigen={radicadoOrigen as any} plantillas={plantillas} dependencias={dependencias} />
}
