import { prisma } from '@repo/database';
import { Hono } from 'hono';
import { useTranslation } from '@intlify/hono';
import { AppError } from '@/errors';
import { getContextAgency, type HonoEnv } from '@/lib/hono/context';
import { PassengerRoutes } from './routes';

const passengerHandler = new Hono<HonoEnv>().get('/:identifier', ...PassengerRoutes.getPassenger, async (ctx) => {
  const t = await useTranslation(ctx);
  const agency = getContextAgency();
  const { identifier } = ctx.req.param();
  const user = await prisma.user.findUnique({
    include: {
      profile: true,
      tickets: {
        include: {
          booking: {
            include: {
              fromStation: true,
              toStation: true,
              trip: {
                include: {
                  bus: true,
                },
              },
            },
          },
          seat: true,
        },
        where: {
          booking: {
            agencyId: agency.id,
          },
        },
      },
    },
    where: { id: identifier },
  });
  if (!user) {
    throw new AppError({
      code: 'database:not_found',
      entityType: 'passenger',
      message: t('passenger.api.error.not_found'),
    });
  }
  return ctx.json(user, 200);
});

export default passengerHandler;
