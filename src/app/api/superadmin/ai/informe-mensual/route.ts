/**
 * POST /api/superadmin/ai/informe-mensual
 *
 * Genera un informe mensual del SaaS usando la API key del SuperAdmin (Groq / Shipu).
 * Agrega estadísticas de todos los tenants y solicita análisis a la IA.
 *
 * Body JSON:
 *   { periodo?: "2026-05" }  — opcional, por defecto el mes actual
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"
import { generarInformeMensual } from "@/lib/superadmin-ai"
import type { TenantResumen } from "@/lib/superadmin-ai"

export async function POST(req: NextRequest) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const periodoInput: string = body.periodo ?? ""

    // Calcular rango del período (mes completo)
    const ahora = new Date()
    let año: number, mes: number

    if (periodoInput && /^\d{4}-\d{2}$/.test(periodoInput)) {
      ;[año, mes] = periodoInput.split("-").map(Number)
    } else {
      año = ahora.getFullYear()
      mes = ahora.getMonth() + 1
    }

    const desde = new Date(año, mes - 1, 1)
    const hasta  = new Date(año, mes, 1) // exclusivo

    const periodoLabel = `${desde.toLocaleString("es-CO", { month: "long", year: "numeric" })}`

    // ── 1. Obtener todos los tenants activos ─────────────────────────────────
    const tenants = await prismaMeta.tenant.findMany({
      where: { activo: true, suspendido: false },
      select: {
        id: true,
        nombre: true,
        slug: true,
        plan: true,
        modulosActivos: true,
      },
    })

    if (tenants.length === 0) {
      return NextResponse.json({ error: "No hay tenants activos para analizar" }, { status: 422 })
    }

    // ── 2. Para cada tenant, obtener estadísticas de su DB ───────────────────
    // Importamos dinámicamente el cliente de tenant para no crear N conexiones globales
    const { getOrCreateTenantClientById } = await import("@/lib/tenant")

    const resumenesPromesas = tenants.map(async (tenant): Promise<TenantResumen> => {
      try {
        const db = await getOrCreateTenantClientById(tenant.id)

        // Radicados del período
        const [totalRadicados, vencidos, enRiesgo, porTipoRaw, tiempos] = await Promise.all([
          db.pQRS.count({
            where: { createdAt: { gte: desde, lt: hasta } },
          }),
          db.pQRS.count({
            where: {
              createdAt:  { gte: desde, lt: hasta },
              estadoSemaforo: "NEGRO",
            },
          }),
          db.pQRS.count({
            where: {
              createdAt:  { gte: desde, lt: hasta },
              estadoSemaforo: "ROJO",
            },
          }),
          db.pQRS.groupBy({
            by:    ["tipo"],
            where: { createdAt: { gte: desde, lt: hasta } },
            _count: { tipo: true },
          }),
          // Promedio de días de respuesta (solo respondidos)
          db.pQRS.findMany({
            where: {
              createdAt: { gte: desde, lt: hasta },
              estado:    "CERRADA",
              fechaRespuesta: { not: null },
            },
            select: { createdAt: true, fechaRespuesta: true },
          }),
        ])

        const porTipo: Record<string, number> = {}
        for (const g of porTipoRaw) {
          porTipo[g.tipo] = g._count.tipo
        }

        let promedioDiasRespuesta: number | null = null
        if (tiempos.length > 0) {
          const sumaMs = tiempos.reduce((acc, r) => {
            const diff = new Date(r.fechaRespuesta!).getTime() - new Date(r.createdAt).getTime()
            return acc + diff
          }, 0)
          promedioDiasRespuesta = +(sumaMs / tiempos.length / 86_400_000).toFixed(1)
        }

        const modulos = Object.entries(
          (tenant.modulosActivos as Record<string, boolean>) ?? {}
        )
          .filter(([, v]) => v)
          .map(([k]) => k)

        return {
          nombre: tenant.nombre,
          slug:   tenant.slug,
          plan:   tenant.plan,
          modulos,
          totalRadicados,
          vencidos,
          enRiesgo,
          porTipo,
          promedioDiasRespuesta,
        }
      } catch (err) {
        // Si el tenant falla (DB caída, schema incompleto), incluir resumen vacío
        console.warn(`[informe-mensual] Tenant ${tenant.slug} falló:`, err)
        return {
          nombre: tenant.nombre,
          slug:   tenant.slug,
          plan:   tenant.plan,
          modulos: [],
          totalRadicados: 0,
          vencidos: 0,
          enRiesgo: 0,
          porTipo: {},
          promedioDiasRespuesta: null,
        }
      }
    })

    const resumenes = await Promise.all(resumenesPromesas)

    // ── 3. Generar informe con IA ─────────────────────────────────────────────
    const informe = await generarInformeMensual(periodoLabel, resumenes)

    // ── 4. Registrar evento de auditoría ──────────────────────────────────────
    await prismaMeta.eventoTenant.create({
      data: {
        tenantId:    tenants[0].id,   // evento asociado al primer tenant (contexto SA)
        tipo:        "CONFIGURACION",
        descripcion: `Informe mensual IA generado por ${session.email} para período ${periodoLabel}`,
        creadoPor:   session.id,
      },
    }).catch(() => {/* no crítico */})

    return NextResponse.json({ informe })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[SA INFORME MENSUAL]", msg)

    if (msg.includes("Sin proveedores")) {
      return NextResponse.json(
        { error: "No hay API keys de IA configuradas. Agrega SUPERADMIN_GROQ_API_KEY o SUPERADMIN_SHIPU_API_KEY en las variables de entorno." },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: "Error interno al generar el informe" }, { status: 500 })
  }
}
