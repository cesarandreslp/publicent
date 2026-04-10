import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { sliderCreateSchema, sliderUpdateSchema, validateBody } from "@/lib/validations"

// GET - Listar slides
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(request.url)
    const activo = searchParams.get("activo")

    const where = {
      ...(activo !== null && { activo: activo === "true" }),
    }

    const slides = await prisma.slider.findMany({
      where,
      orderBy: { orden: "asc" },
    })

    return NextResponse.json(slides)
  } catch (error) {
    console.error("Error al obtener slides:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener slides" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo slide
export async function POST(request: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const body = await request.json()
    const validated = validateBody(sliderCreateSchema, body)
    if (!validated.success) return validated.response
    const { titulo, subtitulo, imagenUrl, imagenMovilUrl, enlace, textoBoton, orden, activo, fechaInicio, fechaFin } = validated.data

    // Obtener el siguiente orden si no se especifica
    let nuevoOrden = orden
    if (nuevoOrden === undefined) {
      const maxOrden = await prisma.slider.aggregate({
        _max: { orden: true },
      })
      nuevoOrden = (maxOrden._max.orden || 0) + 1
    }

    const slide = await prisma.slider.create({
      data: {
        titulo,
        subtitulo,
        imagenUrl,
        imagenMovilUrl,
        enlace,
        textoBoton,
        orden: nuevoOrden,
        activo: activo ?? true,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin: fechaFin ? new Date(fechaFin) : null,
      },
    })

    return NextResponse.json(slide, { status: 201 })
  } catch (error) {
    console.error("Error al crear slide:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear slide" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar orden de múltiples slides
export async function PUT(request: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const body = await request.json()
    const { slides } = body as { slides: { id: string; orden: number }[] }

    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { error: "Se requiere un array de slides" },
        { status: 400 }
      )
    }

    // Actualizar el orden de cada slide
    await prisma.$transaction(
      slides.map((slide: { id: string; orden: number }) =>
        prisma.slider.update({
          where: { id: slide.id },
          data: { orden: slide.orden },
        })
      )
    )

    return NextResponse.json({ message: "Orden actualizado correctamente" })
  } catch (error) {
    console.error("Error al actualizar orden:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar orden" },
      { status: 500 }
    )
  }
}
