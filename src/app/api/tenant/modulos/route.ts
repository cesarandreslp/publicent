/**
 * GET /api/tenant/modulos
 *
 * Devuelve la resolución de módulos activos para el tenant actual.
 * El frontend usa este endpoint para adaptar URLs y componentes según la config.
 *
 * Respuesta de ejemplo (ventanillaUnica inactiva):
 * {
 *   "pqrsUrl": "/atencion-ciudadano/pqrsd",
 *   "consultarPqrsUrl": "/atencion-ciudadano/consultar-pqrsd",
 *   "documentalUrl": null,
 *   "modulos": {
 *     "sitio_web": { "activo": true },
 *     "ventanilla_unica": { "activo": false },
 *     "gestion_documental": { "activo": false }
 *   }
 * }
 */

import { NextResponse } from "next/server"
import { getTenantModulos } from "@/lib/tenant"
import { getDocumentalUrl } from "@/lib/module-registry"

export async function GET() {
  try {
    const modulos = await getTenantModulos()

    return NextResponse.json(
      {
        documentalUrl:   getDocumentalUrl(modulos),
        modulos,
      },
      {
        headers: {
          // 5 min de caché en CDN — la config de módulos no cambia frecuentemente
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.error("[/api/tenant/modulos]", error instanceof Error ? error.message : String(error))
    // Fallback seguro: sin módulos adicionales
    return NextResponse.json({
      documentalUrl:    null,
      modulos: null,
    })
  }
}
