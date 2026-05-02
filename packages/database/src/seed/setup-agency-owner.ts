import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';
import { nanoid } from 'nanoid';
import { keys } from '../../keys';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });

async function setupAgencyOwner() {
  const agencySlug = 'test-transport-agency-6dtb';
  const email = 'agency-owner@example.com';
  const password = 'Agency123!';

  // Find agency and tenant
  const agency = await prisma.agency.findUnique({
    where: { slug: agencySlug },
    include: { tenant: true },
  });

  const tenant = await prisma.tenant.findUnique({
    where: { slug: agencySlug },
  });

  if (!(agency && tenant)) {
    console.log('Agency or tenant not found');
    await prisma.$disconnect();
    return;
  }

  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (user) {
    console.log('User already exists');
  } else {
    const hashedPassword = await hashPassword(password);
    user = await prisma.user.create({
      data: {
        id: nanoid(),
        email,
        fullName: 'Agency Owner',
        role: 'AGENCY',
        emailVerified: true,
        profile: {
          create: {
            firstName: 'Agency',
            lastName: 'Owner',
            languageCode: 'fr',
          },
        },
        accounts: {
          create: {
            id: nanoid(),
            accountId: nanoid(),
            providerId: 'credential',
            password: hashedPassword,
          },
        },
      },
    });
    console.log('User created');
  }

  // Update agency with owner and tenant
  await prisma.agency.update({
    where: { id: agency.id },
    data: {
      ownerId: user.id,
      tenantId: tenant.id,
    },
  });

  // Update tenant with owner
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { ownerId: user.id },
  });

  // Create owner role if not exists
  let ownerRole = await prisma.agencyRole.findUnique({ where: { name: 'OWNER' } });
  if (!ownerRole) {
    ownerRole = await prisma.agencyRole.create({
      data: { id: nanoid(), name: 'OWNER' },
    });
  }

  // Add agency member
  const existingMember = await prisma.agencyMember.findFirst({
    where: { userId: user.id, agencyId: agency.id },
  });

  if (!existingMember) {
    await prisma.agencyMember.create({
      data: {
        id: nanoid(),
        userId: user.id,
        agencyId: agency.id,
        roleId: ownerRole.id,
        status: 'ACTIVE',
      },
    });
  }

  console.log('\n===================================');
  console.log('       AGENCY OWNER CREDENTIALS');
  console.log('===================================');
  console.log('Agency:        Test Transport Agency');
  console.log('Database:      ' + tenant.databaseName);
  console.log('Email:         ' + email);
  console.log('Password:      ' + password);
  console.log('===================================');
  console.log('\nLogin URL: agency.velora-viago.com/login');
  console.log('(or localhost with subdomain routing)');

  await prisma.$disconnect();
}

setupAgencyOwner().catch((e) => {
  console.error(e);
  process.exit(1);
});
