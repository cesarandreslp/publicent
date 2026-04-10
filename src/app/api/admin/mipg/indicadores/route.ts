import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { mipgIndicadorSchema, validateBody } from "@/lib/validations"

// ─── GET: Listar todos los indicadores (filtro por politicaId) ───────────────

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const politicaId = searchParams.get("politicaId")

    const prisma = await getTenantPrisma()
    const indicadores = await prisma.mipgIndicador.findMany({
      where: politicaId ? { politicaId } : undefined,
      include: {
        politica: {
          include: { dimension: true }
        },
        evidencias: {
          select: { id: true, nombre: true, anioVigencia: true, estado: true }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json(indicadores)
  } catch (error: any) {
    console.error("[/api/admin/mipg/indicadores] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al listar indicadores" }, { status: 500 })
  }
}

// ─── POST: Crear un indicador MIPG ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const data = await req.json()
    const { codigo, nombre, descripcion, formula, metaAnual, tipoMedicion, politicaId } = data

    if (!codigo || !nombre || !politicaId) {
      return NextResponse.json(
        { error: "Código, Nombre y PoliticaId son obligatorios" }, 
        { status: 400 }
      )
    }

    const prisma = await getTenantPrisma()

    const nuevo = await prisma.mipgIndicador.create({
      data: {
        codigo,
        nombre,
        descripcion,
        formula,
        metaAnual: metaAnual !== undefined ? Number(metaAnual) : null,
        tipoMedicion: tipoMedicion || "PORCENTAJE",
        politicaId
      }
    })

    return NextResponse.json(nuevo, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/mipg/indicadores] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al crear el indicador" }, { status: 500 })
  }
}
