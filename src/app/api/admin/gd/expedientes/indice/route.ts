/**
 * API: Generar Índice Electrónico de un Expediente
 *
 * POST — Genera el índice electrónico (XML + metadatos) y lo guarda en BD
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { generarIndiceElectronico } from "@/lib/indice-electronico"
import { gdIndiceSchema, validateBody } from "@/lib/validations"

// POST /api/admin/gd/expedientes/indice
// Body: { expedienteId }
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const { expedienteId } = body
    const validated = validateBody(gdIndiceSchema, body)
    if (!validated.success) return validated.response
    if (!expedienteId) {
      return NextResponse.json({ error: "expedienteId requerido" }, { status: 400 })
    }

    // Generar índice electrónico
    const resultado = await generarIndiceElectronico(expedienteId, session.user.id)

    // Guardar en BD
    const prisma = await getTenantPrisma()
    const indice = await prisma.gdIndiceElectronico.create({
      data: {
        hashCierre: resultado.hashGlobal,
        documentoUrl: "", // Se actualizará cuando se genere el PDF firmado
        expedienteId,
        firmanteId: session.user.id,
      },
    })

    // Cerrar el expediente si está abierto
    await prisma.gdExpediente.update({
      where: { id: expedienteId },
      data: {
        estado: "CERRADO",
        fechaCierre: new Date(),
      },
    })

    return NextResponse.json({
      indice,
      xmlManifiesto: resultado.xmlManifiesto,
      entradas: resultado.entradas,
      totalDocumentos: resultado.totalDocumentos,
      totalFolios: resultado.totalFolios,
      hashGlobal: resultado.hashGlobal,
      codigoExpediente: resultado.codigoExpediente,
      fechaGeneracion: resultado.fechaGeneracion,
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/expedientes/indice] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: error.message || "Error al generar índice" }, { status: 500 })
  }
}
