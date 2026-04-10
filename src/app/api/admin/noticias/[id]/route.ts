import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { noticiaUpdateSchema, validateBody } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

// GET - Obtener una noticia por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { id } = await params

    const noticia = await prisma.noticia.findUnique({
      where: { id },
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

    if (!noticia) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error("Error al obtener noticia:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener noticia" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una noticia
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { id } = await params
    const body = await request.json()
    const validated = validateBody(noticiaUpdateSchema, body)
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

    // Verificar que la noticia existe
    const existingNoticia = await prisma.noticia.findUnique({
      where: { id },
    })

    if (!existingNoticia) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      )
    }

    // Generar nuevo slug si cambió el título
    let slug = existingNoticia.slug
    if (titulo && titulo !== existingNoticia.titulo) {
      slug = titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Verificar si el nuevo slug ya existe (excluyendo el actual)
      const existingSlug = await prisma.noticia.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      })
      if (existingSlug) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const noticia = await prisma.noticia.update({
      where: { id },
      data: {
        ...(titulo && { titulo, slug }),
        ...(extracto !== undefined && { extracto }),
        ...(contenido && { contenido }),
        ...(imagenDestacada !== undefined && { imagenDestacada }),
        ...(galeria !== undefined && { galeria }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(estado && { estado }),
        ...(destacada !== undefined && { destacada }),
        ...(fechaPublicacion !== undefined && {
          fechaPublicacion: fechaPublicacion ? new Date(fechaPublicacion) : null,
        }),
        ...(categoriaId !== undefined && { categoriaId }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(etiquetas && {
          etiquetas: {
            set: etiquetas.map((id: string) => ({ id })),
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

    return NextResponse.json(noticia)
  } catch (error) {
    console.error("Error al actualizar noticia:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar noticia" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una noticia
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
    if (error || !user) return error

    const prisma = await getTenantPrisma()

    const { id } = await params

    // Verificar que la noticia existe
    const existingNoticia = await prisma.noticia.findUnique({
      where: { id },
    })

    if (!existingNoticia) {
      return NextResponse.json(
        { error: "Noticia no encontrada" },
        { status: 404 }
      )
    }

    await prisma.noticia.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Noticia eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar noticia:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al eliminar noticia" },
      { status: 500 }
    )
  }
}
