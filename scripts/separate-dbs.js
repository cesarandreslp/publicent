/**
 * Script de separación de BDs: Meta-DB vs Tenant-DB
 * 
 * Cumplimiento: Ley 1581/2012, Ley 594/2000
 * Cada entidad debe tener su BD completamente aislada.
 * La meta-BD solo contiene registro de tenants (sin datos sensibles).
 */
const pg = require('pg');
require('dotenv').config();

// Conexión directa (sin pooler) para poder crear databases
const DIRECT_URL = process.env.DATABASE_URL
  .replace('-pooler', '') // quitar pooler para conexión directa
  .replace('&channel_binding=require', ''); // channel_binding puede causar issues con CREATE DATABASE

const META_DB_NAME = 'metadb';

async function main() {
  console.log('🏛️  Separación de BDs para cumplimiento normativo colombiano\n');
  
  // ─── Paso 1: Crear la BD meta ──────────────────────────────────────────
  console.log('1️⃣  Creando base de datos "metadb"...');
  
  const adminClient = new pg.Client({ connectionString: DIRECT_URL });
  await adminClient.connect();
  
  try {
    // Verificar si ya existe
    const check = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", [META_DB_NAME]
    );
    
    if (check.rows.length > 0) {
      console.log('   ✅ BD "metadb" ya existe');
    } else {
      await adminClient.query(`CREATE DATABASE ${META_DB_NAME}`);
      console.log('   ✅ BD "metadb" creada');
    }
  } catch (err) {
    if (err.code === '42P04') { // duplicate_database
      console.log('   ✅ BD "metadb" ya existe');
    } else {
      console.error('   ❌ Error:', err.message);
      // En Neon free-tier, puede que no se permita CREATE DATABASE
      // En ese caso, hay que crearla desde el dashboard de Neon
      console.log('\n⚠️  Si el error persiste, crea la BD "metadb" manualmente desde:');
      console.log('   https://console.neon.tech → tu proyecto → Databases → New Database');
      await adminClient.end();
      process.exit(1);
    }
  }
  await adminClient.end();

  // ─── Paso 2: Crear tablas meta en la nueva BD ──────────────────────────
  console.log('\n2️⃣  Creando tablas en "metadb"...');
  
  const metaUrl = DIRECT_URL.replace('/neondb?', `/${META_DB_NAME}?`);
  const metaClient = new pg.Client({ connectionString: metaUrl });
  await metaClient.connect();

  // Enums
  await metaClient.query(`
    DO $$ BEGIN
      CREATE TYPE "TipoEntidad" AS ENUM ('PERSONERIA','CONTRALORIA','ALCALDIA','CONCEJO','GOBERNACION','ASAMBLEA','OTRO');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  await metaClient.query(`
    DO $$ BEGIN
      CREATE TYPE "PlanTenant" AS ENUM ('BASICO','ESTANDAR','PROFESIONAL','ENTERPRISE');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);
  console.log('   ✅ Enums creados');

  // Tabla tenants
  await metaClient.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      slug TEXT UNIQUE NOT NULL,
      codigo TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      nombre_corto TEXT NOT NULL,
      tipo_entidad "TipoEntidad" NOT NULL DEFAULT 'PERSONERIA',
      nit TEXT UNIQUE,
      municipio TEXT NOT NULL,
      departamento TEXT NOT NULL,
      codigo_divipola TEXT,
      dominio_principal TEXT UNIQUE NOT NULL,
      dominio_personalizado TEXT UNIQUE,
      database_url TEXT NOT NULL,
      database_name TEXT NOT NULL DEFAULT 'neondb',
      plan "PlanTenant" NOT NULL DEFAULT 'BASICO',
      activo BOOLEAN NOT NULL DEFAULT true,
      suspendido BOOLEAN NOT NULL DEFAULT false,
      motivo_suspension TEXT,
      fecha_activacion TIMESTAMPTZ,
      fecha_vencimiento TIMESTAMPTZ,
      modulos_activos JSONB NOT NULL DEFAULT '{}',
      email_contacto TEXT NOT NULL DEFAULT '',
      telefono_contacto TEXT,
      nombre_contacto TEXT,
      logo_url TEXT,
      color_primario TEXT,
      color_secundario TEXT,
      creado_por TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('   ✅ Tabla tenants');

  // Tabla superadmins
  await metaClient.query(`
    CREATE TABLE IF NOT EXISTS superadmins (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      activo BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('   ✅ Tabla superadmins');

  // Tabla eventos_tenant
  await metaClient.query(`
    CREATE TABLE IF NOT EXISTS eventos_tenant (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      datos JSONB,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      creado_por TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('   ✅ Tabla eventos_tenant');

  // ─── Paso 3: Insertar tenant de Personería de Buga ─────────────────────
  console.log('\n3️⃣  Registrando tenant Personería de Buga...');
  
  const existing = await metaClient.query(
    "SELECT id FROM tenants WHERE slug = 'personeria-buga'"
  );
  
  // La DB_URL del tenant apunta a neondb (la BD del tenant, no la meta)
  const tenantDbUrl = process.env.DATABASE_URL;
  
  if (existing.rows.length > 0) {
    await metaClient.query(
      "UPDATE tenants SET database_url = $1, dominio_principal = 'personeriabuga.vercel.app' WHERE slug = 'personeria-buga'",
      [tenantDbUrl]
    );
    console.log('   ✅ Tenant actualizado');
  } else {
    await metaClient.query(`
      INSERT INTO tenants (slug, codigo, nombre, nombre_corto, tipo_entidad, municipio, departamento, dominio_principal, database_url, database_name, plan, modulos_activos, email_contacto)
      VALUES (
        'personeria-buga', '76111-001',
        'Personería Municipal de Guadalajara de Buga', 'Personería Buga',
        'PERSONERIA', 'Guadalajara de Buga', 'Valle del Cauca',
        'personeriabuga.vercel.app',
        $1, 'neondb', 'PROFESIONAL',
        '{"sitio_web":{"activo":true},"ventanilla_unica":{"activo":true},"gestion_documental":{"activo":true}}',
        'admin@personeriabuga.gov.co'
      )
    `, [tenantDbUrl]);
    console.log('   ✅ Tenant creado');
  }

  // ─── Paso 4: Verificar ──────────────────────────────────────────────────
  const tenants = await metaClient.query('SELECT id, slug, dominio_principal, plan FROM tenants');
  console.log('\n📋 Tenants en metadb:');
  tenants.rows.forEach(t => console.log(`   ${t.slug} → ${t.dominio_principal} (${t.plan})`));
  
  await metaClient.end();

  // ─── Paso 5: Calcular nueva META_DATABASE_URL ──────────────────────────
  const newMetaUrl = process.env.DATABASE_URL.replace('/neondb?', `/${META_DB_NAME}?`);
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ SEPARACIÓN COMPLETADA');
  console.log('═'.repeat(60));
  console.log('\n📌 Actualiza tus variables de entorno:\n');
  console.log(`META_DATABASE_URL="${newMetaUrl}"`);
  console.log('\n📌 DATABASE_URL queda igual (apunta a neondb del tenant)');
  console.log('\n📌 Estructura resultante:');
  console.log('   metadb  → Solo registro de tenants (meta-plataforma)');
  console.log('   neondb  → Datos Personería de Buga (aislamiento total)');
}

main().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
