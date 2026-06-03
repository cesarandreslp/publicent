/**
 * POST /api/portal/frisco/[token]/upload
 *
 * Permite al depositario subir un archivo (foto o adjunto) sin credenciales.
 * Validado por token (igual que el reporte). Devuelve la URL pública del archivo.
 *
 * Límites:
 *  - Tipos permitidos: image/*, application/pdf
 *  - Tamaño máximo: 10 MB
 *  - Un archivo por request (campo "file")
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma, getTenantModulos, isTenantModuleActive, MODULO_IDS } from "@/lib/tenant"
import { resolverAcceso } from "@/lib/frisco-portal"
import { getStorageConfig } from "@/lib/modules"
import { uploadFile } from "@/lib/storage"

type Params = { params: Promise<{ token: string }> }

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isTenantModuleActive(MODULO_IDS.PORTAL_EXTERNO))) {
    return NextResponse.json({ error: "Portal no habilitado" }, { status: 404 })
  }

  const { token } = await params
  const prisma = await getTenantPrisma()
  const acceso = await resolverAcceso(prisma, token)
  if (!acceso) {
    return NextResponse.json({ error: "Acceso inválido o expirado" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Formulario inválido" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' requerido" }, { status: 400 })
  }

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipo de archivo no permitido. Se aceptan: imágenes y PDF.` },
      { status: 415 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera el límite de 10 MB" },
      { status: 413 }
    )
  }

  const modulos = await getTenantModulos()
  const storageCfg = getStorageConfig(modulos)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const bienCodigo = acceso.depositario.bien.codigo.replace(/[^a-zA-Z0-9_\-]/g, "_")
  const folder = `frisco/portal/${bienCodigo}`

  const result = await uploadFile(storageCfg, buffer, file.name, file.type, folder)

  return NextResponse.json({ url: result.url, key: result.key, size: result.size })
}
