/**
 * seed-puc.ts — Carga manual del CGC (Catálogo General de Cuentas público,
 * Resolución 533/2015 CGN) y opcionalmente del CCP en un tenant.
 *
 * El catálogo es DISTINTO al PUC privado (Decreto 2650/93) — usamos la
 * misma fuente que la auto-siembra de Superadmin: `src/lib/seeders/*`.
 *
 * Uso:
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-puc.ts            # CGC
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-puc.ts --ccp      # CCP
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-puc.ts --all      # ambos
 */
import { PrismaClient } from "@prisma/client/index.js"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import "dotenv/config"
import { seedCgc } from "../src/lib/seeders/cgc-cuentas"
import { seedCcp } from "../src/lib/seeders/ccp-rubros"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL no definida")

  const flags = process.argv.slice(2)
  const haceCgc = !flags.includes("--ccp") || flags.includes("--all")
  const haceCcp = flags.includes("--ccp") || flags.includes("--all")

  const pool = new pg.Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter }) as any

  if (haceCgc) {
    console.log("📒 Sembrando CGC (Catálogo General de Cuentas público)…")
    const r = await seedCgc(prisma)
    console.log(`   ✅ ${r.total} cuentas en ${r.pasadas} pasada(s)`)
  }
  if (haceCcp) {
    console.log("💰 Sembrando CCP (Catálogo de Clasificación Presupuestal)…")
    const r = await seedCcp(prisma)
    console.log(`   ✅ ${r.total} rubros en ${r.pasadas} pasada(s)`)
  }

  await pool.end()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
