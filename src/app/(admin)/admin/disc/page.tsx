/**
 * /admin/disc — Dashboard de Función Disciplinaria.
 * Tabs: Procesos / Tutelas / Visitas. KPIs de gestión.
 */
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import DiscClient from "./client-page"

export const metadata: Metadata = {
  title: "Función disciplinaria",
  description: "Procesos disciplinarios, tutelas y visitas preventivas",
}

export default async function DiscPage() {
  try {
    await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR", "USER"])
  } catch {
    redirect("/admin")
  }
  const activo = await isTenantModuleActive(MODULO_IDS.FUNCION_DISCIPLINARIA)
  if (!activo) redirect("/admin")

  const prisma = await getTenantPrisma()
  const ahora = new Date()

  const [procesos, tutelas, visitas, total, vencidos, tutelasActivas] = await Promise.all([
    prisma.discProceso.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        instructor: { select: { nombre: true, apellido: true } },
        _count: { select: { actuaciones: true } },
      },
    }),
    prisma.discTutela.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { funcionario: { select: { nombre: true, apellido: true } } },
    }),
    prisma.discVisitaPreventiva.findMany({
      orderBy: { fecha: "desc" },
      take: 100,
      include: { funcionario: { select: { nombre: true, apellido: true } } },
    }),
    prisma.discProceso.count(),
    prisma.discProceso.count({
      where: { estado: { notIn: ["EJECUTORIADO", "ARCHIVADO"] }, fechaVencimiento: { lt: ahora } },
    }),
    prisma.discTutela.count({ where: { estado: { in: ["RECIBIDA", "EN_TRAMITE", "IMPUGNADA", "EN_CUMPLIMIENTO"] } } }),
  ])

  const abiertos = await prisma.discProceso.count({
    where: { estado: { notIn: ["EJECUTORIADO", "ARCHIVADO"] } },
  })

  const procesosLista = procesos.map((p) => ({
    id: p.id,
    numero: p.numero,
    tipo: p.tipo,
    estado: p.estado,
    disciplinadoNombre: p.disciplinadoNombre,
    disciplinadoCargo: p.disciplinadoCargo,
    instructor: p.instructor ? `${p.instructor.nombre} ${p.instructor.apellido}` : null,
    fechaVencimiento: p.fechaVencimiento?.toISOString() ?? null,
    actuaciones: p._count.actuaciones,
  }))

  const tutelasLista = tutelas.map((t) => ({
    id: t.id,
    numero: t.numero,
    accionante: t.accionante,
    accionado: t.accionado,
    derechoVulnerado: t.derechoVulnerado,
    estado: t.estado,
    fechaVencimiento: t.fechaVencimiento?.toISOString() ?? null,
    funcionario: t.funcionario ? `${t.funcionario.nombre} ${t.funcionario.apellido}` : null,
  }))

  const visitasLista = visitas.map((v) => ({
    id: v.id,
    numero: v.numero,
    entidadVisitada: v.entidadVisitada,
    fecha: v.fecha.toISOString(),
    objetivo: v.objetivo,
    estadoSeguimiento: v.estadoSeguimiento,
    funcionario: v.funcionario ? `${v.funcionario.nombre} ${v.funcionario.apellido}` : null,
  }))

  return (
    <DiscClient
      procesos={procesosLista}
      tutelas={tutelasLista}
      visitas={visitasLista}
      kpis={{ total, abiertos, vencidos, tutelasActivas, visitas: visitas.length }}
    />
  )
}
