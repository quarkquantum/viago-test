import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';
import { nanoid } from 'nanoid';
import { keys } from '../../keys';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });

async function resetAlphaUser() {
  console.log('Resetting alpha user...\n');

  const email = process.env.ALPHA_USER_EMAIL || 'admin@viago.com';
  const password = process.env.ALPHA_USER_PASSWORD || 'Admin123!';
  const fullName = process.env.ALPHA_USER_NAME || 'Admin';

  // Delete existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true, profile: true },
  });

  if (existingUser) {
    console.log(`Deleting existing user: ${email}`);
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
    console.log('User deleted.\n');
  }

  // Create new user with hashed password
  console.log('Creating new user...');
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      id: nanoid(),
      email,
      fullName,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      profile: {
        create: {
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' ') || undefined,
          languageCode: 'fr',
        },
      },
    },
  });

  await prisma.account.create({
    data: {
      id: nanoid(),
      userId: user.id,
      accountId: nanoid(),
      providerId: 'credential',
      password: hashedPassword,
    },
  });

  console.log('Alpha user created successfully!');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`User ID: ${user.id}`);

  await prisma.$disconnect();
}

resetAlphaUser().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
