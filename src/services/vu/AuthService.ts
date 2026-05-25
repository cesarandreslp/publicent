/**
 * VU - Auth Service
 *
 * En personeriabuga la autenticacion la maneja NextAuth (lib/auth.ts).
 * Este servicio es un shim que conserva la API publica del AuthService
 * original de ventanilla_unica_base, delegando o marcando como NO-OP
 * los metodos que NextAuth ya cubre.
 *
 * Diferencias clave:
 *  - register/login/generateToken/verifyToken: NO portados. Usar el flujo
 *    de NextAuth (signIn, callbacks, sesion) y el JWT propio si se necesita.
 *  - Las gestiones administrativas de usuarios siguen disponibles porque
 *    son operaciones de admin sobre el modelo Usuario, no de autenticacion.
 */

import bcryptjs from 'bcryptjs'
import { getTenantPrisma } from '@/lib/tenant'

export interface RegisterUserInput {
  email: string
  password: string
  nombre: string
  apellido: string
  cargo?: string
  telefono?: string
  rolId: string
}

export class AuthService {
  /**
   * Crea un usuario. No genera sesion ni token — eso lo hace NextAuth.
   */
  async register(input: RegisterUserInput): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const prisma = await getTenantPrisma()
      const existing = await prisma.usuario.findUnique({ where: { email: input.email } })
      if (existing) return { success: false, error: 'El email ya esta registrado' }

      const hash = await bcryptjs.hash(input.password, 10)
      const user = await prisma.usuario.create({
        data: {
          email: input.email,
          password: hash,
          nombre: input.nombre,
          apellido: input.apellido,
          cargo: input.cargo,
          telefono: input.telefono,
          rolId: input.rolId,
          activo: true,
        },
      })
      return { success: true, userId: user.id }
    } catch (error) {
      console.error('[VU/Auth] error register:', error)
      return { success: false, error: 'Error al registrar usuario' }
    }
  }

  /**
   * NO-OP intencional. Use el flujo de NextAuth (signIn) en la capa API.
   */
  async login(): Promise<never> {
    throw new Error('[VU/Auth] login: no usar — el login se maneja via NextAuth (lib/auth)')
  }

  /**
   * NO-OP intencional. NextAuth gestiona JWTs/sesiones internamente.
   */
  async generateToken(): Promise<never> {
    throw new Error('[VU/Auth] generateToken: no usar — usar la sesion de NextAuth')
  }

  /**
   * NO-OP intencional. Use NextAuth `auth()` server-side.
   */
  async verifyToken(): Promise<never> {
    throw new Error('[VU/Auth] verifyToken: no usar — usar `auth()` de NextAuth')
  }

  async findById(userId: string) {
    const prisma = await getTenantPrisma()
    return prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    })
  }

  async findByEmail(email: string) {
    const prisma = await getTenantPrisma()
    return prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    })
  }

  async deactivateUser(userId: string) {
    const prisma = await getTenantPrisma()
    return prisma.usuario.update({ where: { id: userId }, data: { activo: false } })
  }

  async activateUser(userId: string) {
    const prisma = await getTenantPrisma()
    return prisma.usuario.update({ where: { id: userId }, data: { activo: true } })
  }

  /**
   * Cambia la contrasena validando la actual.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const prisma = await getTenantPrisma()
    const user = await prisma.usuario.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: 'Usuario no encontrado' }

    const ok = await bcryptjs.compare(currentPassword, user.password)
    if (!ok) return { success: false, error: 'Contrasena actual incorrecta' }

    const hash = await bcryptjs.hash(newPassword, 10)
    await prisma.usuario.update({ where: { id: userId }, data: { password: hash } })
    return { success: true }
  }

  async listUsers(filters?: { activo?: boolean; rolId?: string }) {
    const prisma = await getTenantPrisma()
    return prisma.usuario.findMany({
      where: { activo: filters?.activo, rolId: filters?.rolId },
      include: { rol: true },
      orderBy: { nombre: 'asc' },
    })
  }
}

export const authService = new AuthService()
