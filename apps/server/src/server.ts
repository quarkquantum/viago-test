import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { requestId } from 'hono/request-id';
import { env } from './env';
import { AppError } from './errors';
import { errorMiddleware } from './errors/handler';
import type { HonoEnv } from './lib/hono/context';
import middlewares from './middlewares/app';
import { bullMiddleware } from './middlewares/bullmq';

const baseApp = new Hono<HonoEnv>();

// add requestId middleware
baseApp.use('*', requestId());
// Add context storage
baseApp.use(contextStorage());

// global middlewares
baseApp.route('/', middlewares);
baseApp.use('*', bullMiddleware);

// Not found handler
baseApp.notFound((ctx) => {
  throw new AppError({
    code: 'http:not_found',
    details: {
      route: ctx.req.url,
    },
    message: 'Route not found',
  });
});

// Error handler
baseApp.onError((err, ctx) =>
  errorMiddleware({
    isDevelopment: env.NODE_ENV !== 'production',
    devDetails: {
      includeStack: true,
      includeCause: true,
      includeDetails: true,
    },
  })(err, ctx)
);

export default baseApp;
