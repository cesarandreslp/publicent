/**
 * Cliente Prisma para la BASE DE DATOS MAESTRA (Meta-DB)
 * 
 * Esta BD es única en toda la plataforma y contiene el registro de todos
 * los tenants (entidades públicas) con sus connection strings individuales.
 * 
 * Usa META_DATABASE_URL (distinta a DATABASE_URL de cada tenant).
 */

import { PrismaClient } from '@/generated/meta-client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const metaConnectionString = process.env.META_DATABASE_URL || process.env.DATABASE_URL!

if (!metaConnectionString) {
  throw new Error('META_DATABASE_URL no está definida en las variables de entorno.')
}

const globalForPrismaMeta = globalThis as unknown as {
  prismaMeta: PrismaClient | undefined
}

function createMetaClient(): PrismaClient {
  const pool = new pg.Pool({ connectionString: metaConnectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prismaMeta: PrismaClient =
  globalForPrismaMeta.prismaMeta ?? createMetaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaMeta.prismaMeta = prismaMeta
}

export default prismaMeta
