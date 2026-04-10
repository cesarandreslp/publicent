/**
 * /api/superadmin/auth
 * POST  — login del superadmin
 * DELETE — logout (elimina la cookie)
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { loginSuperAdmin, SA_COOKIE_NAME } from "@/lib/superadmin-auth"
import { superadminAuthSchema, validateBody } from "@/lib/validations"

// ─── POST /api/superadmin/auth ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body
    const validated = validateBody(superadminAuthSchema, body)
    if (!validated.success) return validated.response

    if (!email || !password) {
      return NextResponse.json({ error: "Credenciales requeridas" }, { status: 400 })
    }

    const result = await loginSuperAdmin(email as string, password as string)

    if (!result) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const res = NextResponse.json({
      ok: true,
      admin: { id: result.admin.id, email: result.admin.email, nombre: result.admin.nombre },
    })

    res.cookies.set(SA_COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    })

    return res
  } catch (err) {
    console.error("[SA AUTH POST]", err instanceof Error ? err.message : String(err))
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// ─── DELETE /api/superadmin/auth ─────────────────────────────────────────────

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(SA_COOKIE_NAME)
  return res
}
