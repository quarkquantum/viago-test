import { prisma } from '@repo/database';

async function cleanup() {
  const agencyRequestId = process.argv[2];
  
  if (!agencyRequestId) {
    console.log('Usage: cleanup.ts <agencyRequestId>');
    console.log('Cleaning up all tenants for failed requests...');
    
    const tenants = await prisma.tenant.findMany({
      where: { status: { in: ['PROVISIONING', 'DELETED'] } }
    });
    console.log(`Found ${tenants.length} stale tenants`);
    
    for (const tenant of tenants) {
      console.log(`Deleting tenant ${tenant.id} (${tenant.slug})`);
      await prisma.tenant.delete({ where: { id: tenant.id } });
    }
    console.log('Done');
    return;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { agencyRequestId }
  });

  if (tenant) {
    console.log(`Deleting tenant ${tenant.id} for request ${agencyRequestId}`);
    await prisma.tenant.delete({ where: { id: tenant.id } });
    console.log('Done');
  } else {
    console.log('No tenant found for this request');
  }
}

cleanup().catch(console.error).finally(() => process.exit(0));