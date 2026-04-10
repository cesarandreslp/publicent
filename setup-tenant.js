const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.META_DATABASE_URL);

async function main() {
  console.log('📦 Creando tablas meta si no existen...\n');

  // Crear enum TipoEntidad
  await sql`
    DO $$ BEGIN
      CREATE TYPE "TipoEntidad" AS ENUM ('PERSONERIA','CONTRALORIA','ALCALDIA','CONCEJO','GOBERNACION','ASAMBLEA','OTRO');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  console.log('✅ Enum TipoEntidad');

  // Crear enum PlanTenant
  await sql`
    DO $$ BEGIN
      CREATE TYPE "PlanTenant" AS ENUM ('BASICO','ESTANDAR','PROFESIONAL','ENTERPRISE');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `;
  console.log('✅ Enum PlanTenant');

  // Crear tabla tenants
  await sql`
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
  `;
  console.log('✅ Tabla tenants');

  // Crear tabla superadmins
  await sql`
    CREATE TABLE IF NOT EXISTS superadmins (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      activo BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ Tabla superadmins');

  // Crear tabla eventos_tenant
  await sql`
    CREATE TABLE IF NOT EXISTS eventos_tenant (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      datos JSONB,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      creado_por TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log('✅ Tabla eventos_tenant');

  // Insertar tenant de la Personería de Buga
  console.log('\n📌 Insertando tenant Personería Buga...');
  const existing = await sql`SELECT id FROM tenants WHERE slug = 'personeria-buga'`;
  if (existing.length > 0) {
    await sql`UPDATE tenants SET dominio_principal = 'personeriabuga.vercel.app' WHERE slug = 'personeria-buga'`;
    console.log('✅ Tenant actualizado con dominio de Vercel');
  } else {
    await sql`
      INSERT INTO tenants (slug, codigo, nombre, nombre_corto, tipo_entidad, municipio, departamento, dominio_principal, database_url, database_name, plan, modulos_activos, email_contacto)
      VALUES (
        'personeria-buga',
        '76111-001',
        'Personería Municipal de Guadalajara de Buga',
        'Personería Buga',
        'PERSONERIA',
        'Guadalajara de Buga',
        'Valle del Cauca',
        'personeriabuga.vercel.app',
        ${process.env.DATABASE_URL},
        'neondb',
        'PROFESIONAL',
        '{"sitio_web":{"activo":true},"ventanilla_unica":{"activo":true},"gestion_documental":{"activo":true}}',
        'admin@personeriabuga.gov.co'
      )
    `;
    console.log('✅ Tenant creado');
  }

  // Verificar
  const check = await sql`SELECT id, slug, dominio_principal, plan FROM tenants`;
  console.log('\n📋 Tenants en BD:');
  check.forEach(t => console.log(`   ${t.slug} → ${t.dominio_principal} (${t.plan})`));

  console.log('\n🎉 ¡Listo! Recarga personeriabuga.vercel.app');
}

main().catch(console.error);
