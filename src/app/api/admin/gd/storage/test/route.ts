import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantModulos } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { getStorageConfig } from "@/lib/modules"
import { testStorageConnection } from "@/lib/storage"
import { gdStorageTestSchema, validateBody } from "@/lib/validations"

/**
 * POST /api/admin/gd/storage/test
 * Prueba la conexión al storage configurado para el tenant.
 * Usado por el botón "Probar conexión" en el panel de superadmin.
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN"])
    if (error) return error

    const body = await req.json()
    const validated = validateBody(gdStorageTestSchema, body)
    if (!validated.success) return validated.response

    // Permite testear una config enviada en el body (sin guardarla)
    // o usar la config actual del tenant si no se envía nada
    let storageCfg = body.storage
    if (!storageCfg) {
      const modulos = await getTenantModulos()
      storageCfg = getStorageConfig(modulos)
    }

    const result = await testStorageConnection(storageCfg)
    return NextResponse.json(result, { status: result.ok ? 200 : 400 })
  } catch (error: any) {
    console.error("[/api/admin/gd/storage/test] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ ok: false, message: "Error al probar la conexión" }, { status: 500 })
  }
}
