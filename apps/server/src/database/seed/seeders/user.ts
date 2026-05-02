import { faker } from '@faker-js/faker';
import { auth as appAuth } from '@repo/auth/app/server';
import { Seeder } from '../core';
import { STATIC_USERS } from '../data/users';

type StaticUser = (typeof STATIC_USERS)[number];

export function createUsersSeeder() {
  const seeder = new Seeder<StaticUser>({
    name: 'Users',
    data: STATIC_USERS,
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
        throw new Error(`Failed to create user: ${staticUser.email}`);
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
          languageCode: Math.random() > 0.5 ? 'en' : 'fr',
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
