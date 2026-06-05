import { notFound, redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { siguientesEstados } from "@/lib/disc-terminos"
import DetalleProcesoClient from "./client-page"

export const metadata = { title: "Detalle del proceso disciplinario" }

export default async function DetalleProcesoPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  if (!(await isTenantModuleActive(MODULO_IDS.FUNCION_DISCIPLINARIA))) redirect("/admin")

  const { id } = await params
  const prisma = await getTenantPrisma()
  const proceso = await prisma.discProceso.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, nombre: true, apellido: true } },
      actuaciones: {
        orderBy: { fecha: "desc" },
        include: { usuario: { select: { nombre: true, apellido: true } } },
      },
      documentos: { orderBy: { createdAt: "desc" } },
      tutelas: { select: { id: true, numero: true, estado: true, accionante: true } },
    },
  })
  if (!proceso) notFound()

  const dto = {
    id: proceso.id,
    numero: proceso.numero,
    tipo: proceso.tipo,
    estado: proceso.estado,
    quejoso: proceso.quejoso,
    anonima: proceso.anonima,
    disciplinadoNombre: proceso.disciplinadoNombre,
    disciplinadoCargo: proceso.disciplinadoCargo,
    disciplinadoEntidad: proceso.disciplinadoEntidad,
    hechos: proceso.hechos,
    normaInfringida: proceso.normaInfringida,
    calificacionFalta: proceso.calificacionFalta,
    sancion: proceso.sancion,
    sancionDetalle: proceso.sancionDetalle,
    fechaQueja: proceso.fechaQueja.toISOString(),
    fechaVencimiento: proceso.fechaVencimiento?.toISOString() ?? null,
    instructor: proceso.instructor ? `${proceso.instructor.nombre} ${proceso.instructor.apellido}` : null,
    actuaciones: proceso.actuaciones.map((a) => ({
      id: a.id, tipo: a.tipo, descripcion: a.descripcion,
      fecha: a.fecha.toISOString(),
      usuario: `${a.usuario.nombre} ${a.usuario.apellido}`,
    })),
    documentos: proceso.documentos.map((d) => ({ id: d.id, nombre: d.nombre, tipo: d.tipo, url: d.url })),
    tutelas: proceso.tutelas,
  }

  return <DetalleProcesoClient proceso={dto} siguientes={siguientesEstados(proceso.estado)} />
}
