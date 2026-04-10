/**
 * Limpia las tablas meta de la BD del tenant (neondb).
 * Ya fueron migradas a metadb.
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Apuntar a neondb (tenant), no a metadb
const tenantUrl = process.env.DATABASE_URL;
const sql = neon(tenantUrl);

async function main() {
  console.log('🧹 Limpiando tablas meta de neondb (BD del tenant)...\n');
  
  // Verificar que las tablas existen antes de borrar
  const tables = await sql`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('tenants', 'superadmins', 'eventos_tenant')
  `;
  
  if (tables.length === 0) {
    console.log('   ℹ️  No hay tablas meta en neondb — ya están limpias');
    return;
  }

  console.log('   Tablas meta encontradas:', tables.map(t => t.tablename).join(', '));
  
  await sql`DROP TABLE IF EXISTS eventos_tenant CASCADE`;
  console.log('   ✅ eventos_tenant eliminada');
  
  await sql`DROP TABLE IF EXISTS superadmins CASCADE`;
  console.log('   ✅ superadmins eliminada');
  
  await sql`DROP TABLE IF EXISTS tenants CASCADE`;
  console.log('   ✅ tenants eliminada');

  // Limpiar enums huérfanos (solo si no los usa el schema del tenant)
  try {
    await sql`DROP TYPE IF EXISTS "PlanTenant" CASCADE`;
    await sql`DROP TYPE IF EXISTS "TipoEntidad" CASCADE`;
    console.log('   ✅ Enums meta eliminados');
  } catch (err) {
    console.log('   ℹ️  Enums no eliminados (posiblemente en uso):', err.message);
  }

  console.log('\n✅ BD del tenant (neondb) limpia — solo contiene datos de la Personería');
}

main().catch(console.error);
