import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { sendPasswordResetEmail } from "@/lib/mail"
import crypto from "crypto"
import { recuperarContrasenaSchema, validateBody } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const prisma = await getTenantPrisma()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      )
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    })

    // Siempre retornar éxito para no revelar si el email existe
    if (!usuario) {
      return NextResponse.json({ 
        message: "Si el email existe, recibirás un enlace de recuperación" 
      })
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hora

    // Eliminar tokens anteriores del usuario
    await prisma.tokenRecuperacion.deleteMany({
      where: { email }
    })

    // Crear nuevo token
    await prisma.tokenRecuperacion.create({
      data: {
        email,
        token,
        expires
      }
    })

    // Enviar email
    const result = await sendPasswordResetEmail(
      email, 
      token, 
      `${usuario.nombre} ${usuario.apellido}`
    )

    if (!result.success) {
      console.error("Error enviando email de recuperación:", result.error)
    }

    return NextResponse.json({ 
      message: "Si el email existe, recibirás un enlace de recuperación" 
    })

  } catch (error) {
    console.error("Error en recuperación de contraseña:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
