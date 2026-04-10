import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { transparenciaItemUpdateSchema, validateBody } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

// GET - Obtener un item por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params

    const item = await prisma.itemTransparencia.findUnique({
      where: { id },
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
    })

    if (!item) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error al obtener item:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener item" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un item
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params
    const body = await request.json()
    const validated = validateBody(transparenciaItemUpdateSchema, body)
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
      fechaActualizacion,
      esObligatorio,
      cumplido,
      observaciones,
    } = body

    // Verificar que el item existe
    const existingItem = await prisma.itemTransparencia.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      )
    }

    // Calcular si está cumplido
    const estaComplemento =
      cumplido !== undefined
        ? cumplido
        : !!(
            (contenido !== undefined ? contenido : existingItem.contenido) ||
            (urlExterna !== undefined ? urlExterna : existingItem.urlExterna) ||
            (archivoUrl !== undefined ? archivoUrl : existingItem.archivoUrl)
          )

    const item = await prisma.itemTransparencia.update({
      where: { id },
      data: {
        ...(codigo && { codigo }),
        ...(titulo && { titulo }),
        ...(descripcion !== undefined && { descripcion }),
        ...(contenido !== undefined && { contenido }),
        ...(tipo && { tipo }),
        ...(urlExterna !== undefined && { urlExterna }),
        ...(archivoUrl !== undefined && { archivoUrl }),
        ...(fechaPublicacion !== undefined && {
          fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : null,
        }),
        fechaActualizacion: new Date(),
        ...(esObligatorio !== undefined && { esObligatorio }),
        cumplido: estaComplemento,
        ...(observaciones !== undefined && { observaciones }),
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

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error al actualizar item:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar item" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un item
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params

    const existingItem = await prisma.itemTransparencia.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      )
    }

    // No permitir eliminar items obligatorios
    if (existingItem.esObligatorio) {
      return NextResponse.json(
        { error: "No se puede eliminar un item obligatorio según la Resolución 1519" },
        { status: 400 }
      )
    }

    await prisma.itemTransparencia.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Item eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar item:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al eliminar item" },
      { status: 500 }
    )
  }
}
