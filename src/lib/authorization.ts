import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'USER'

/**
 * Verifica si el usuario actual tiene alguno de los roles permitidos.
 * Especialmente útil para Server Actions.
 */
export async function requireRoles(allowedRoles: Role[]) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error('No autenticado')
  }

  const userRole = session.user.role as Role
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error('No autorizado para esta acción')
  }

  return session.user
}

/**
 * Verifica si el usuario actual tiene alguno de los roles permitidos.
 * Especialmente útil para manejadores de rutas API.
 * Devuelve n NextResponse de error si falla, o el usuario si tiene éxito.
 */
export async function checkApiRoles(allowedRoles: Role[]) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }), user: null }
  }

  const userRole = session.user.role as Role
  if (!userRole || !allowedRoles.includes(userRole)) {
    return { error: NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 }), user: null }
  }

  return { error: null, user: session.user }
}
