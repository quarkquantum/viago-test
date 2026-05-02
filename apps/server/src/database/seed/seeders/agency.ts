import { faker } from '@faker-js/faker';
import { auth as appAuth } from '@repo/auth/app/server';
import { AgencyMemberStatus, AgencyStatus, SystemRoles } from '@repo/shared';
import { Seeder } from '../core';
import { STATIC_AGENCIES, STATIC_AGENCY_USERS } from '../data/agencies';
import { delay } from '../utils';

type StaticAgencyUser = (typeof STATIC_AGENCY_USERS)[number];

export function createAgenciesSeeder() {
  const seeder = new Seeder<StaticAgencyUser>({
    name: 'Agencies',
    data: STATIC_AGENCY_USERS,
    batchSize: 1,
    progressInterval: 5,
    processor: async (staticAgencyUser, _index, prisma) => {
      const agencyData = STATIC_AGENCIES.find((a) => a.slug === staticAgencyUser.agencySlug);
      if (!agencyData) {
        throw new Error(`Agency data not found for slug: ${staticAgencyUser.agencySlug}`);
      }

      const result = await appAuth.api.signUpEmail({
        body: {
          email: staticAgencyUser.email,
          name: `${staticAgencyUser.firstName} ${staticAgencyUser.lastName}`,
          password: staticAgencyUser.password,
        },
      });

      if (!result?.user) {
        throw new Error(`Failed to create agency user: ${staticAgencyUser.email}`);
      }

      const user = await prisma.user.update({
        data: {
          emailVerified: true,
          image: faker.image.avatar(),
          lastSignInAt: faker.date.recent({ days: 30 }),
          role: SystemRoles.AGENCY,
        },
        where: { id: result.user.id },
      });

      await prisma.profile.upsert({
        create: {
          firstName: staticAgencyUser.firstName,
          lastName: staticAgencyUser.lastName,
          phoneNumber: staticAgencyUser.phoneNumber,
          userId: user.id,
        },
        update: {
          firstName: staticAgencyUser.firstName,
          lastName: staticAgencyUser.lastName,
          phoneNumber: staticAgencyUser.phoneNumber,
        },
        where: { userId: user.id },
      });

      const agency = await prisma.agency.create({
        data: {
          countryCode: agencyData.countryCode,
          description: agencyData.description,
          logo: agencyData.logo,
          name: agencyData.name,
          ownerId: user.id,
          slug: agencyData.slug,
          status: AgencyStatus.ACTIVE,
        },
      });

      const ownerRole = await prisma.agencyRole.findUniqueOrThrow({ where: { name: SystemRoles.OWNER } });
      await prisma.agencyMember.create({
        data: {
          agencyId: agency.id,
          userId: user.id,
          roleId: ownerRole.id,
          status: AgencyMemberStatus.ACTIVE,
        },
      });

      // Delay to avoid rate limiting (Resend allows 2 requests per second)
      await delay(600);
    },
  });
  return () => seeder.run();
}
