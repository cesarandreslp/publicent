import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { sliderUpdateSchema, validateBody } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

// GET - Obtener un slide
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const prisma = await getTenantPrisma()
    const { id } = await params

    const slide = await prisma.slider.findUnique({
      where: { id },
    })

    if (!slide) {
      return NextResponse.json(
        { error: "Slide no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Error al obtener slide:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener slide" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un slide
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (error) return error

    const prisma = await getTenantPrisma()
    const { id } = await params
    const body = await request.json()
    const validated = validateBody(sliderUpdateSchema, body)
    if (!validated.success) return validated.response

    const {
      titulo, subtitulo, imagenUrl, imagenMovilUrl, enlace,
      textoBoton, orden, activo, fechaInicio, fechaFin,
    } = validated.data

    const existingSlide = await prisma.slider.findUnique({
      where: { id },
    })

    if (!existingSlide) {
      return NextResponse.json(
        { error: "Slide no encontrado" },
        { status: 404 }
      )
    }

    const slide = await prisma.slider.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo }),
        ...(subtitulo !== undefined && { subtitulo }),
        ...(imagenUrl && { imagenUrl }),
        ...(imagenMovilUrl !== undefined && { imagenMovilUrl }),
        ...(enlace !== undefined && { enlace }),
        ...(textoBoton !== undefined && { textoBoton }),
        ...(orden !== undefined && { orden }),
        ...(activo !== undefined && { activo }),
        ...(fechaInicio !== undefined && {
          fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        }),
        ...(fechaFin !== undefined && {
          fechaFin: fechaFin ? new Date(fechaFin) : null,
        }),
      },
    })

    return NextResponse.json(slide)
  } catch (error) {
    console.error("Error al actualizar slide:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar slide" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un slide
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()
    const { id } = await params

    const existingSlide = await prisma.slider.findUnique({
      where: { id },
    })

    if (!existingSlide) {
      return NextResponse.json(
        { error: "Slide no encontrado" },
        { status: 404 }
      )
    }

    await prisma.slider.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Slide eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar slide:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al eliminar slide" },
      { status: 500 }
    )
  }
}
