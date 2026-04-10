import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { mipgEvidenciaSchema, validateBody } from "@/lib/validations"

// ─── GET: Listar evidencias (filtrable por indicador o año) ──────────────────

export async function GET(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const { searchParams } = new URL(req.url)
    const indicadorId = searchParams.get("indicadorId")
    const anioVigencia = searchParams.get("anioVigencia")

    const prisma = await getTenantPrisma()
    
    // Construir where clause dinámicamente
    const where: any = {}
    if (indicadorId) where.indicadorId = indicadorId
    if (anioVigencia) where.anioVigencia = parseInt(anioVigencia)

    const evidencias = await prisma.mipgEvidencia.findMany({
      where,
      include: {
        indicador: {
          select: { nombre: true, codigo: true, politica: { select: { nombre: true } } }
        },
        subidoPor: {
          select: { nombre: true, email: true }
        }
      },
      orderBy: [
        { anioVigencia: "desc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json(evidencias)
  } catch (error: any) {
    console.error("[/api/admin/mipg/evidencias] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al listar evidencias" }, { status: 500 })
  }
}

// ─── POST: Registrar nueva evidencia probatoria ──────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await req.json()
    const { nombre, descripcion, archivoUrl, enlaceExterno, anioVigencia, mesVigencia, indicadorId } = data

    if (!nombre || !anioVigencia || !indicadorId) {
      return NextResponse.json(
        { error: "Nombre, Año de Vigencia e Indicador son obligatorios" }, 
        { status: 400 }
      )
    }

    // Debe tener al menos URL de archivo o Enlace externo
    if (!archivoUrl && !enlaceExterno) {
      return NextResponse.json(
        { error: "Debe proporcionar una URL de archivo adjunto o un enlace externo" }, 
        { status: 400 }
      )
    }

    const prisma = await getTenantPrisma()

    const nueva = await prisma.mipgEvidencia.create({
      data: {
        nombre,
        descripcion,
        archivoUrl,
        enlaceExterno,
        anioVigencia: parseInt(anioVigencia),
        mesVigencia: mesVigencia ? parseInt(mesVigencia) : null,
        estado: "PENDIENTE", // Por defecto entra en estado de aprobación
        indicadorId,
        subidoPorId: session.user.id
      }
    })

    return NextResponse.json(nueva, { status: 201 })
  } catch (error: any) {
    console.error("[/api/admin/mipg/evidencias] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al registrar evidencia" }, { status: 500 })
  }
}
