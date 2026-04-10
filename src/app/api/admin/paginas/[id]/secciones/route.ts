import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { checkApiRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import { idBodySchema, validateBody } from "@/lib/validations"

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/admin/paginas/[id]/secciones — create a new section
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { error: authError, user } = await checkApiRoles(['SUPER_ADMIN', 'ADMIN', 'EDITOR'])
    if (authError) return authError

  const { id: paginaId } = await params
  const body = await req.json()
    const { nombre, tipo, contenido, configuracion, visible, orden } = body
    const validated = validateBody(idBodySchema, body)
    if (!validated.success) return validated.response

  if (!nombre || !tipo) {
    return NextResponse.json({ error: "nombre y tipo son requeridos" }, { status: 400 })
  }

  const prisma = await getTenantPrisma()

  // Check page exists
  const pagina = await prisma.pagina.findUnique({ where: { id: paginaId } })
  if (!pagina) return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })

  // Auto-assign orden if not provided
  let nextOrden = orden ?? 0
  if (nextOrden === 0) {
    const last = await prisma.seccionPagina.findFirst({
      where:   { paginaId },
      orderBy: { orden: "desc" },
      select:  { orden: true },
    })
    nextOrden = (last?.orden ?? -1) + 1
  }

  try {
    const seccion = await prisma.seccionPagina.create({
      data: {
        nombre,
        tipo,
        contenido:    contenido    ?? {},
        configuracion: configuracion ?? null,
        visible:      visible      ?? true,
        orden:        nextOrden,
        paginaId,
      },
    })
    return NextResponse.json(seccion, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al crear sección"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
