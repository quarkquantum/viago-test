import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

async function check() {
  try {
    const result = await pool.query("SELECT datname FROM pg_database WHERE datname LIKE 'viago_%' ORDER BY datname");
    console.log('\nTenant databases found:');
    if (result.rows.length === 0) {
      console.log('  None');
    } else {
      result.rows.forEach((row) => console.log('  -', row.datname));
    }

    // Also check tenants table
    const { PrismaPg } = await import('@prisma/adapter-pg');
    const { PrismaClient } = await import('@prisma/client');
    const { keys } = await import('./keys');

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });
    const tenants = await prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
    console.log('\nTenant records in master DB:');
    if (tenants.length === 0) {
      console.log('  None');
    } else {
      tenants.forEach((t) => console.log(`  - ${t.name} (${t.slug}) - ${t.status}`));
    }

    await prisma.$disconnect();
  } finally {
    await pool.end();
  }
}

check();
