/**
 * /api/superadmin/admins
 * GET  — lista los superadmins de la plataforma (OSS Innovation).
 * POST — crea un superadmin. Solo accesible por un superadmin autenticado.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSASession } from "@/lib/superadmin-auth"
import { prismaMeta } from "@/lib/prisma-meta"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function GET() {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const admins = await prismaMeta.superAdmin.findMany({
    select: { id: true, email: true, nombre: true, activo: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json({ admins })
}

export async function POST(req: NextRequest) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  let body: { email?: string; nombre?: string; password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }) }

  if (!body.email || !body.nombre || !body.password) {
    return NextResponse.json({ error: "Faltan email, nombre o contraseña" }, { status: 400 })
  }
  if (body.password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
  }

  const existe = await prismaMeta.superAdmin.findUnique({ where: { email: body.email } })
  if (existe) return NextResponse.json({ error: "Ya existe un superadmin con ese email" }, { status: 400 })

  const admin = await prismaMeta.superAdmin.create({
    data: { email: body.email, nombre: body.nombre, password: await bcrypt.hash(body.password, 12) },
    select: { id: true, email: true, nombre: true, activo: true, createdAt: true },
  })
  return NextResponse.json({ admin }, { status: 201 })
}
