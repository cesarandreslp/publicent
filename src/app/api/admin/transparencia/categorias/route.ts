import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { transparenciaCatSchema, validateBody } from "@/lib/validations"

// GET - Listar todas las categorías de transparencia
export async function GET() {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const categorias = await prisma.categoriaTransparencia.findMany({
      include: {
        subcategorias: {
          include: {
            _count: {
              select: { items: true },
            },
          },
          orderBy: { orden: "asc" },
        },
      },
      orderBy: { numero: "asc" },
    })

    // Calcular estadísticas de cumplimiento
    const categoriasConEstadisticas = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categorias.map(async (cat: { id: string; [key: string]: unknown }) => {
        const totalItems = await prisma.itemTransparencia.count({
          where: {
            subcategoria: {
              categoriaId: cat.id,
            },
          },
        })

        const itemsCumplidos = await prisma.itemTransparencia.count({
          where: {
            subcategoria: {
              categoriaId: cat.id,
            },
            cumplido: true,
          },
        })

        return {
          ...cat,
          estadisticas: {
            totalItems,
            itemsCumplidos,
            porcentajeCumplimiento:
              totalItems > 0 ? Math.round((itemsCumplidos / totalItems) * 100) : 0,
          },
        }
      })
    )

    return NextResponse.json(categoriasConEstadisticas)
  } catch (error) {
    console.error("Error al obtener categorías:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva categoría de transparencia
export async function POST(request: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const body = await request.json()
    const validated = validateBody(transparenciaCatSchema, body)
    if (!validated.success) return validated.response
    const { numero, nombre, descripcion, icono, codigoITA, esObligatoria } = body

    if (!numero || !nombre) {
      return NextResponse.json(
        { error: "Número y nombre son requeridos" },
        { status: 400 }
      )
    }

    // Generar slug
    const slug = nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const categoria = await prisma.categoriaTransparencia.create({
      data: {
        numero,
        nombre,
        slug,
        descripcion,
        icono,
        codigoITA,
        esObligatoria: esObligatoria ?? true,
        orden: numero,
      },
      include: {
        subcategorias: true,
      },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch (error) {
    console.error("Error al crear categoría:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    )
  }
}
