import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import bcrypt from "bcryptjs"
import { restablecerContrasenaSchema, validateBody } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const prisma = await getTenantPrisma()
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      )
    }

    // Buscar token válido
    const tokenRecord = await prisma.tokenRecuperacion.findFirst({
      where: {
        token,
        expires: {
          gt: new Date()
        }
      }
    })

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "El enlace ha expirado o no es válido" },
        { status: 400 }
      )
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Actualizar contraseña del usuario
    await prisma.usuario.update({
      where: { email: tokenRecord.email },
      data: { password: hashedPassword }
    })

    // Eliminar token usado
    await prisma.tokenRecuperacion.delete({
      where: { id: tokenRecord.id }
    })

    return NextResponse.json({ 
      message: "Contraseña actualizada correctamente" 
    })

  } catch (error) {
    console.error("Error restableciendo contraseña:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
