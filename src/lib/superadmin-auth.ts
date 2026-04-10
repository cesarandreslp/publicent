/**
 * superadmin-auth.ts — Autenticación del Superadmin (Node.js Runtime only)
 *
 * SEPARADA de la autenticación de tenants.
 * Usa la Meta-BD (SuperAdmin model) y una cookie propia `sa_token`.
 *
 * Para importar en middleware.ts usar superadmin-auth-edge.ts (Edge-safe)
 */

import { SignJWT } from "jose"
import { cookies } from "next/headers"
import { prismaMeta } from "./prisma-meta"
import bcrypt from "bcryptjs"

// Re-exportar tipos y helpers de verificación para server components
export { verifySAToken, SA_COOKIE_NAME, type SuperAdminPayload } from "./superadmin-auth-edge"
import { verifySAToken, SA_COOKIE_NAME, type SuperAdminPayload } from "./superadmin-auth-edge"

// ──────────────────────────────────────────────────────────────────────────────
// Constantes
// ──────────────────────────────────────────────────────────────────────────────

const SA_SECRET = new TextEncoder().encode(
  process.env.SUPERADMIN_JWT_SECRET ?? process.env.AUTH_SECRET ?? "fallback-secret-change-me"
)
const SA_EXPIRY = "8h"

// ──────────────────────────────────────────────────────────────────────────────
// Firma de token
// ──────────────────────────────────────────────────────────────────────────────

export async function signSAToken(payload: SuperAdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SA_EXPIRY)
    .sign(SA_SECRET)
}

// ──────────────────────────────────────────────────────────────────────────────
// Validar credenciales
// ──────────────────────────────────────────────────────────────────────────────

export async function loginSuperAdmin(
  email: string,
  password: string
): Promise<{ token: string; admin: SuperAdminPayload } | null> {
  // 1. Buscar en meta-BD
  const admin = await prismaMeta.superAdmin.findUnique({ where: { email } })

  if (admin && admin.activo) {
    const match = await bcrypt.compare(password, admin.password)
    if (match) {
      const payload: SuperAdminPayload = {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
      }
      return { token: await signSAToken(payload), admin: payload }
    }
  }

  // 2. Fallback ENV para bootstrap inicial (antes de crear el primer superadmin)
  const envEmail = process.env.SUPERADMIN_EMAIL
  const envPassword = process.env.SUPERADMIN_PASSWORD
  if (envEmail && envPassword && email === envEmail && password === envPassword) {
    const payload: SuperAdminPayload = {
      id: "env-superadmin",
      email: envEmail,
      nombre: "Super Administrador",
    }
    return { token: await signSAToken(payload), admin: payload }
  }

  return null
}

// ──────────────────────────────────────────────────────────────────────────────
// Obtener sesión en server components
// ──────────────────────────────────────────────────────────────────────────────

export async function getSASession(): Promise<SuperAdminPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SA_COOKIE_NAME)?.value
  if (!token) return null
  return verifySAToken(token)
}
