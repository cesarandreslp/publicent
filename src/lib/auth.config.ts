/**
 * auth.config.ts — Configuración Edge-safe de NextAuth v5
 *
 * IMPORTANTE: Este archivo NO debe importar ningún módulo Node.js
 * (pg, PrismaPg, bcrypt, etc.) porque es usado tanto en el middleware
 * (Edge Runtime) como en el servidor (Node.js Runtime).
 *
 * Los providers con acceso a BD se definen en auth.ts (solo Node.js).
 */
import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  // Los providers reales (Credentials + DB) se añaden en auth.ts.
  // Aquí solo declaramos vacío para que el middleware pueda validar JWTs
  // sin importar código Node.js.
  providers: [],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id        as string
        token.role      = user.role      as string
        token.tenantId  = user.tenantId  as string
        token.tenantSlug = user.tenantSlug as string
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id          = token.id          as string
        session.user.role        = token.role        as string
        session.user.tenantId    = token.tenantId    as string
        session.user.tenantSlug  = token.tenantSlug  as string
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith("/admin")
      const isOnAuth = nextUrl.pathname.startsWith("/login") || 
                       nextUrl.pathname.startsWith("/recuperar-contrasena") ||
                       nextUrl.pathname.startsWith("/restablecer-contrasena")

      if (isOnAdmin) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL("/admin", nextUrl))
      }

      return true
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours
  },
  trustHost: true
}
