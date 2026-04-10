/**
 * Seed de la META-BD
 * 
 * Pobla el registro de tenants con la Personería de Buga como primer
 * cliente de la plataforma.
 * 
 * Ejecutar con:
 *   npm run meta:seed
 */

import { PrismaClient } from '../../src/generated/meta-client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.META_DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding META-DB...')

  // ──────────────────────────────────────────────────────────────────────────
  // Tenant 1: Personería Municipal de Guadalajara de Buga
  // ──────────────────────────────────────────────────────────────────────────
  const personeriaBuga = await prisma.tenant.upsert({
    where: { slug: 'personeria-buga' },
    update: {},
    create: {
      slug:                 'personeria-buga',
      codigo:               '76111-001',
      nombre:               'Personería Municipal de Guadalajara de Buga',
      nombreCorto:          'Personería de Buga',
      tipoEntidad:          'PERSONERIA',
      nit:                  '890.904.594-1',
      municipio:            'Guadalajara de Buga',
      departamento:         'Valle del Cauca',
      codigoDivipola:       '76111',
      dominioPrincipal:     'personeria-buga.tuplatforma.com',  // ← subdominio gestionado
      dominioPersonalizado: 'personeriabuga.gov.co',             // ← dominio institucional
      databaseUrl:          process.env.DATABASE_URL!,           // ← BD del tenant en Neon
      databaseName:         'personeria_buga_db',
      plan:                 'PROFESIONAL',
      activo:               true,
      suspendido:           false,
      fechaActivacion:      new Date('2026-01-12'),
      modulosActivos: {
        pqrsd:              true,
        gestionDocumental:  true,
        ventanillaUnica:    false,  // ← pendiente de implementar
        reportes:           true,
        noticias:           true,
        transparencia:      true,
      },
      emailContacto:   'admin@personeriabuga.gov.co',
      telefonoContacto: '(602) 228-0000',
      nombreContacto:   'Administrador Técnico',
    },
  })

  console.log(`✅ Tenant creado: ${personeriaBuga.nombre} [${personeriaBuga.id}]`)
  console.log(`   Dominio gestionado:    ${personeriaBuga.dominioPrincipal}`)
  console.log(`   Dominio personalizado: ${personeriaBuga.dominioPersonalizado}`)
  console.log(`   Plan:                  ${personeriaBuga.plan}`)
  console.log('')
  console.log('💡 Para gestionar tenants desde el superadmin, ejecuta:')
  console.log('   npm run meta:studio')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
