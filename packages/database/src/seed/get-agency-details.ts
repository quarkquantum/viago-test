import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { keys } from '../../keys';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });

async function check() {
  const users = await prisma.user.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { agencyMemberships: true },
  });

  console.log('All users:');
  users.forEach((u) => {
    console.log(`- ${u.email} (id: ${u.id}) - role: ${u.role}`);
  });

  await prisma.$disconnect();
}

check().catch((e) => {
  console.error(e);
  process.exit(1);
});