import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { keys } from './keys';

export * from '@prisma/client';

function getDb(connectionString: string): PrismaClient {
  const pool = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter: pool });
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || getDb(keys().POSTGRES_URL);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export type { AgencyScopeOptions } from './src/tenant/query-scope';
export { createAgencyFilter, getAgencyScope, withAgencyScope } from './src/tenant/query-scope';
