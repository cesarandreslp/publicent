/**
 * schema-apply.ts — Aplica el esquema completo a una BD de tenant recién creada.
 *
 * Ejecuta `prisma/provision-schema.sql` (DDL completo generado desde el schema de
 * Prisma con `npm run db:provision-sql`) contra la connection string indicada.
 * Usa una conexión directa de `pg` (DDL multi-statement en una sola query).
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import path from 'path'

let cachedSql: string | null = null

function loadSchemaSql(): string {
  if (cachedSql) return cachedSql
  const sqlPath = path.join(process.cwd(), 'prisma', 'provision-schema.sql')
  cachedSql = readFileSync(sqlPath, 'utf8')
  return cachedSql
}

/** Crea todas las tablas/enums/índices del tenant en la BD destino. */
export async function applyProvisionSchema(connectionString: string): Promise<void> {
  const sql = loadSchemaSql()
  const client = new pg.Client({ connectionString })
  await client.connect()
  try {
    await client.query(sql)
  } finally {
    await client.end()
  }
}
