/**
 * API: Gestión de Festivos Colombia
 *
 * GET  — Lista festivos del año (o los descarga si no existen)
 * POST — Fuerza recarga de festivos desde API externa
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { descargarFestivos } from "@/lib/dias-habiles"
import { gdFestivoSchema, validateBody } from "@/lib/validations"

// GET /api/admin/gd/festivos?anio=2026
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const anio = parseInt(searchParams.get("anio") ?? String(new Date().getFullYear()))

    const prisma = await getTenantPrisma()
    let festivos = await prisma.gdFestivoColombia.findMany({
      where: { anio },
      orderBy: { fecha: "asc" },
    })

    // Si no hay festivos, descargar automáticamente
    if (festivos.length === 0) {
      await descargarFestivos(anio)
      festivos = await prisma.gdFestivoColombia.findMany({
        where: { anio },
        orderBy: { fecha: "asc" },
      })
    }

    return NextResponse.json({ festivos, anio, total: festivos.length })
  } catch (error: any) {
    console.error("[/api/admin/gd/festivos] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener festivos" }, { status: 500 })
  }
}

// POST /api/admin/gd/festivos — forzar recarga
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const body = await req.json()
    const validated = validateBody(gdFestivoSchema, body)
    if (!validated.success) return validated.response
    const anio = body.anio ?? new Date().getFullYear()

    // Limpiar existentes y recargar
    const prisma = await getTenantPrisma()
    await prisma.gdFestivoColombia.deleteMany({ where: { anio } })

    const resultado = await descargarFestivos(anio)

    return NextResponse.json({
      message: `${resultado.length} festivos cargados para ${anio}`,
      total: resultado.length,
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/festivos] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al recargar festivos" }, { status: 500 })
  }
}
