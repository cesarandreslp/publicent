/**
 * seed-onboarding.ts — Siembra catálogos comunes en un tenant
 *
 * Uso:
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-onboarding.ts
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-onboarding.ts --deps
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-onboarding.ts --trd
 *   DATABASE_URL=postgres://... npx tsx scripts/seed-onboarding.ts --terceros
 *
 * Flags:
 *   --deps       Solo dependencias GD
 *   --trd        Solo TRD base (requiere dependencias ya sembradas)
 *   --terceros   Solo terceros del Estado
 *   Sin flags    Todo (dependencias + TRD + terceros)
 */
import { PrismaClient } from "@prisma/client/index.js"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import "dotenv/config"
import {
  seedDependencias,
  seedTrd,
  seedTercerosEstado,
  seedOnboarding,
} from "../src/lib/seeders/onboarding"

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL no definida")

  const pool = new pg.Pool({ connectionString: url })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter } as any)

  const args = process.argv.slice(2)
  const soloDeps     = args.includes('--deps')
  const soloTrd      = args.includes('--trd')
  const soloTerceros = args.includes('--terceros')
  const todoFlag     = !soloDeps && !soloTrd && !soloTerceros

  try {
    if (todoFlag) {
      const r = await seedOnboarding(prisma)
      console.log('✅ Onboarding completo:')
      console.log(`   Dependencias : ${r.dependencias}`)
      console.log(`   Series TRD   : ${r.series}`)
      console.log(`   Subseries    : ${r.subseries}`)
      console.log(`   Tipos doc    : ${r.tiposDoc}`)
      console.log(`   Terceros     : ${r.terceros}`)
    } else {
      if (soloDeps) {
        const r = await seedDependencias(prisma)
        console.log(`✅ Dependencias sembradas: ${r.total}`)
      }
      if (soloTrd) {
        const r = await seedTrd(prisma)
        console.log(`✅ TRD sembrada — series: ${r.series}, subseries: ${r.subseries}, tipos: ${r.tipos}`)
      }
      if (soloTerceros) {
        const r = await seedTercerosEstado(prisma)
        console.log(`✅ Terceros del Estado sembrados: ${r.total}`)
      }
    }
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
