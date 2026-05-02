import { auth as adminAuth } from '@repo/auth/admin/server';
import { auth as alphaAuth } from '@repo/auth/alpha/server';
import { prisma } from '@repo/database';
import { SystemRoles } from '@repo/shared';
import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors/index';
import type { HonoEnv } from '@/lib/hono/context';
import type { UserSessionModel } from '@/types';

export const isAdmin = createMiddleware<HonoEnv>(async (ctx, next) => {
  let session: UserSessionModel | null = null;
  let authInstance: 'admin' | 'alpha' = 'admin';

  const adminSession = await adminAuth.api.getSession({
    headers: ctx.req.raw.headers,
  });

  if (adminSession && (adminSession as unknown as UserSessionModel)?.user) {
    session = adminSession as unknown as UserSessionModel;
    authInstance = 'admin';
  } else {
    const alphaSession = await alphaAuth.api.getSession({
      headers: ctx.req.raw.headers,
    });

    if (alphaSession && (alphaSession as unknown as UserSessionModel)?.user) {
      session = alphaSession as unknown as UserSessionModel;
      authInstance = 'alpha';
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

  const admin = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: SystemRoles.ADMIN,
    },
  });

  if (!admin) {
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
  ctx.set('authInstance', authInstance);
  await next();
});