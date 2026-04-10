/**
 * prisma.ts
 *
 * ⚠️  MIGRACIÓN A MULTI-TENANT EN CURSO
 *
 * Para código NUEVO (API routes, server components):
 *   → Usar: import { getTenantPrisma } from '@/lib/tenant'
 *           const prisma = await getTenantPrisma()
 *
 * El singleton `prisma` de este archivo apunta a DATABASE_URL (tenant de
 * desarrollo local o el tenant por defecto). Sigue funcionando en desarrollo,
 * pero en producción multi-tenant TODOS los accesos deben ir por getTenantPrisma().
 *
 * Plan de migración:
 *   1. Reemplazar `import { prisma } from '@/lib/prisma'` por `getTenantPrisma()`
 *      en cada API route y server component.
 *   2. Una vez migrado todo el código, este singleton solo servirá internamente
 *      para `getOrCreateTenantClientById('dev-tenant')`.
 */

import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL!

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

function createPrismaClient() {
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

// Re-export del API multi-tenant para facilitar la migración gradual
export { getTenantPrisma, getTenantInfo, isTenantModuleActive } from './tenant'
