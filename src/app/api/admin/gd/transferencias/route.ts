/**
 * Transferencias Documentales
 *
 * Modelo Prisma: se usa GdExpediente.estado + metadata
 * para rastrear transferencias entre archivos:
 * Gestión → Central → Histórico
 *
 * Este enum nuevo se agrega para la Fase 2.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { gdTransferenciaSchema, validateBody } from "@/lib/validations"

// GET /api/admin/gd/transferencias?estado=ABIERTO|CERRADO|TRANSFERIDO_CENTRAL|TRANSFERIDO_HISTORICO
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get("estado")

    const prisma = await getTenantPrisma()

    // Expedientes que son candidatos a transferencia (cerrados hace más de N años)
    const expedientes = await prisma.gdExpediente.findMany({
      where: estado ? { estado: estado as any } : undefined,
      include: {
        dependencia: { select: { codigo: true, nombre: true } },
        serie: { select: { codigo: true, nombre: true } },
        subserie: {
          select: {
            codigo: true, nombre: true,
            tiempoGestion: true, tiempoCentral: true,
            disposicion: true,
          },
        },
        _count: { select: { radicados: true, indices: true } },
        creador: { select: { nombre: true, apellido: true } },
      },
      orderBy: { fechaApertura: "asc" },
    })

    // Calcular elegibilidad de transferencia
    const ahora = new Date()
    const resultado = expedientes.map(exp => {
      const tiempoGestion = exp.subserie?.tiempoGestion ?? 2
      const tiempoCentral = exp.subserie?.tiempoCentral ?? 3
      const fechaBase = exp.fechaCierre ?? exp.fechaApertura

      const aniosCerrado = (ahora.getTime() - fechaBase.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

      let elegible: "GESTION" | "CENTRAL" | "HISTORICO" | "DISPOSICION_FINAL" = "GESTION"
      if (exp.estado === "CERRADO" && aniosCerrado >= tiempoGestion) {
        elegible = "CENTRAL"
      }
      if (aniosCerrado >= tiempoGestion + tiempoCentral) {
        elegible = "DISPOSICION_FINAL"
      }

      return {
        ...exp,
        aniosCerrado: Math.round(aniosCerrado * 10) / 10,
        elegiblePara: elegible,
        disposicionFinal: exp.subserie?.disposicion ?? "CONSERVACION_TOTAL",
      }
    })

    return NextResponse.json({ expedientes: resultado, total: resultado.length })
  } catch (error: any) {
    console.error("[/api/admin/gd/transferencias] error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener transferencias" }, { status: 500 })
  }
}

// POST /api/admin/gd/transferencias — ejecutar transferencia
// Body: { expedienteIds: string[], destino: "CENTRAL" | "HISTORICO" | "ELIMINACION" }
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const { expedienteIds, destino } = body
    const validated = validateBody(gdTransferenciaSchema, body)
    if (!validated.success) return validated.response
    if (!expedienteIds?.length || !destino) {
      return NextResponse.json({ error: "expedienteIds y destino requeridos" }, { status: 400 })
    }

    const estadosValidos = ["TRANSFERIDO_CENTRAL", "TRANSFERIDO_HISTORICO", "ELIMINADO"]
    const estadoMap: Record<string, string> = {
      CENTRAL: "TRANSFERIDO_CENTRAL",
      HISTORICO: "TRANSFERIDO_HISTORICO",
      ELIMINACION: "ELIMINADO",
    }

    const nuevoEstado = estadoMap[destino]
    if (!nuevoEstado) {
      return NextResponse.json({ error: "Destino no válido" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()

    // Actualizar todos los expedientes
    const resultado = await prisma.gdExpediente.updateMany({
      where: { id: { in: expedienteIds } },
      data: { estado: nuevoEstado as any },
    })

    return NextResponse.json({
      transferidos: resultado.count,
      destino: nuevoEstado,
      mensaje: `${resultado.count} expedientes transferidos a ${destino}`,
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/transferencias] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al ejecutar transferencia" }, { status: 500 })
  }
}
