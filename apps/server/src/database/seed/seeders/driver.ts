import { faker } from '@faker-js/faker';
import { auth as appAuth } from '@repo/auth/app/server';
import { prisma } from '@repo/database';
import { AgencyMemberStatus, SystemRoles } from '@repo/shared';
import type { SeederResult } from '../core';
import { createTimer } from '../core';
import { delay } from '../utils';
import { STATIC_DRIVERS } from '../data/drivers';

export function createDriversSeeder() {
  return async (): Promise<SeederResult> => {
    const timer = createTimer();
    const result: SeederResult = { success: 0, failed: 0, skipped: 0, durationMs: 0, errors: [] };

    const agencies = await prisma.agency.findMany();
    const driverRole = await prisma.agencyRole.findUnique({ where: { name: SystemRoles.DRIVER } });

    if (!driverRole) {
      throw new Error('Driver role not found');
    }

    const agencyMap = new Map(agencies.map((a) => [a.slug, a]));

    for (const driverData of STATIC_DRIVERS) {
      try {
        const agency = agencyMap.get(driverData.agencySlug);
        if (!agency) {
          result.skipped++;
          result.errors.push({
            item: { email: driverData.email },
            error: `Agency not found: ${driverData.agencySlug}`,
          });
          continue;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: driverData.email },
        });

        if (existingUser) {
          await prisma.agencyMember.upsert({
            create: {
              agencyId: agency.id,
              userId: existingUser.id,
              roleId: driverRole.id,
              status: AgencyMemberStatus.ACTIVE,
            },
            update: {
              agencyId: agency.id,
              roleId: driverRole.id,
              status: AgencyMemberStatus.ACTIVE,
            },
            where: {
              userId_agencyId: {
                userId: existingUser.id,
                agencyId: agency.id,
              },
            },
          });
          result.skipped++;
          continue;
        }

        const signupResult = await appAuth.api.signUpEmail({
          body: {
            email: driverData.email,
            name: `${driverData.firstName} ${driverData.lastName}`,
            password: driverData.password,
          },
        });

        if (!signupResult?.user) {
          result.skipped++;
          continue;
        }

        const user = await prisma.user.update({
          data: {
            emailVerified: true,
            image: faker.image.avatar(),
            role: SystemRoles.DRIVER,
          },
          where: { id: signupResult.user.id },
        });

        await prisma.profile.upsert({
          create: {
            firstName: driverData.firstName,
            lastName: driverData.lastName,
            phoneNumber: driverData.phoneNumber,
            userId: user.id,
          },
          update: {
            firstName: driverData.firstName,
            lastName: driverData.lastName,
            phoneNumber: driverData.phoneNumber,
          },
          where: { userId: user.id },
        });

        await prisma.agencyMember.create({
          data: {
            agencyId: agency.id,
            userId: user.id,
            roleId: driverRole.id,
            status: AgencyMemberStatus.ACTIVE,
          },
        });

        result.success++;
        await delay(100);
      } catch (error) {
        result.failed++;
        result.errors.push({
          item: { email: driverData.email },
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    result.durationMs = timer.elapsed();
    return result;
  };
}
