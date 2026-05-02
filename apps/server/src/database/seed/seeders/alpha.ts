import { faker } from '@faker-js/faker';
import { auth as appAuth } from '@repo/auth/app/server';
import { Seeder } from '../core';
import { STATIC_ALPHA_USERS } from '../data/alpha';

type StaticAlphaUser = (typeof STATIC_ALPHA_USERS)[number];

export function createAlphaUsersSeeder() {
  const seeder = new Seeder<StaticAlphaUser>({
    name: 'Alpha Users',
    data: STATIC_ALPHA_USERS,
    batchSize: 1,
    progressInterval: 5,
    processor: async (staticUser, _index, prisma) => {
      const result = await appAuth.api.signUpEmail({
        body: {
          email: staticUser.email,
          name: `${staticUser.firstName} ${staticUser.lastName}`,
          password: staticUser.password,
        },
      });

      if (!result?.user) {
        throw new Error(`Failed to create alpha user: ${staticUser.email}`);
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
