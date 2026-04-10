import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkApiRoles } from "@/lib/authorization"
import { previewNumeroRadicado } from "@/lib/gd-consecutivo"
import { GdTipoRadicado } from "@prisma/client"

/**
 * GET /api/admin/gd/consecutivo?tipo=ENTRADA&codigoDep=PERS-01
 * Retorna el preview del próximo número sin consumirlo.
 * Útil para mostrarlo en el formulario antes de guardar.
 */
export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get("tipo") as GdTipoRadicado | null
    const codigoDep = searchParams.get("codigoDep")

    if (!tipo || !codigoDep) {
      return NextResponse.json(
        { error: "Se requieren los parámetros: tipo y codigoDep" },
        { status: 400 }
      )
    }

    const preview = await previewNumeroRadicado(tipo, codigoDep)
    return NextResponse.json({ preview })
  } catch (error: any) {
    console.error("[/api/admin/gd/consecutivo] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al generar preview" }, { status: 500 })
  }
}
