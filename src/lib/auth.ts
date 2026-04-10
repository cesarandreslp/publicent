/**
 * auth.ts — Configuración completa de NextAuth v5 (Node.js Runtime only)
 *
 * Añade el provider Credentials con acceso a la base de datos del tenant.
 * El authorize recibe el request con el header x-tenant-id inyectado
 * por middleware, y usa la BD correcta del tenant activo.
 *
 * NO importar en middleware.ts — usar auth.config.ts allí.
 */
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { getOrCreateTenantClientById } from "./tenant"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email:    { label: "Email",     type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const email    = credentials.email    as string
        const password = credentials.password as string

        // Leer el tenant desde el header inyectado por middleware.ts
        const tenantId   = request.headers.get("x-tenant-id")   ?? "dev-tenant"
        const tenantSlug = request.headers.get("x-tenant-slug") ?? "local"

        try {
          // Obtener el PrismaClient de la BD exclusiva de este tenant
          const prisma = await getOrCreateTenantClientById(tenantId)

          const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { rol: true },
          })

          if (!usuario || !usuario.activo) return null

          const passwordMatch = await bcrypt.compare(password, usuario.password)
          if (!passwordMatch) return null

          return {
            id:          usuario.id,
            email:       usuario.email,
            name:        `${usuario.nombre} ${usuario.apellido}`,
            role:        usuario.rol.nombre,
            image:       usuario.avatar,
            tenantId,
            tenantSlug,
          }
        } catch (error) {
          console.error("[auth] Error en autorización:", error)
          return null
        }
      },
    }),
  ],
})
