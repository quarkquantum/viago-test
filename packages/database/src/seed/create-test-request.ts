import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { keys } from '../../keys';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: keys().POSTGRES_URL }) });

async function createTestRequest() {
  const request = await prisma.agencyRequest.create({
    data: {
      id: nanoid(),
      agencyName: 'Test Transport Agency',
      legalForm: 'SARL',
      description: 'A test transport company',
      countryCode: 'CM',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test-agency@example.com',
      phoneNumber: '+237600000000',
      status: 'PENDING',
    },
  });

  console.log('Created test agency request:');
  console.log(`ID: ${request.id}`);
  console.log(`Agency: ${request.agencyName}`);
  console.log(`Status: ${request.status}`);

  await prisma.$disconnect();
}

createTestRequest().catch((e) => {
  console.error('Failed:', e);
  process.exit(1);
});
