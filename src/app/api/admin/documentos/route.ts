import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import type { CategoriaDocumento } from "@prisma/client"
import { documentoCreateSchema, validateBody } from "@/lib/validations"

// GET - Listar documentos con filtros
export async function GET(request: NextRequest) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const categoria = searchParams.get("categoria") || undefined
    const carpeta = searchParams.get("carpeta") || undefined

    const skip = (page - 1) * limit

    const where = {
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: "insensitive" as const } },
          { descripcion: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(categoria && { categoria: categoria as unknown as CategoriaDocumento }),
      ...(carpeta && { carpeta }),
    }

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        include: {
          subidoPor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.documento.count({ where }),
    ])

    // Obtener estadísticas por categoría
    const estadisticas = await prisma.documento.groupBy({
      by: ["categoria"],
      _count: { id: true },
    })

    return NextResponse.json({
      documentos,
      estadisticas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error al obtener documentos:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener documentos" },
      { status: 500 }
    )
  }
}

// POST - Subir nuevo documento
export async function POST(request: NextRequest) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const body = await request.json()
    const validated = validateBody(documentoCreateSchema, body)
    if (!validated.success) return validated.response
    const {
      nombre,
      descripcion,
      archivoUrl,
      tipoArchivo,
      tamanio,
      categoria,
      carpeta,
      publico,
    } = body

    // Validaciones básicas
    if (!nombre || !archivoUrl || !tipoArchivo || !categoria) {
      return NextResponse.json(
        { error: "Nombre, archivo, tipo y categoría son requeridos" },
        { status: 400 }
      )
    }

    const prisma = await getTenantPrisma()
    const documento = await prisma.documento.create({
      data: {
        nombre,
        descripcion,
        archivoUrl,
        tipoArchivo,
        tamanio,
        categoria,
        carpeta,
        publico: publico ?? true,
        subidoPorId: user.id,
      },
      include: {
        subidoPor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
    })

    return NextResponse.json(documento, { status: 201 })
  } catch (error) {
    console.error("Error al crear documento:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear documento" },
      { status: 500 }
    )
  }
}
