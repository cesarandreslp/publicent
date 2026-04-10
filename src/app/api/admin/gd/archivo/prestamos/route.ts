import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { gdPrestamoSchema, validateBody } from "@/lib/validations"

export async function POST(req: Request) {
  const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError

  try {
    const body = await req.json()
    const validated = validateBody(gdPrestamoSchema, body)
    if (!validated.success) return validated.response
    const { carpetaId } = body

    if (!carpetaId) return NextResponse.json({ error: "Faltan la carpetaId" }, { status: 400 })

    const prisma = await getTenantPrisma()

    const check = await prisma.gaPrestamo.findFirst({
      where: { carpetaId, estado: { in: ["SOLICITADO", "APROBADO", "ENTREGADO"] } }
    })

    if (check) return NextResponse.json({ error: "La carpeta ya se encuentra en proceso de préstamo activo." }, { status: 400 })

    const p = await prisma.gaPrestamo.create({
      data: {
        carpetaId,
        solicitanteId: user!.id
      }
    })

    return NextResponse.json({ success: true, prestamoId: p.id })

  } catch (error: any) {
    console.error("Error solicitando prestamo:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
