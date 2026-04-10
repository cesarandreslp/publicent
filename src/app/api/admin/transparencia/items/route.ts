import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { transparenciaItemSchema, validateBody } from "@/lib/validations"

// GET - Listar items de transparencia con filtros
export async function GET(request: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(request.url)
    const categoriaId = searchParams.get("categoriaId")
    const subcategoriaId = searchParams.get("subcategoriaId")
    const cumplido = searchParams.get("cumplido")
    const search = searchParams.get("search")

    const where = {
      ...(subcategoriaId && { subcategoriaId }),
      ...(categoriaId && {
        subcategoria: {
          categoriaId,
        },
      }),
      ...(cumplido !== null && cumplido !== "" && { cumplido: cumplido === "true" }),
      ...(search && {
        OR: [
          { titulo: { contains: search, mode: "insensitive" as const } },
          { codigo: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const items = await prisma.itemTransparencia.findMany({
      where,
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
        documentos: {
          orderBy: { orden: "asc" },
        },
      },
      orderBy: [{ subcategoria: { orden: "asc" } }, { codigo: "asc" }],
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error al obtener items:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener items de transparencia" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo item de transparencia
export async function POST(request: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const body = await request.json()
    const validated = validateBody(transparenciaItemSchema, body)
    if (!validated.success) return validated.response
    const {
      codigo,
      titulo,
      descripcion,
      contenido,
      tipo,
      urlExterna,
      archivoUrl,
      fechaPublicacion,
      subcategoriaId,
      esObligatorio,
      observaciones,
    } = body

    if (!codigo || !titulo || !subcategoriaId) {
      return NextResponse.json(
        { error: "Código, título y subcategoría son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que la subcategoría existe
    const subcategoria = await prisma.subcategoriaTransparencia.findUnique({
      where: { id: subcategoriaId },
    })

    if (!subcategoria) {
      return NextResponse.json(
        { error: "Subcategoría no encontrada" },
        { status: 404 }
      )
    }

    const item = await prisma.itemTransparencia.create({
      data: {
        codigo,
        titulo,
        descripcion,
        contenido,
        tipo: tipo || "TEXTO",
        urlExterna,
        archivoUrl,
        fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : null,
        subcategoriaId,
        esObligatorio: esObligatorio ?? true,
        cumplido: !!(contenido || urlExterna || archivoUrl),
        observaciones,
      },
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
        documentos: true,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Error al crear item:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear item de transparencia" },
      { status: 500 }
    )
  }
}
