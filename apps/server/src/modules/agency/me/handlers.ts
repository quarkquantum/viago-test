import { prisma } from '@repo/database';
import { updateUserSchema } from '@repo/validators';
import { Hono } from 'hono';
import { validator } from 'hono-openapi';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextAgency, getContextUser } from '@/lib/hono/context';
import { MeRoutes } from './routes';

const meHandler = new Hono<HonoEnv>()
  .get('/', ...MeRoutes.getMyAgency, async (ctx) => {
    const agencyUser = getContextAgency();

    const data = await prisma.user.findUnique({
      where: {
        id: agencyUser.id,
      },
      select: {
        email: true,
        fullName: true,
        emailVerified: true,
        profile: true,
        role: true,
      },
    });

    return ctx.json(data);
  })
  .put('/', ...MeRoutes.updateMyProfile, validator('json', updateUserSchema), async (ctx) => {
    const user = getContextUser();
    const { email, firstName, lastName, phoneNumber } = ctx.req.valid('json');

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        fullName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        profile: {
          update: {
            firstName,
            lastName,
            phoneNumber,
          },
        },
      },
    });

    return ctx.json(updatedUser);
  });

export default meHandler;
