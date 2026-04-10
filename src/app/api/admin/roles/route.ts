import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"

// GET - Listar todos los roles
export async function GET() {
  try {
    const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN'])
    if (error) return error

    const prisma = await getTenantPrisma()

    const roles = await prisma.rol.findMany({
      include: {
        _count: {
          select: { usuarios: true },
        },
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error("Error al obtener roles:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error al obtener roles" },
      { status: 500 }
    )
  }
}
