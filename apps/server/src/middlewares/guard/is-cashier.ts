import { auth as adminAuth } from '@repo/auth/admin/server';
import { auth as alphaAuth } from '@repo/auth/alpha/server';
import { auth as cashierAuth } from '@repo/auth/cashier/server';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors/index';
import { checkAgencyStatus } from './check-agency-status';
import type { HonoEnv } from '@/lib/hono/context';
import type { UserSessionModel } from '@/types';

export const isCashier = createMiddleware<HonoEnv>(async (ctx, next) => {
  let session: UserSessionModel | null = null;

  const authConfigs = [
    { auth: cashierAuth, name: 'cashier' as const },
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

  const cashierRole = await prisma.agencyRole.findUnique({
    where: { name: SystemRoles.CASHIER },
  });

  if (!cashierRole) {
    throw new AppError({
      cause: 'CASHIER role not found',
      code: 'auth:configuration_error',
      message: 'Cashier role is not configured in the system',
    });
  }

  const membership = await prisma.agencyMember.findFirst({
    where: {
      userId: session.user.id,
      roleId: cashierRole.id,
    },
    include: {
      agency: {
        select: { id: true, name: true, slug: true, status: true },
      },
    },
  });

  if (!membership) {
    throw new AppError({
      cause: 'No cashier membership found',
      code: 'auth:unauthorized',
      message: 'User is not a cashier for any agency',
    });
  }

  checkAgencyStatus(membership.agency);

  ctx.set('user', session.user);
  ctx.set('session', session.session);
  ctx.set('agency', membership.agency);
  await next();
});