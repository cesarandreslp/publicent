/**
 * API: Radicados relacionados (padre/hijo)
 *
 * POST — Vincular un radicado como hijo de otro
 * DELETE — Desvincular un radicado hijo
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { checkApiRoles } from "@/lib/authorization"
import { auth } from "@/lib/auth"
import { idBodySchema, validateBody } from "@/lib/validations"

// POST /api/admin/gd/relacionados
// Body: { radicadoHijoId, radicadoPadreId }
export async function POST(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN", "EDITOR"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { radicadoHijoId, radicadoPadreId } = await req.json()
    if (!radicadoHijoId || !radicadoPadreId) {
      return NextResponse.json(
        { error: "radicadoHijoId y radicadoPadreId son requeridos" },
        { status: 400 }
      )
    }

    if (radicadoHijoId === radicadoPadreId) {
      return NextResponse.json(
        { error: "Un radicado no puede ser padre de sí mismo" },
        { status: 400 }
      )
    }

    const prisma = await getTenantPrisma()

    // Verificar que ambos existen
    const [hijo, padre] = await Promise.all([
      prisma.gdRadicado.findUnique({ where: { id: radicadoHijoId }, select: { id: true, numero: true, padreId: true } }),
      prisma.gdRadicado.findUnique({ where: { id: radicadoPadreId }, select: { id: true, numero: true } }),
    ])

    if (!hijo || !padre) {
      return NextResponse.json({ error: "Radicado no encontrado" }, { status: 404 })
    }

    if (hijo.padreId) {
      return NextResponse.json(
        { error: `El radicado ${hijo.numero} ya tiene un padre asignado` },
        { status: 409 }
      )
    }

    // Prevenir ciclo: verificar que el padre no sea descendiente del hijo
    let ancestro = await prisma.gdRadicado.findUnique({
      where: { id: radicadoPadreId },
      select: { padreId: true },
    })
    while (ancestro?.padreId) {
      if (ancestro.padreId === radicadoHijoId) {
        return NextResponse.json(
          { error: "Vinculación crearía un ciclo en la cadena de radicados" },
          { status: 409 }
        )
      }
      ancestro = await prisma.gdRadicado.findUnique({
        where: { id: ancestro.padreId },
        select: { padreId: true },
      })
    }

    // Vincular
    await prisma.gdRadicado.update({
      where: { id: radicadoHijoId },
      data: { padreId: radicadoPadreId },
    })

    // Log en ambos radicados
    const logData = {
      accion: "VINCULO_PADRE" as const,
      usuarioId: session.user.id,
    }

    await prisma.gdLogTransaccion.createMany({
      data: [
        {
          ...logData,
          radicadoId: radicadoHijoId,
          descripcion: `Vinculado como hijo de ${padre.numero}`,
        },
        {
          ...logData,
          radicadoId: radicadoPadreId,
          descripcion: `Radicado ${hijo.numero} vinculado como hijo`,
        },
      ],
    })

    return NextResponse.json({
      vinculado: true,
      padre: padre.numero,
      hijo: hijo.numero,
    })
  } catch (error: any) {
    console.error("[/api/admin/gd/relacionados] POST error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al vincular radicados" }, { status: 500 })
  }
}

// DELETE /api/admin/gd/relacionados
// Body: { radicadoHijoId }
export async function DELETE(req: NextRequest) {
  try {
    const { error } = await checkApiRoles(["SUPER_ADMIN", "ADMIN"])
    if (error) return error

    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { radicadoHijoId } = await req.json()
    if (!radicadoHijoId) {
      return NextResponse.json({ error: "radicadoHijoId requerido" }, { status: 400 })
    }

    const prisma = await getTenantPrisma()

    const hijo = await prisma.gdRadicado.findUnique({
      where: { id: radicadoHijoId },
      select: { numero: true, padreId: true },
    })

    if (!hijo?.padreId) {
      return NextResponse.json({ error: "Radicado no tiene padre asignado" }, { status: 400 })
    }

    await prisma.gdRadicado.update({
      where: { id: radicadoHijoId },
      data: { padreId: null },
    })

    return NextResponse.json({ desvinculado: true })
  } catch (error: any) {
    console.error("[/api/admin/gd/relacionados] DELETE error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Error al desvincular radicados" }, { status: 500 })
  }
}
