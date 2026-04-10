import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { usuarioUpdateSchema, validateBody } from "@/lib/validations"
import bcrypt from "bcryptjs"

interface Params {
  params: Promise<{ id: string }>
}

// GET - Obtener un usuario por ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()
    const { id } = await params

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        cargo: true,
        telefono: true,
        avatar: true,
        activo: true,
        emailVerificado: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            permisos: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Error al obtener usuario:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un usuario
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()
    const { id } = await params
    const body = await request.json()
    const validated = validateBody(usuarioUpdateSchema, body)
    if (!validated.success) return validated.response
    const { email, password, nombre, apellido, cargo, telefono, rolId, activo } = validated.data

    // Verificar que el usuario existe
    const existingUser = await prisma.usuario.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // Si se cambia el email, verificar que no exista
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.usuario.findUnique({
        where: { email },
      })
      if (emailExists) {
        return NextResponse.json(
          { error: "Ya existe un usuario con ese email" },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {}

    if (email) updateData.email = email
    if (nombre) updateData.nombre = nombre
    if (apellido) updateData.apellido = apellido
    if (cargo !== undefined) updateData.cargo = cargo
    if (telefono !== undefined) updateData.telefono = telefono
    if (rolId) updateData.rolId = rolId
    if (activo !== undefined) updateData.activo = activo

    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        cargo: true,
        telefono: true,
        activo: true,
        rol: {
          select: {
            id: true,
            nombre: true,
          },
        },
        updatedAt: true,
      },
    })

    return NextResponse.json(usuario)
  } catch (error) {
    console.error("Error al actualizar usuario:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar/Desactivar un usuario
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { error, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()
    const { id } = await params

    // No permitir auto-eliminación
    if (user?.id === id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    // En lugar de eliminar, desactivar el usuario
    await prisma.usuario.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ message: "Usuario desactivado correctamente" })
  } catch (error) {
    console.error("Error al eliminar usuario:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}
