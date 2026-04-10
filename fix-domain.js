const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.META_DATABASE_URL);

async function main() {
  // Add all possible Vercel domains
  const domains = [
    'personeriabuga.vercel.app',
    'personeriabuga-15jg1qnal-cesar-lozanos-projects.vercel.app',
    'personeriabuga-cesar-lozanos-projects.vercel.app',
  ];
  
  const tenant = (await sql`SELECT id, dominio_principal FROM tenants WHERE slug = 'personeria-buga'`)[0];
  console.log('Tenant actual:', tenant);
  
  // Update to use the canonical vercel domain
  await sql`UPDATE tenants SET dominio_principal = 'personeriabuga.vercel.app' WHERE id = ${tenant.id}`;
  
  // Also set dominio_personalizado to deployment-specific URL
  await sql`UPDATE tenants SET dominio_personalizado = 'personeriabuga-cesar-lozanos-projects.vercel.app' WHERE id = ${tenant.id}`;
  
  const check = await sql`SELECT dominio_principal, dominio_personalizado FROM tenants WHERE id = ${tenant.id}`;
  console.log('Actualizado:', check[0]);
}
main().catch(console.error);
