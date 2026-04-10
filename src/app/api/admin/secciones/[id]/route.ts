/**
 * /api/admin/secciones/[id]
 * PATCH — actualizar campos de una sección (visible, orden, contenido)
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { checkApiRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import { seccionUpdateSchema, validateBody } from "@/lib/validations"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
  if (error) return error

  const { id } = await params

  try {
    const prisma = await getTenantPrisma()
    const body   = await req.json()

    const validated = validateBody(seccionUpdateSchema, body)
    if (!validated.success) return validated.response

    const data: Record<string, unknown> = {}
    if (validated.data.visible   !== undefined) data.visible   = validated.data.visible
    if (validated.data.orden     !== undefined) data.orden     = validated.data.orden
    if (validated.data.nombre    !== undefined) data.nombre    = validated.data.nombre
    if (validated.data.contenido !== undefined) data.contenido = validated.data.contenido
    if (validated.data.configuracion !== undefined) data.configuracion = validated.data.configuracion

    const seccion = await prisma.seccionPagina.update({ where: { id }, data })
    return NextResponse.json({ seccion })
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    if (code === "P2025") return NextResponse.json({ error: "Sección no encontrada" }, { status: 404 })
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
