import { NextRequest, NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { usuarioCreateSchema, validateBody } from "@/lib/validations"
import bcrypt from "bcryptjs"

// GET - Listar usuarios
export async function GET(request: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const rolId = searchParams.get("rolId") || undefined
    const activo = searchParams.get("activo")

    const where = {
      ...(search && {
        OR: [
          { nombre: { contains: search, mode: "insensitive" as const } },
          { apellido: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(rolId && { rolId }),
      ...(activo !== null && activo !== "" && { activo: activo === "true" }),
    }

    const usuarios = await prisma.usuario.findMany({
      where,
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
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Error al obtener usuarios:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const body = await request.json()
    const validated = validateBody(usuarioCreateSchema, body)
    if (!validated.success) return validated.response
    const { email, password, nombre, apellido, cargo, telefono, rolId } = validated.data

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      )
    }

    // Verificar que el rol existe
    const rol = await prisma.rol.findUnique({
      where: { id: rolId },
    })

    if (!rol) {
      return NextResponse.json(
        { error: "Rol no encontrado" },
        { status: 404 }
      )
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellido,
        cargo,
        telefono,
        rolId,
      },
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
        createdAt: true,
      },
    })

    return NextResponse.json(usuario, { status: 201 })
  } catch (error) {
    console.error("Error al crear usuario:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}
