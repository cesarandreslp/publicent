import { NextResponse } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { gdExpedienteCreateSchema, validateBody } from "@/lib/validations"

export async function POST(req: Request) {
  const { error, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (error) return error

  try {
    const body = await req.json()
    const validated = validateBody(gdExpedienteCreateSchema, body)
    if (!validated.success) return validated.response
    const { nombre, descripcion, dependenciaId, serieId, subserieId } = validated.data

    const prisma = await getTenantPrisma()

    // Para conformar el código oficial del expediente:
    // [CodDependencia]-[CodSerie]-[CodSubserie]-[AÑO]-[Consecutivo]
    
    const dep = await prisma.gdTrdDependencia.findUnique({ where: { id: dependenciaId } })
    let secCodigo = dep?.codigo || "XX"

    if (serieId) {
      const ser = await prisma.gdTrdSerie.findUnique({ where: { id: serieId } })
      secCodigo += `-${ser?.codigo || "X"}`
    }

    if (subserieId) {
      const sub = await prisma.gdTrdSubserie.findUnique({ where: { id: subserieId } })
      secCodigo += `-${sub?.codigo || "X"}`
    }

    const anio = new Date().getFullYear()
    secCodigo += `-${anio}`

    // Determinar consecutivo actual
    const expedientesAnio = await prisma.gdExpediente.count({
      where: {
        codigo: { startsWith: secCodigo }
      }
    })

    const consecutivoStr = String(expedientesAnio + 1).padStart(4, "0")
    const codigoFinal = `${secCodigo}-${consecutivoStr}`

    // Insertar
    const nuevo = await prisma.gdExpediente.create({
      data: {
        codigo: codigoFinal,
        nombre,
        descripcion,
        dependenciaId,
        serieId: serieId || null,
        subserieId: subserieId || null,
        creadorId: user!.id,
      }
    })

    return NextResponse.json({ success: true, expedienteId: nuevo.id, codigo: nuevo.codigo })

  } catch (err) {
    console.error("Error creando expediente:", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error interno al crear expediente" }, { status: 500 })
  }
}
