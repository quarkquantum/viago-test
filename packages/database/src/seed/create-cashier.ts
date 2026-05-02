import 'dotenv/config';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared/constants';

async function main() {
  const email = 'cashier@viago.com';
  const password = 'Cashier123!';
  const firstName = 'Jean';
  const lastName = 'Dupont';

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (existingUser) {
    console.log(`User ${email} already exists. Updating role...`);
    
    // Update to cashier role
    await prisma.user.update({
      where: { email },
      data: { role: SystemRoles.CASHIER },
    });
    
    console.log(`User ${email} is now a CASHIER`);
    console.log('Login credentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    return;
  }

  // Create user with Better Auth
  const { auth } = await import('@repo/auth/cashier/server');
  
  const response = await auth.api.createUser({
    body: {
      email,
      password,
      name: `${firstName} ${lastName}`,
    },
  });

  if (response && typeof response === 'object' && 'error' in response) {
    console.error('Failed to create user:', response.error);
    return;
  }

  const user = response.user;

  // Update user to cashier role (profile was created by auth hook)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      role: SystemRoles.CASHIER,
      emailVerified: true,
    },
  });

  // Create agency membership
  const agency = await prisma.agency.findFirst({
    where: { status: 'ACTIVE' },
  });

  if (agency) {
    const cashierRole = await prisma.agencyRole.findUnique({
      where: { name: SystemRoles.CASHIER },
    });

    if (cashierRole) {
      await prisma.agencyMember.create({
        data: {
          agencyId: agency.id,
          userId: user.id,
          roleId: cashierRole.id,
          status: 'ACTIVE',
        },
      });
      console.log(`Created cashier membership for agency: ${agency.name}`);
    }
  }

  console.log('Cashier account created successfully!');
  console.log('Login credentials:');
  console.log(`  Email: ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  Role: CASHIER`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });