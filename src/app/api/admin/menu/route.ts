import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { menuCreateSchema, validateBody } from "@/lib/validations"

// GET - Obtener estructura del menú
export async function GET(request: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    // Obtener menús principales (sin padre)
    const menus = await prisma.menuPrincipal.findMany({
      where: { padreId: null },
      include: {
        subMenus: {
          include: {
            subMenus: {
              orderBy: { orden: "asc" },
            },
          },
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
      orderBy: { orden: "asc" },
    })

    return NextResponse.json(menus)
  } catch (error) {
    console.error("Error al obtener menús:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener menús" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo ítem de menú
export async function POST(request: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const body = await request.json()
    const validated = validateBody(menuCreateSchema, body)
    if (!validated.success) return validated.response
    const {
      nombre,
      slug,
      icono,
      visible,
      esObligatorio,
      codigoITA,
      padreId,
    } = body

    if (!nombre || !slug) {
      return NextResponse.json(
        { error: "Nombre y slug son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el slug no exista
    const existingMenu = await prisma.menuPrincipal.findUnique({
      where: { slug },
    })

    if (existingMenu) {
      return NextResponse.json(
        { error: "Ya existe un menú con ese slug" },
        { status: 400 }
      )
    }

    // Obtener el siguiente orden
    const maxOrden = await prisma.menuPrincipal.aggregate({
      where: { padreId: padreId || null },
      _max: { orden: true },
    })
    const nuevoOrden = (maxOrden._max.orden || 0) + 1

    const menu = await prisma.menuPrincipal.create({
      data: {
        nombre,
        slug,
        icono,
        orden: nuevoOrden,
        visible: visible ?? true,
        esObligatorio: esObligatorio ?? false,
        codigoITA,
        padreId,
      },
      include: {
        subMenus: true,
        pagina: {
          select: {
            id: true,
            titulo: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(menu, { status: 201 })
  } catch (error) {
    console.error("Error al crear menú:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear menú" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar orden de múltiples menús
export async function PUT(request: NextRequest) {
  try {
    const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError
    const prisma = await getTenantPrisma()

    const body = await request.json()
    const { menus } = body as { menus: { id: string; orden: number; padreId?: string | null }[] }

    if (!Array.isArray(menus)) {
      return NextResponse.json(
        { error: "Se requiere un array de menús" },
        { status: 400 }
      )
    }

    // Actualizar el orden de cada menú
    await prisma.$transaction(
      menus.map((menu: { id: string; orden: number; padreId?: string | null }) =>
        prisma.menuPrincipal.update({
          where: { id: menu.id },
          data: {
            orden: menu.orden,
            ...(menu.padreId !== undefined && { padreId: menu.padreId }),
          },
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
