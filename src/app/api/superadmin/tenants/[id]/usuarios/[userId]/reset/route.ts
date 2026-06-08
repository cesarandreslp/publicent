/**
 * POST /api/superadmin/tenants/[id]/usuarios/[userId]/reset
 * Restablece la contraseña de un usuario del tenant. Genera una nueva si no se
 * envía y la devuelve una sola vez. Reactiva el usuario.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { getOrCreateTenantClientById } from "@/lib/tenant"
import { randomBytes } from "crypto"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

function generarPassword(): string {
  return randomBytes(9).toString("base64url") + "A1*"
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id, userId } = await params
  let body: { password?: string } = {}
  try { body = await req.json() } catch { /* sin cuerpo: se genera */ }

  try {
    const prisma = await getOrCreateTenantClientById(id)
    const nueva = body.password?.trim() || generarPassword()
    const hashed = await bcrypt.hash(nueva, 12)
    await prisma.usuario.update({ where: { id: userId }, data: { password: hashed, activo: true } })
    return NextResponse.json({ ok: true, password: nueva })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error al restablecer" }, { status: 502 })
  }
}
