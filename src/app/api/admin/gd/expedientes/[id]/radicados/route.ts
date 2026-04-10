import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { gdExpedienteRadicadoSchema, validateBody } from "@/lib/validations"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError

  const body = await req.json()
    const validated = validateBody(gdExpedienteRadicadoSchema, body)
    if (!validated.success) return validated.response
  const { radicadoId } = body

  if (!radicadoId) return NextResponse.json({ error: "Falta el radicadoId" }, { status: 400 })

  const prisma = await getTenantPrisma()

  const exp = await prisma.gdExpediente.findUnique({ where: { id } })
  if (!exp) return NextResponse.json({ error: "Expediente no encontrado" }, { status: 404 })
  if (exp.estado === "CERRADO") return NextResponse.json({ error: "Expediente ya cerrado" }, { status: 400 })

  // Vincular (relación implícita en prisma)
  await prisma.gdExpediente.update({
    where: { id: exp.id },
    data: {
      radicados: {
        connect: { id: radicadoId }
      }
    }
  })

  // Dejar log en el radicado
  await prisma.gdLogTransaccion.create({
    data: {
      accion: "ARCHIVO",
      descripcion: `Se indexó el radicado al expediente electrónico oficial ${exp.codigo}`,
      radicadoId: radicadoId,
      usuarioId: user!.id
    }
  })

  return NextResponse.json({ success: true })
}
