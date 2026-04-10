import { requireRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import GestorDocumentalClient from "./client-page"

export const metadata = {
  title: "Gestor Documental | Personería Buga",
  description: "Sistema de Gestión Documental AGN-compatible con TRD, radicación oficial y log auditado",
}

export default async function GestorDocumentalPage() {
  await requireRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])

  const prisma = await getTenantPrisma()

  // KPIs para el dashboard
  const [
    totalRadicados,
    enTramite,
    respondidos,
    entradas,
    salidas,
    ultimos,
    dependencias,
  ] = await Promise.all([
    prisma.gdRadicado.count(),
    prisma.gdRadicado.count({ where: { estado: "EN_TRAMITE" } }),
    prisma.gdRadicado.count({ where: { estado: "RESPONDIDO" } }),
    prisma.gdRadicado.count({ where: { tipo: "ENTRADA" } }),
    prisma.gdRadicado.count({ where: { tipo: "SALIDA" } }),
    prisma.gdRadicado.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        dependencia: { select: { codigo: true, nombre: true } },
        tramitador: { select: { nombre: true, apellido: true } },
        remitentes: { select: { nombre: true } },
      },
    }),
    prisma.gdTrdDependencia.findMany({
      where: { activa: true },
      select: { id: true, codigo: true, nombre: true },
      orderBy: { codigo: "asc" },
    }),
  ])

  const kpis = { totalRadicados, enTramite, respondidos, entradas, salidas }

  // Serializar fechas Date → string para el componente cliente
  const ultimos_serial = JSON.parse(JSON.stringify(ultimos))

  return (
    <GestorDocumentalClient
      kpis={kpis}
      radicadosIniciales={ultimos_serial}
      dependencias={dependencias}
    />
  )
}
