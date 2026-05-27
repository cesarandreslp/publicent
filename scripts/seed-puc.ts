/**
 * seed-puc.ts — Carga el Plan Único de Cuentas (CGN) en el tenant actual.
 *
 * Uso:
 *   npx tsx scripts/seed-puc.ts                  # usa DATABASE_URL del .env
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-puc.ts
 *
 * Idempotente: cada cuenta se hace upsert por `codigo`.
 */
import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type CuentaSeed = {
  codigo: string
  nombre: string
  nivel: number
  naturaleza: 'DEBITO' | 'CREDITO'
  tipo: 'BALANCE' | 'RESULTADO' | 'ORDEN'
  permiteMovimientos: boolean
  parent?: string
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL no definida')

  const pool = new pg.Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter }) as any

  const jsonPath = resolve(process.cwd(), 'prisma/seeds/puc-cgn.json')
  const cuentas: CuentaSeed[] = JSON.parse(readFileSync(jsonPath, 'utf8'))

  console.log(`📒 Cargando ${cuentas.length} cuentas del PUC CGN…`)

  const idsPorCodigo = new Map<string, string>()
  const pendientes = [...cuentas]
  let pasada = 0

  while (pendientes.length) {
    pasada++
    const procesarAhora = pendientes.filter(c => !c.parent || idsPorCodigo.has(c.parent))
    if (!procesarAhora.length) {
      throw new Error(`Cuentas con parent inexistente: ${pendientes.map(p => p.codigo).join(', ')}`)
    }

    for (const c of procesarAhora) {
      const parentId = c.parent ? idsPorCodigo.get(c.parent) ?? null : null
      const saved = await prisma.cpPlanCuenta.upsert({
        where: { codigo: c.codigo },
        create: {
          codigo: c.codigo,
          nombre: c.nombre,
          nivel: c.nivel,
          naturaleza: c.naturaleza,
          tipo: c.tipo,
          permiteMovimientos: c.permiteMovimientos,
          parentId,
        },
        update: {
          nombre: c.nombre,
          nivel: c.nivel,
          naturaleza: c.naturaleza,
          tipo: c.tipo,
          permiteMovimientos: c.permiteMovimientos,
          parentId,
        },
      })
      idsPorCodigo.set(c.codigo, saved.id)
    }

    for (const c of procesarAhora) {
      const idx = pendientes.indexOf(c)
      if (idx >= 0) pendientes.splice(idx, 1)
    }
  }

  console.log(`✅ PUC cargado en ${pasada} pasada(s). Total: ${idsPorCodigo.size} cuentas.`)
  await pool.end()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
