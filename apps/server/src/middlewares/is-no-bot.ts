import { createMiddleware } from 'hono/factory';
import { AppError } from '@/errors';
import { isBot } from '@/lib/bots';
import type { HonoEnv } from '@/lib/hono/context';

export const isNoBot = createMiddleware<HonoEnv>(async (ctx, next) => {
  const userAgent = ctx.req.header('User-Agent') || '';
  if (isBot(userAgent) || !userAgent) {
    throw new AppError({
      code: 'auth:access_denied',
      message: 'Access denied to bots',
    });
  }
  await next();
});
