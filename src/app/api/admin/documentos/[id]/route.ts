import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { documentoUpdateSchema, validateBody } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

// GET - Obtener un documento por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { id } = await params

    const documento = await prisma.documento.findUnique({
      where: { id },
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

    if (!documento) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(documento)
  } catch (error) {
    console.error("Error al obtener documento:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener documento" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un documento
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { id } = await params
    const body = await request.json()
    const validated = validateBody(documentoUpdateSchema, body)
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

    // Verificar que el documento existe
    const existingDoc = await prisma.documento.findUnique({
      where: { id },
    })

    if (!existingDoc) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      )
    }

    const documento = await prisma.documento.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(archivoUrl && { archivoUrl }),
        ...(tipoArchivo && { tipoArchivo }),
        ...(tamanio !== undefined && { tamanio }),
        ...(categoria && { categoria }),
        ...(carpeta !== undefined && { carpeta }),
        ...(publico !== undefined && { publico }),
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

    return NextResponse.json(documento)
  } catch (error) {
    console.error("Error al actualizar documento:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar documento" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un documento
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { id } = await params

    const existingDoc = await prisma.documento.findUnique({
      where: { id },
    })

    if (!existingDoc) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      )
    }

    await prisma.documento.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Documento eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar documento:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al eliminar documento" },
      { status: 500 }
    )
  }
}
