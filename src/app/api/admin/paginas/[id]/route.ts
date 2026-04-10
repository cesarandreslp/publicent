import { NextRequest, NextResponse } from "next/server"
import { checkApiRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
  if (error || !user) return error

  const { id } = await params
  const prisma  = await getTenantPrisma()

  const pagina = await prisma.pagina.findUnique({
    where:   { id },
    include: { secciones: { orderBy: { orden: "asc" } } },
  })

  if (!pagina) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  return NextResponse.json(pagina)
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
  if (error || !user) return error

  const { id } = await params
  const body    = await req.json()

  const allowed = ["titulo", "slug", "descripcion", "metaKeywords", "plantilla", "publicada", "imagenDestacada"]
  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Sin campos para actualizar" }, { status: 400 })
  }

  const prisma = await getTenantPrisma()
  try {
    const pagina = await prisma.pagina.update({ where: { id }, data })
    return NextResponse.json(pagina)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al actualizar"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
  if (error || !user) return error

  const { id } = await params
  const prisma  = await getTenantPrisma()
  await prisma.pagina.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
