/**
 * API: Sincronización con SIGEP
 *
 * GET  — Autocomplete de funcionarios (busca local + SIGEP)
 * POST — Importar planta de personal completa
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkApiRoles } from "@/lib/authorization"
import { buscarFuncionarioPorCedula, buscarFuncionariosPorNombre } from "@/lib/sigep"

// GET /api/admin/gd/funcionarios/sync?q=nombre&cedula=123456
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const cedula = searchParams.get("cedula")
    const q = searchParams.get("q")

    if (cedula) {
      const funcionario = await buscarFuncionarioPorCedula(cedula)
      if (!funcionario) {
        return NextResponse.json({ error: "Funcionario no encontrado" }, { status: 404 })
      }
      return NextResponse.json({ funcionario })
    }

    if (q && q.length >= 3) {
      const funcionarios = await buscarFuncionariosPorNombre(q, 10)
      return NextResponse.json({ funcionarios, total: funcionarios.length })
    }

    return NextResponse.json({ error: "Proporcione 'cedula' o 'q' (mín 3 chars)" }, { status: 400 })
  } catch (error: any) {
    console.error("[/api/admin/gd/funcionarios/sync] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error en búsqueda SIGEP" }, { status: 500 })
  }
}

// POST /api/admin/gd/funcionarios/sync — Importación masiva
export async function POST() {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    // La importación masiva requiere una lista de cédulas de la planta de personal
    // Por ahora, se devuelve un endpoint con instrucciones
    return NextResponse.json({
      message: "Para importar planta de personal, envíe un JSON con { cedulas: string[] }",
      nota: "La importación consultará SIGEP para cada cédula y creará/actualizará el caché local",
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/funcionarios/sync] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error en importación SIGEP" }, { status: 500 })
  }
}
