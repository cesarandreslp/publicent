/**
 * middleware.ts — Middleware multi-tenant (Edge Runtime)
 *
 * Responsabilidades:
 * 1. Resolver el tenant activo a partir del dominio del request
 *    (subdominio gestionado o dominio personalizado .gov.co)
 * 2. Inyectar x-tenant-id y x-tenant-slug en los headers para que
 *    server components y API routes puedan acceder al tenant sin
 *    necesidad de repetir la resolución
 * 3. Proteger las rutas /admin/* con autenticación JWT (sin BD — solo JWT)
 * 4. Devolver 404 si el dominio no corresponde a ningún tenant registrado
 *
 * NOTA: Usa NextAuth(authConfig) con la config Edge-safe (sin Credentials
 * provider, sin pg, sin PrismaPg). Solo valida el JWT de la cookie.
 */

import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { authConfig } from "@/lib/auth.config"
import { getTenantByDomainEdge } from "@/lib/tenant-edge"
import { verifySAToken, SA_COOKIE_NAME } from "@/lib/superadmin-auth-edge"

// Instancia Edge-safe de NextAuth (solo valida JWT, no toca la BD)
const { auth } = NextAuth(authConfig)

export default auth(async function middleware(req: NextRequest & { auth: { user?: { tenantId?: string } } | null }) {
  const { pathname } = req.nextUrl

  // ──────────────────────────────────────────────────────────────────────────
  // 0. Superadmin — rutas propias de la plataforma, fuera del contexto tenant
  // ──────────────────────────────────────────────────────────────────────────
  const isSAPath =
    pathname.startsWith("/superadmin") ||
    pathname.startsWith("/api/superadmin") ||
    pathname === "/superadmin-login"

  if (isSAPath) {
    const token    = req.cookies.get(SA_COOKIE_NAME)?.value
    const saSession = token ? await verifySAToken(token) : null

    if (!saSession && pathname !== "/superadmin-login") {
      const url = new URL("/superadmin-login", req.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }

    // Si ya está autenticado y va al login, redirigir al dashboard
    if (saSession && pathname === "/superadmin-login") {
      return NextResponse.redirect(new URL("/superadmin", req.url))
    }

    // Pasar un header de identificación para que el root layout omita
    // el shell de tenant (GovBar, Header, Footer, etc.)
    const reqHeaders = new Headers(req.headers)
    reqHeaders.set("x-layout", "superadmin")
    return NextResponse.next({ request: { headers: reqHeaders } })
  }

  const host   = req.headers.get("host") ?? ""
  const tenant = await getTenantByDomainEdge(host)

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Tenant no encontrado → 404
  // ──────────────────────────────────────────────────────────────────────────
  if (!tenant) {
    return new NextResponse(
      JSON.stringify({ error: "Entidad no encontrada en la plataforma." }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    )
  }

  const isAdminRoute = pathname.startsWith("/admin")
  const isAuthRoute  =
    pathname.startsWith("/login") ||
    pathname.startsWith("/recuperar-contrasena") ||
    pathname.startsWith("/restablecer-contrasena")

  const isLoggedIn = !!req.auth?.user

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Protección de rutas administrativas
  // ──────────────────────────────────────────────────────────────────────────
  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.url))
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Inyectar tenant en headers para el resto del pipeline (server/API)
  // ──────────────────────────────────────────────────────────────────────────
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-tenant-id",   tenant.id)
  requestHeaders.set("x-tenant-slug", tenant.slug)

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    /*
     * Aplicar middleware a todas las rutas EXCEPTO:
     * - _next/static (archivos estáticos)
     * - _next/image  (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml
     * - archivos de imagen en /public
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
