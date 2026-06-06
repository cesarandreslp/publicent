/**
 * prisma/seed.ts — Siembra de datos iniciales de un tenant.
 *
 * Wrapper de CLI sobre `seedTenant()` (src/lib/seeders/tenant-seed.ts).
 * La identidad del cliente se pasa por variables de entorno — NO hay datos de
 * ninguna entidad concreta hardcodeados. Para sembrar un tenant:
 *
 *   $env:DATABASE_URL='postgres://...'        # BD del tenant
 *   $env:TENANT_NOMBRE='Personería de X'
 *   $env:TENANT_NIT='800.000.000-0'
 *   $env:TENANT_ADMIN_EMAIL='admin@entidad.gov.co'
 *   $env:TENANT_ADMIN_PASSWORD='...'
 *   npm run db:seed
 *
 * (En el futuro, el aprovisionamiento automático del superadmin llamará a
 *  seedTenant() directamente con los datos del contrato, sin este CLI.)
 */

import { PrismaClient } from '@prisma/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'
import { seedTenant, type SeedTenantParams } from '../src/lib/seeders/tenant-seed'

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter }) as any

const val = (k: string): string | undefined => {
  const v = process.env[k]?.trim()
  return v ? v : undefined
}
const def = (k: string, d: string): string => val(k) ?? d

const params: SeedTenantParams = {
  entidad: {
    nombre:      def('TENANT_NOMBRE', 'Entidad Pública (pendiente de configurar)'),
    nombreCorto: def('TENANT_NOMBRE_CORTO', def('TENANT_NOMBRE', 'Entidad')),
    nit:         def('TENANT_NIT', 'NIT-PENDIENTE'),
    slogan:      val('TENANT_SLOGAN'),
  },
  contacto: {
    direccion:    def('TENANT_DIRECCION', 'Dirección pendiente'),
    ciudad:       def('TENANT_CIUDAD', 'Ciudad pendiente'),
    codigoPostal: val('TENANT_CP'),
    telefono:     def('TENANT_TELEFONO', ''),
    email:        def('TENANT_EMAIL', 'contacto@entidad.local'),
    horario:      val('TENANT_HORARIO'),
  },
  admin: {
    email:    def('TENANT_ADMIN_EMAIL', 'admin@entidad.local'),
    password: def('TENANT_ADMIN_PASSWORD', 'CambiarEsteAcceso2026*'),
    nombre:   def('TENANT_ADMIN_NOMBRE', 'Administrador'),
    apellido: def('TENANT_ADMIN_APELLIDO', 'Sistema'),
    cargo:    val('TENANT_ADMIN_CARGO'),
  },
  redes: {
    facebook:  val('TENANT_FACEBOOK'),
    twitter:   val('TENANT_TWITTER'),
    instagram: val('TENANT_INSTAGRAM'),
    youtube:   val('TENANT_YOUTUBE'),
    linkedin:  val('TENANT_LINKEDIN'),
  },
}

async function main() {
  console.log('🌱 Sembrando datos iniciales del tenant...')
  console.log(`   Entidad: ${params.entidad.nombre}`)
  console.log(`   Admin:   ${params.admin.email}`)
  const r = await seedTenant(prisma, params)
  console.log(`✅ Seed completado — roles: ${r.roles}, admin: ${r.adminEmail}`)
  if (!val('TENANT_ADMIN_PASSWORD')) {
    console.log('⚠  Se usó la contraseña por defecto del admin. Cámbiala tras el primer ingreso.')
  }
  if (!val('TENANT_NOMBRE')) {
    console.log('⚠  No se definió TENANT_NOMBRE: el sitio quedó con datos placeholder. Configúralos en /admin/configuracion.')
  }
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
