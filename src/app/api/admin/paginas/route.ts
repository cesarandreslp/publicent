import { NextRequest, NextResponse } from "next/server"
import { checkApiRoles } from "@/lib/authorization"
import { getTenantPrisma } from "@/lib/tenant"
import { menuCreateSchema, validateBody } from "@/lib/validations"

export async function GET(_req: NextRequest) {
  const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
  if (error || !user) return error

  const prisma  = await getTenantPrisma()
  const paginas = await prisma.pagina.findMany({
    orderBy: { titulo: "asc" },
    include: { secciones: { orderBy: { orden: "asc" } } },
  })
  return NextResponse.json(paginas)
}

export async function POST(req: NextRequest) {
  const { error, user } = await checkApiRoles(['ADMIN', 'SUPER_ADMIN', 'EDITOR'])
  if (error || !user) return error

  const { titulo, slug, descripcion, plantilla, metaKeywords } = await req.json()
  if (!titulo || !slug) {
    return NextResponse.json({ error: "titulo y slug son requeridos" }, { status: 400 })
  }

  const prisma = await getTenantPrisma()
  try {
    const pagina = await prisma.pagina.create({
      data: {
        titulo,
        slug,
        descripcion: descripcion ?? null,
        plantilla:   plantilla   ?? "GENERICA",
        metaKeywords: metaKeywords ?? null,
      },
    })
    return NextResponse.json(pagina, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al crear"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
