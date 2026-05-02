import { auth as adminAuth } from '@repo/auth/admin/server';
import { auth as alphaAuth } from '@repo/auth/alpha/server';
import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors/index';
import type { HonoEnv } from '@/lib/hono/context';
import type { UserSessionModel } from '@/types';

export const isAuthenticated = createMiddleware<HonoEnv>(async (ctx, next) => {
  let session: UserSessionModel | null = null;

  const adminSession = await adminAuth.api.getSession({
    headers: ctx.req.raw.headers,
  });

  if (adminSession && (adminSession as unknown as UserSessionModel)?.user) {
    session = adminSession as unknown as UserSessionModel;
  } else {
    const alphaSession = await alphaAuth.api.getSession({
      headers: ctx.req.raw.headers,
    });

    if (alphaSession && (alphaSession as unknown as UserSessionModel)?.user) {
      session = alphaSession as unknown as UserSessionModel;
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
  ctx.set('user', session.user);
  ctx.set('session', session.session);
  await next();
});