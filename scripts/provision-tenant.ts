/**
 * provision-tenant.ts — CLI de aprovisionamiento automático de un tenant.
 *
 * Crea TODO de extremo a extremo: base de datos en Neon + esquema + datos base
 * + módulos contratados + registro en la meta-BD.
 *
 * Requisitos de entorno (.env o variables del shell):
 *   NEON_API_KEY            API key de Neon (Account settings → API keys)
 *   META_DATABASE_URL       BD maestra de la plataforma (ya configurada)
 *   SECRETS_ENCRYPTION_KEY  clave de cifrado de la plataforma
 *
 * Uso:
 *   npx tsx scripts/provision-tenant.ts scripts/tenant.example.json
 */

import 'dotenv/config'
import { readFileSync } from 'fs'
import { provisionTenant, type ProvisionParams } from '../src/lib/provisioning/provision'

const configPath = process.argv[2]
if (!configPath) {
  console.error('Uso: npx tsx scripts/provision-tenant.ts <ruta-config.json>')
  console.error('Ejemplo de config: scripts/tenant.example.json')
  process.exit(1)
}

const params = JSON.parse(readFileSync(configPath, 'utf8')) as ProvisionParams

async function main() {
  console.log(`🚀 Aprovisionando tenant: ${params.entidad?.nombre} (${params.entidad?.slug})`)
  console.log(`   Módulos contratados: ${params.modulos?.join(', ') || '(solo obligatorios)'}`)
  const r = await provisionTenant(params)
  console.log('\n✅ TENANT CREADO')
  console.log(`   ID:        ${r.tenantId}`)
  console.log(`   Dominio:   ${r.dominioPrincipal}`)
  console.log(`   BD:        ${r.databaseName}  (Neon project: ${r.projectId})`)
  console.log(`   Módulos:   ${r.modulosActivos.join(', ') || '(solo obligatorios)'}`)
  console.log(`   Admin:     ${r.adminEmail}`)
  console.log(`   Password:  ${r.adminPassword}`)
  console.log('\n⚠  Siguiente: 1) agrega el dominio en Vercel  2) cambia la contraseña tras el primer ingreso.')
}

main().catch((e) => {
  console.error('❌ Error en aprovisionamiento:', e instanceof Error ? e.message : e)
  process.exit(1)
})
