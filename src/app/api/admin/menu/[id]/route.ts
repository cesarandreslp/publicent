import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { menuUpdateSchema, validateBody } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

// GET - Obtener un ítem de menú
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params

    const menu = await prisma.menuPrincipal.findUnique({
      where: { id },
      include: {
        subMenus: {
          include: {
            subMenus: true,
          },
          orderBy: { orden: "asc" },
        },
        padre: {
          select: {
            id: true,
            nombre: true,
          },
        },
        pagina: {
          select: {
            id: true,
            titulo: true,
            slug: true,
          },
        },
      },
    })

    if (!menu) {
      return NextResponse.json(
        { error: "Menú no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error("Error al obtener menú:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener menú" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un ítem de menú
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params
    const body = await request.json()
    const validated = validateBody(menuUpdateSchema, body)
    if (!validated.success) return validated.response

    const {
      nombre,
      slug,
      icono,
      orden,
      visible,
      esObligatorio,
      codigoITA,
      padreId,
    } = body

    const existingMenu = await prisma.menuPrincipal.findUnique({
      where: { id },
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: "Menú no encontrado" },
        { status: 404 }
      )
    }

    // Si cambia el slug, verificar que no exista
    if (slug && slug !== existingMenu.slug) {
      const slugExiste = await prisma.menuPrincipal.findUnique({
        where: { slug },
      })
      if (slugExiste) {
        return NextResponse.json(
          { error: "Ya existe un menú con ese slug" },
          { status: 400 }
        )
      }
    }

    const menu = await prisma.menuPrincipal.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(slug && { slug }),
        ...(icono !== undefined && { icono }),
        ...(orden !== undefined && { orden }),
        ...(visible !== undefined && { visible }),
        ...(esObligatorio !== undefined && { esObligatorio }),
        ...(codigoITA !== undefined && { codigoITA }),
        ...(padreId !== undefined && { padreId }),
      },
      include: {
        subMenus: {
          orderBy: { orden: "asc" },
        },
        pagina: {
          select: {
            id: true,
            titulo: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error("Error al actualizar menú:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar menú" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un ítem de menú
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const { id } = await params

    const existingMenu = await prisma.menuPrincipal.findUnique({
      where: { id },
      include: {
        subMenus: true,
      },
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: "Menú no encontrado" },
        { status: 404 }
      )
    }

    // Verificar si es obligatorio
    if (existingMenu.esObligatorio) {
      return NextResponse.json(
        { error: "No se puede eliminar un menú obligatorio (Res. 1519/2020)" },
        { status: 400 }
      )
    }

    // Si tiene submenús, moverlos al padre o hacerlos principales
    if (existingMenu.subMenus.length > 0) {
      await prisma.menuPrincipal.updateMany({
        where: { padreId: id },
        data: { padreId: existingMenu.padreId },
      })
    }

    await prisma.menuPrincipal.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Menú eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar menú:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al eliminar menú" },
      { status: 500 }
    )
  }
}
