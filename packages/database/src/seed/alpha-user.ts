import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { SystemRoles } from '@repo/shared/constants';
import { nanoid } from 'nanoid';
import { keys } from '../../keys';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });

async function seedAlphaUser() {
  console.log('Seeding alpha user...');

  const email = process.env.ALPHA_USER_EMAIL || 'admin@viago.com';
  const password = process.env.ALPHA_USER_PASSWORD || 'Admin123!';
  const fullName = process.env.ALPHA_USER_NAME || 'Admin';

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`Alpha user already exists: ${email}`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: nanoid(),
      email,
      fullName,
      role: SystemRoles.SUPER_ADMIN,
      emailVerified: true,
      profile: {
        create: {
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' ') || undefined,
        },
      },
    },
  });

  const account = await prisma.account.create({
    data: {
      id: nanoid(),
      userId: user.id,
      accountId: nanoid(),
      providerId: 'credential',
      password,
    },
  });

  console.log('Alpha user created successfully!');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`User ID: ${user.id}`);
}

seedAlphaUser()
  .catch((e) => {
    console.error('Failed to seed alpha user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
