import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { mipgPoliticaSchema, validateBody } from "@/lib/validations"

// ─── GET: Listar todas las políticas (opcional filtra por dimension) ─────────

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const dimensionId = searchParams.get("dimensionId")

    const prisma = await getTenantPrisma()
    
    const politicas = await prisma.mipgPolitica.findMany({
      where: dimensionId ? { dimensionId } : undefined,
      include: {
        dimension: true,
        indicadores: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: [
        { dimension: { orden: "asc" } },
        { orden: "asc" }
      ]
    })

    return NextResponse.json(politicas)
  } catch (error: any) {
    console.error("[/api/admin/mipg/politicas] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al listar políticas" }, { status: 500 })
  }
}

// ─── POST: Crear una política MIPG ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const data = await req.json()
    const { codigo, nombre, descripcion, orden, dimensionId } = data

    if (!codigo || !nombre || !dimensionId) {
      return NextResponse.json(
        { error: "Código, Nombre y DimensionId son obligatorios" }, 
        { status: 400 }
      )
    }

    const prisma = await getTenantPrisma()
    
    const existente = await prisma.mipgPolitica.findUnique({
      where: { codigo }
    })

    if (existente) {
      return NextResponse.json({ error: "Ya existe una política con este código" }, { status: 400 })
    }

    const nueva = await prisma.mipgPolitica.create({
      data: {
        codigo,
        nombre,
        descripcion,
        orden: orden || 0,
        dimensionId
      }
    })

    return NextResponse.json(nueva, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/mipg/politicas] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al crear la política" }, { status: 500 })
  }
}
