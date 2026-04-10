/**
 * superadmin-auth-edge.ts
 * Solo funciones JWT — 100% Edge-compatible (sin Node.js APIs, sin DB)
 * Importar ÚNICAMENTE desde middleware.ts
 */

import { jwtVerify } from "jose"

const SA_SECRET = new TextEncoder().encode(
  process.env.SUPERADMIN_JWT_SECRET ?? process.env.AUTH_SECRET ?? "fallback-secret-change-me"
)

export const SA_COOKIE_NAME = "sa_token"

export interface SuperAdminPayload {
  id: string
  email: string
  nombre: string
}

export async function verifySAToken(token: string): Promise<SuperAdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SA_SECRET)
    return payload as unknown as SuperAdminPayload
  } catch {
    return null
  }
}
