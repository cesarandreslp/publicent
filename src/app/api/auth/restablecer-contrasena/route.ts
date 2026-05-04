import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import bcrypt from "bcryptjs"
import { restablecerContrasenaSchema, validateBody } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const prisma = await getTenantPrisma()

    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 })
    }

    const validated = validateBody(restablecerContrasenaSchema, rawBody)
    if (!validated.success) return validated.response
    const { token, password } = validated.data

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
