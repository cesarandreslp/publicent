import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { categoriaNotiSchema, validateBody } from "@/lib/validations"

// GET - Listar todas las categorías de noticias
export async function GET() {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const categorias = await prisma.categoriaNoticias.findMany({
      include: {
        _count: {
          select: { noticias: true },
        },
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json(categorias)
  } catch (error) {
    console.error("Error al obtener categorías:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const body = await request.json()
    const validated = validateBody(categoriaNotiSchema, body)
    if (!validated.success) return validated.response
    const { nombre, descripcion, color } = body

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
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

    // Verificar si ya existe
    const existing = await prisma.categoriaNoticias.findFirst({
      where: {
        OR: [{ nombre }, { slug }],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoriaNoticias.create({
      data: {
        nombre,
        slug,
        descripcion,
        color,
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
