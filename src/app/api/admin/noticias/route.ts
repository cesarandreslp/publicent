import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import type { EstadoPublicacion } from "@prisma/client"
import { noticiaCreateSchema, validateBody } from "@/lib/validations"

// GET - Listar todas las noticias con filtros
export async function GET(request: NextRequest) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const estado = searchParams.get("estado") || undefined
    const categoriaId = searchParams.get("categoriaId") || undefined

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { titulo: { contains: search, mode: "insensitive" as const } },
          { extracto: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(estado && { estado: estado as unknown as EstadoPublicacion }),
      ...(categoriaId && { categoriaId }),
    }

    const [noticias, total] = await Promise.all([
      prisma.noticia.findMany({
        where,
        include: {
          categoria: true,
          creador: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          _count: {
            select: { etiquetas: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.noticia.count({ where }),
    ])

    return NextResponse.json({
      noticias,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener noticias:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener noticias" },
      { status: 500 }
    )
  }
}

// POST - Crear nueva noticia
export async function POST(request: NextRequest) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const body = await request.json()
    const validated = validateBody(noticiaCreateSchema, body)
    if (!validated.success) return validated.response
    const {
      titulo,
      extracto,
      contenido,
      imagenDestacada,
      galeria,
      videoUrl,
      estado,
      destacada,
      fechaPublicacion,
      categoriaId,
      metaTitle,
      metaDescription,
      etiquetas,
    } = body

    // Validaciones básicas
    if (!titulo || !contenido) {
      return NextResponse.json(
        { error: "Título y contenido son requeridos" },
        { status: 400 }
      )
    }

    // Generar slug único
    let slug = titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Verificar si el slug ya existe
    const existingSlug = await prisma.noticia.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const noticia = await prisma.noticia.create({
      data: {
        titulo,
        slug,
        extracto,
        contenido,
        imagenDestacada,
        galeria,
        videoUrl,
        estado: estado || "BORRADOR",
        destacada: destacada || false,
        fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : null,
        categoriaId,
        creadorId: user.id,
        metaTitle,
        metaDescription,
        ...(etiquetas?.length && {
          etiquetas: {
            connect: etiquetas.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        categoria: true,
        creador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        etiquetas: true,
      },
    })

    return NextResponse.json(noticia, { status: 201 })
  } catch (error) {
    console.error("Error al crear noticia:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear noticia" },
      { status: 500 }
    )
  }
}
