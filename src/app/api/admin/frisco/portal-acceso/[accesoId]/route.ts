/**
 * /api/admin/frisco/portal-acceso/[accesoId]
 * DELETE — revoca un acceso (no lo elimina; marca revocadoEn).
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantPrisma } from "@/lib/tenant"
import { requirePortalExterno } from "@/lib/frisco-guard"

type Params = { params: Promise<{ accesoId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const guard = await requirePortalExterno(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (guard.error) return guard.error

  const { accesoId } = await params
  const prisma = await getTenantPrisma()

  try {
    const acceso = await prisma.friscoPortalAcceso.update({
      where: { id: accesoId },
      data:  { revocadoEn: new Date() },
      select: { id: true, revocadoEn: true },
    })
    return NextResponse.json({ acceso })
  } catch (err) {
    if (err instanceof Error && err.message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Acceso no encontrado" }, { status: 404 })
    }
    console.error("[portal-acceso DELETE]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error al revocar" }, { status: 500 })
  }
}
