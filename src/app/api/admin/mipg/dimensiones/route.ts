import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { mipgDimensionSchema, validateBody } from "@/lib/validations"

// ─── GET: Listar todas las dimensiones MIPG con sus políticas ────────────────

export async function GET(req: NextRequest) {
  try {
    // Validar acceso usando el middleware común de roles
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const prisma = await getTenantPrisma()
    const dimensiones = await prisma.mipgDimension.findMany({
      include: {
        politicas: {
          orderBy: { orden: "asc" }
        }
      },
      orderBy: { orden: "asc" }
    })

    return NextResponse.json(dimensiones)
  } catch (error: any) {
    console.error("[/api/admin/mipg/dimensiones] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al listar las dimensiones" }, { status: 500 })
  }
}

// ─── POST: Crear una dimensión MIPG (Carga inicial) ──────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const data = await req.json()
    const { codigo, nombre, descripcion, orden } = data

    if (!codigo || !nombre) {
      return NextResponse.json({ error: "Código y Nombre son obligatorios" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()
    
    // Validar si existe el código
    const existente = await prisma.mipgDimension.findUnique({
      where: { codigo }
    })

    if (existente) {
      return NextResponse.json({ error: "Ya existe una dimensión con este código" }, { status: 400 })
    }

    const nueva = await prisma.mipgDimension.create({
      data: {
        codigo,
        nombre,
        descripcion,
        orden: orden || 0
      }
    })

    return NextResponse.json(nueva, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/mipg/dimensiones] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al crear la dimensión" }, { status: 500 })
  }
}
