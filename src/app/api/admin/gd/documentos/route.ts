import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma, getTenantModulos } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { getStorageConfig } from "@/lib/modules"
import { uploadFile } from "@/lib/storage"
import { gdDocumentoSchema, validateBody } from "@/lib/validations"

/**
 * POST /api/admin/gd/documentos
 * Sube un documento y lo asocia a un GdRadicado.
 *
 * Body: FormData con:
 *  - file       → el archivo
 *  - radicadoId → ID del radicado al que pertenece
 *  - esPrincipal → "true" | "false"
 *  - folios     → número de folios
 */
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const radicadoId = formData.get("radicadoId") as string | null
    const esPrincipal = formData.get("esPrincipal") === "true"
    const folios = parseInt((formData.get("folios") as string) ?? "1")

    if (!file || !radicadoId) {
      return NextResponse.json(
        { error: "Se requiere el archivo y el ID del radicado" },
        { status: 400 }
      )
    }

    // Obtener configuración de storage del tenant
    const modulos = await getTenantModulos()
    const storageCfg = getStorageConfig(modulos)

    // Convertir File → Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Subir al proveedor configurado
    const anio = new Date().getFullYear()
    const result = await uploadFile(
      storageCfg,
      buffer,
      file.name,
      file.type || "application/octet-stream",
      `radicados/${anio}/${radicadoId}`
    )

    // Guardar referencia en la BD
    const prisma = await getTenantPrisma()
    const documento = await prisma.gdDocumento.create({
      data: {
        nombre: file.name,
        archivoUrl: result.url,
        esPrincipal,
        folios,
        radicadoId,
        subidoPorId: session.user.id,
      },
    })

    // Actualizar folios del radicado
    await prisma.gdRadicado.update({
      where: { id: radicadoId },
      data: { folios: { increment: esPrincipal ? 0 : folios } },
    })

    // Log de transacción
    await prisma.gdLogTransaccion.create({
      data: {
        accion: "CARGA_DOCUMENTO",
        descripcion: `Documento "${file.name}" (${folios} folios) cargado por ${session.user.name ?? session.user.email}`,
        usuarioId: session.user.id,
        radicadoId,
      },
    })

    return NextResponse.json({ documento, storageKey: result.key }, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/gd/documentos] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al subir el documento" }, { status: 500 })
  }
}
