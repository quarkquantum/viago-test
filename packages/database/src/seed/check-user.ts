import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { keys } from '../../keys';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });

async function check() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@viago.com' },
      include: { accounts: true },
    });
    console.log('User:', JSON.stringify(user, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

check();
