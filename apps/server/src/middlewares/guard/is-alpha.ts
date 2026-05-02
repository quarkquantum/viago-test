import { auth as adminAuth } from '@repo/auth/admin/server';
import { auth as alphaAuth } from '@repo/auth/alpha/server';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors/index';
import type { HonoEnv } from '@/lib/hono/context';
import type { UserSessionModel } from '@/types';

export const isAlpha = createMiddleware<HonoEnv>(async (ctx, next) => {
  let session: UserSessionModel | null = null;

  const authConfigs = [
    { auth: alphaAuth, name: 'alpha' as const },
    { auth: adminAuth, name: 'admin' as const },
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

  const superAdmin = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: SystemRoles.SUPER_ADMIN,
    },
  });

  if (!superAdmin) {
    ctx.set('user', null);
    ctx.set('session', null);
    throw new AppError({
      cause: 'Session not found',
      code: 'auth:invalid_session',
      message: 'User session not found',
    });
  }

  ctx.set('user', session.user);
  ctx.set('session', session.session);
  await next();
});