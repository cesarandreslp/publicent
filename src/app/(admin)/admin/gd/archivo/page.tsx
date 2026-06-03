import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import ArchivoFisicoClient from "./client-page"

export const metadata = { title: "Archivo Físico | Gestor Documental" }

export default async function ArchivoFisicoPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  const prisma = await getTenantPrisma()

  // Traer todas las carpetas con toda su topología ascendente
  const carpetas = await prisma.gaCarpeta.findMany({
    include: {
      caja: {
        include: {
          entrepano: {
            include: {
              estante: {
                include: {
                  bodega: {
                    include: {
                      piso: {
                        include: { edificio: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      expediente: { select: { codigo: true, nombre: true } },
      prestamos: {
        where: { estado: { in: ["SOLICITADO", "APROBADO", "ENTREGADO"] } },
        include: { solicitante: { select: { nombre: true, apellido: true } } }
      }
    },
    orderBy: { caja: { codigo: "asc" } }
  })

  // Traer expedientes disponibles para asociar
  const expedientes = await prisma.gdExpediente.findMany({
    take: 100,
    orderBy: { createdAt: "desc" }
  })

  // Traer todos los préstamos globales
  const prestamos = await prisma.gaPrestamo.findMany({
    include: {
      carpeta: { select: { codigo: true, titulo: true } },
      solicitante: { select: { nombre: true, apellido: true, email: true } }
    },
    orderBy: { fechaSolicitud: "desc" }
  })

  return <ArchivoFisicoClient carpetas={carpetas as any} expedientes={expedientes as any} prestamos={prestamos as any} />
}
