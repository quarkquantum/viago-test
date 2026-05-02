import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { Hono } from 'hono';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import type { HonoEnv } from '@/lib/hono/context';
import { getContextUser } from '@/lib/hono/context';
import { MeRoutes } from './routes';

const meHandler = new Hono<HonoEnv>().get('/', ...MeRoutes.getMe, async (ctx) => {
  const t = await useTranslation(ctx);
  const user = getContextUser();

  const me = await prisma.user.findFirst({
    include: {
      profile: true,
      agencyMemberships: {
        where: {
          role: { name: SystemRoles.CASHIER },
        },
        include: {
          agency: true,
        },
      },
    },
    where: {
      id: user.id,
    },
  });

  if (!me) {
    throw new AppError({
      code: 'database:not_found',
      entityType: 'user',
      message: t('user.api.error.not_found'),
      params: { resource: user.id },
    });
  }

  return ctx.json(me, 200);
});

export default meHandler;
