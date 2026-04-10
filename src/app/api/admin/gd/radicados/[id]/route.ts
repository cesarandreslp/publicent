import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { GdEstadoRadicado } from "@prisma/client"
import { gdRadicadoUpdateSchema, validateBody } from "@/lib/validations"

// ─── GET: Detalle completo del radicado ─────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const prisma = await getTenantPrisma()

    const radicado = await prisma.gdRadicado.findUnique({
      where: { id },
      include: {
        dependencia: true,
        subserie: { include: { serie: true } },
        tipoDocumental: true,
        tramitador: { select: { id: true, nombre: true, apellido: true, cargo: true, email: true } },
        creador:    { select: { id: true, nombre: true, apellido: true } },
        remitentes: true,
        documentos: { orderBy: [{ esPrincipal: "desc" }, { createdAt: "asc" }] },
        transacciones: {
          include: {
            usuario: { select: { nombre: true, apellido: true, cargo: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        pqrs: { select: { id: true, radicado: true, tipo: true, estado: true } },
      },
    })

    if (!radicado) {
      return NextResponse.json({ error: "Radicado no encontrado" }, { status: 404 })
    }

    return NextResponse.json(radicado)
  } catch (error: any) {
    console.error("[/api/admin/gd/radicados/[id]] GET error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al obtener radicado" }, { status: 500 })
  }
}

// ─── PUT: Actualizar estado / tramitador / observación ───────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const prisma = await getTenantPrisma()
    const data = await req.json()

    const actual = await prisma.gdRadicado.findUnique({
      where: { id },
      select: { estado: true },
    })
    if (!actual) {
      return NextResponse.json({ error: "Radicado no encontrado" }, { status: 404 })
    }

    const { estado, tramitadorId, observacion, accion, descripcionLog } = data

    // Actualizar el radicado
    const actualizado = await prisma.$transaction(async (tx) => {
      const updated = await tx.gdRadicado.update({
        where: { id },
        data: {
          ...(estado ? { estado: estado as GdEstadoRadicado } : {}),
          ...(tramitadorId ? { tramitadorId } : {}),
          ...(observacion !== undefined ? { observacion } : {}),
        },
      })

      // Registrar en el log de transacciones
      await tx.gdLogTransaccion.create({
        data: {
          accion: accion ?? "REASIGNACION",
          descripcion: descripcionLog ?? `Actualización por ${session.user.name ?? session.user.email}`,
          estadoAnterior: actual.estado as GdEstadoRadicado,
          estadoNuevo: (estado as GdEstadoRadicado) ?? actual.estado as GdEstadoRadicado,
          usuarioId: session.user.id,
          radicadoId: id,
        },
      })

      return updated
    })

    return NextResponse.json(actualizado)
  } catch (error: any) {
    console.error("[/api/admin/gd/radicados/[id]] PUT error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al actualizar radicado" }, { status: 500 })
  }
}
