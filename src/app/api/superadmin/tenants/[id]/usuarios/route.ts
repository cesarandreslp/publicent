/**
 * /api/superadmin/tenants/[id]/usuarios
 * GET  — lista los usuarios del tenant (BD del tenant).
 * POST — crea un usuario en el tenant (típicamente el admin). Migra al superadmin
 *        de OSS Innovation la gestión de usuarios que antes solo estaba en el admin
 *        del tenant. La contraseña se genera si no se envía y se devuelve una vez.
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  try {
    const prisma = await getOrCreateTenantClientById(id)
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true, email: true, nombre: true, apellido: true, cargo: true,
        activo: true, rol: { select: { nombre: true } }, createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json({ usuarios })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error al listar usuarios" }, { status: 502 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSASession()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  let body: { email?: string; nombre?: string; apellido?: string; cargo?: string; rolNombre?: string; password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }) }

  if (!body.email || !body.nombre) {
    return NextResponse.json({ error: "Faltan email y nombre" }, { status: 400 })
  }

  try {
    const prisma = await getOrCreateTenantClientById(id)

    const existe = await prisma.usuario.findUnique({ where: { email: body.email } })
    if (existe) return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 400 })

    const rolNombre = body.rolNombre || "SUPER_ADMIN"
    const rol = await prisma.rol.findUnique({ where: { nombre: rolNombre } })
    if (!rol) return NextResponse.json({ error: `Rol "${rolNombre}" no existe en el tenant` }, { status: 400 })

    const generada = !body.password?.trim()
    const password = body.password?.trim() || generarPassword()
    const hashed = await bcrypt.hash(password, 12)

    const usuario = await prisma.usuario.create({
      data: {
        email: body.email, password: hashed, nombre: body.nombre,
        apellido: body.apellido ?? "", cargo: body.cargo ?? null, activo: true, rolId: rol.id,
      },
      select: { id: true, email: true, nombre: true, apellido: true, rol: { select: { nombre: true } } },
    })

    return NextResponse.json({ usuario, passwordGenerada: generada ? password : undefined }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Error al crear usuario" }, { status: 502 })
  }
}
