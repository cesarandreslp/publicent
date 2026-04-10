const { PrismaClient } = require('./src/generated/meta-client');
const p = new PrismaClient({ datasourceUrl: process.env.META_DATABASE_URL });

async function main() {
  const tenants = await p.tenant.findMany({ select: { id: true, nombre: true, dominio: true } });
  console.log(JSON.stringify(tenants, null, 2));
  
  if (tenants.length === 0) {
    console.log('\nNo hay tenants. Necesitas crear uno con dominio personeriabuga.vercel.app');
  } else {
    console.log('\nTenants encontrados:', tenants.length);
    const vercelTenant = tenants.find(t => t.dominio && t.dominio.includes('vercel'));
    if (!vercelTenant) {
      console.log('⚠️  Ningún tenant tiene dominio de Vercel.');
      console.log('El primer tenant es:', tenants[0].dominio);
    }
  }
  await p.$disconnect();
}
main().catch(console.error);
