import type { MiddlewareHandler } from 'hono/types';
import { Counter, Histogram } from 'prom-client';
import { metricsConfig } from '@/middlewares/observability/config';

// Prometheus metrics Initialize
const observabilityRequestDurationHistogram = new Histogram({
  buckets: metricsConfig.requestDuration.buckets,
  help: metricsConfig.requestDuration.help,
  labelNames: metricsConfig.requestDuration.labelNames,
  name: metricsConfig.requestDuration.name,
});

const observabilityRequestsCounter = new Counter({
  help: metricsConfig.requestsTotal.help,
  labelNames: metricsConfig.requestsTotal.labelNames,
  name: metricsConfig.requestsTotal.name,
});

/**
 * Middleware that tracks request metrics for observability purposes, such as request count and request duration.
 * It increments a counter for each incoming request and records the duration of each request.
 *
 * @param ctx - Request/response context.
 * @param next - The next middleware or route handler to call after this middleware completes its work.
 */
export const observabilityMiddleware: MiddlewareHandler = async (ctx, next) => {
  const start = Date.now();

  // Incrementing request count
  const currentCounter = await observabilityRequestsCounter.get();
  observabilityRequestsCounter.inc({
    date: Date.now(),
    requestsNumber: currentCounter.values.length + 1,
  });

  // Measure request duration and record it in the histogram
  const duration = (Date.now() - start) / 1000; // Convert milliseconds to seconds
  observabilityRequestDurationHistogram.observe(
    {
      method: ctx.req.method,
      ok: ctx.res.status,
      route: ctx.req.url,
      status: ctx.res.status.toString(),
    },
    duration
  );

  await next();
};
