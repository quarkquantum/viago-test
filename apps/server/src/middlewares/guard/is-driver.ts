import { auth as adminAuth } from '@repo/auth/admin/server';
import { auth as alphaAuth } from '@repo/auth/alpha/server';
import { auth as driverAuth } from '@repo/auth/driver/server';
import { prisma } from '@repo/database';
import { AgencyStatus, SystemRoles } from '@repo/shared';
import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors/index';
import { checkAgencyStatus } from './check-agency-status';
import type { HonoEnv } from '@/lib/hono/context';
import type { UserSessionModel } from '@/types';

export const isDriver = createMiddleware<HonoEnv>(async (ctx, next) => {
  let session: UserSessionModel | null = null;

  const authConfigs = [
    { auth: driverAuth, name: 'driver' as const },
    { auth: adminAuth, name: 'admin' as const },
    { auth: alphaAuth, name: 'alpha' as const },
  ];

  for (const config of authConfigs) {
    const sess = await config.auth.api.getSession({
      headers: ctx.req.raw.headers,
    });
    if (sess && (sess as unknown as UserSessionModel)?.user) {
      session = sess as unknown as UserSessionModel;
      break;
    }
  }

  if (!session || !session.user) {
    ctx.set('user', null);
    ctx.set('session', null);
    throw new AppError({
      cause: 'Session not found',
      code: 'auth:invalid_session',
      message: 'User session not found',
    });
  }

  const driver = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: SystemRoles.DRIVER,
    },
    include: {
      agencyMemberships: {
        where: {
          role: {
            name: SystemRoles.DRIVER,
          },
        },
        include: {
          agency: true,
        },
      },
    },
  });

  if (!driver) {
    ctx.set('user', null);
    ctx.set('session', null);
    throw new AppError({
      cause: 'User not found',
      code: 'auth:invalid_session',
      message: 'User session not found',
    });
  }

  if (driver.banned && driver.banExpires && driver.banExpires > new Date()) {
    ctx.set('user', null);
    ctx.set('session', null);
    throw new AppError({
      cause: 'User banned',
      code: 'auth:user_banned',
      message: 'User banned',
    });
  }

  const agency = driver.agencyMemberships[0]?.agency;

  if (!agency) {
    throw new AppError({
      cause: 'Driver has no agency membership',
      code: 'auth:unauthorized',
      message: 'Driver is not associated with any agency',
    });
  }

  checkAgencyStatus(agency);

  ctx.set('user', session.user);
  ctx.set('session', session.session);
  ctx.set('agency', agency);
  await next();
});