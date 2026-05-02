import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { queues } from '@/bull/queues';
import { workers } from '@/bull/workers';

export const bullMiddleware: MiddlewareHandler = createMiddleware(async (c, next) => {
  c.set('queues', queues);
  c.set('workers', workers);
  await next();
});
