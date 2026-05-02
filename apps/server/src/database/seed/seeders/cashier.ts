import { faker } from '@faker-js/faker';
import { prisma } from '@repo/database';
import { AgencyMemberStatus, SystemRoles } from '@repo/shared';
import type { SeederResult } from '../core';
import { createTimer } from '../core';

export function createCashiersSeeder() {
  return async (): Promise<SeederResult> => {
    const timer = createTimer();
    const result: SeederResult = { success: 0, failed: 0, skipped: 0, durationMs: 0, errors: [] };

    const cashierUsers = await prisma.user.findMany({ where: { role: SystemRoles.CASHIER } });
    const agencies = await prisma.agency.findMany();
    const cashierRole = await prisma.agencyRole.findUnique({ where: { name: SystemRoles.CASHIER } });

    if (!cashierRole) {
      throw new Error('Cashier role not found');
    }

    for (const cashierUser of cashierUsers) {
      try {
        const randomAgency = faker.helpers.arrayElement(agencies);
        await prisma.agencyMember.create({
          data: {
            userId: cashierUser.id,
            agencyId: randomAgency.id,
            roleId: cashierRole.id,
            status: AgencyMemberStatus.ACTIVE,
          },
        });
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          item: { userId: cashierUser.id },
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    result.durationMs = timer.elapsed();
    return result;
  };
}
