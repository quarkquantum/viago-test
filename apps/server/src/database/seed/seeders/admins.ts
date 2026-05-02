import { faker } from '@faker-js/faker';
import { auth as appAuth } from '@repo/auth/app/server';
import { SystemRoles } from '@repo/shared';
import { Seeder } from '../core';
import { STATIC_ADMINS } from '../data/admins';

type StaticAdmin = (typeof STATIC_ADMINS)[number];

export function createAdminsSeeder() {
  const seeder = new Seeder<StaticAdmin>({
    name: 'Admins',
    data: STATIC_ADMINS,
    batchSize: 1,
    progressInterval: 5,
    processor: async (staticUser, _index, prisma) => {
      if (staticUser.role !== SystemRoles.ADMIN) {
        return;
      }

      const result = await appAuth.api.signUpEmail({
        body: {
          email: staticUser.email,
          name: `${staticUser.firstName} ${staticUser.lastName}`,
          password: staticUser.password,
        },
      });

      if (!result?.user) {
        throw new Error(`Failed to create admin: ${staticUser.email}`);
      }

      const user = await prisma.user.update({
        data: {
          emailVerified: true,
          image: faker.image.avatar(),
          lastSignInAt: faker.date.recent({ days: 30 }),
          role: staticUser.role,
        },
        where: { id: result.user.id },
      });

      await prisma.profile.upsert({
        create: {
          firstName: staticUser.firstName,
          lastName: staticUser.lastName,
          phoneNumber: staticUser.phoneNumber,
          userId: user.id,
        },
        update: {
          firstName: staticUser.firstName,
          lastName: staticUser.lastName,
          phoneNumber: staticUser.phoneNumber,
        },
        where: { userId: user.id },
      });
    },
  });
  return () => seeder.run();
}
