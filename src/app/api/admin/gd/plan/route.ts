/**
 * API: Gestión del Plan del Tenant
 *
 * GET  — Obtener configuración actual del plan
 * PUT  — Actualizar plan (solo SUPER_ADMIN)
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { obtenerPlanConfig, PLAN_DEFAULTS } from "@/lib/plan-guard"
import { gdPlanSchema, validateBody } from "@/lib/validations"

export async function GET() {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const plan = await obtenerPlanConfig()
    return NextResponse.json({ plan })
  } catch (error: any) {
    console.error("[/api/admin/gd/plan] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener plan" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN"])
    if (error) return error

    const body = await req.json()
    const validated = validateBody(gdPlanSchema, body)
    if (!validated.success) return validated.response
    const { nivel } = body

    if (!nivel || !PLAN_DEFAULTS[nivel]) {
      return NextResponse.json({ error: "Nivel de plan no válido" }, { status: 400 })
    }

    const defaults = PLAN_DEFAULTS[nivel]
    const prisma = await getTenantPrisma()

    // Actualizar o crear config
    const existing = await prisma.gdPlanConfig.findFirst({ where: { activo: true } })

    let config
    if (existing) {
      config = await prisma.gdPlanConfig.update({
        where: { id: existing.id },
        data: {
          nivel,
          limiteRadicados: defaults.limiteRadicados,
          limiteSedes: defaults.limiteSedes,
          apiPublica: defaults.apiPublica,
          slaHoras: defaults.slaHoras,
        },
      })
    } else {
      config = await prisma.gdPlanConfig.create({
        data: {
          nivel,
          limiteRadicados: defaults.limiteRadicados,
          limiteSedes: defaults.limiteSedes,
          apiPublica: defaults.apiPublica,
          slaHoras: defaults.slaHoras,
          anioActual: new Date().getFullYear(),
        },
      })
    }

    return NextResponse.json({ config })
  } catch (error: any) {
    console.error("[/api/admin/gd/plan] PUT error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al actualizar plan" }, { status: 500 })
  }
}
