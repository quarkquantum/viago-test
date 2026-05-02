import type { Server as HttpServer } from 'node:http';
import { serve } from '@hono/node-server';
import { prisma } from '@repo/database';
import { logger } from '@repo/logger';
import { Scalar } from '@scalar/hono-api-reference';
import { openAPIRouteHandler } from 'hono-openapi';
import { register } from 'prom-client';
import app from '@/routes';
import { cleanupCronJobs, initializeCronJobs } from './bull/cron';
import { queues } from './bull/queues';
import { workers } from './bull/workers';
import { env } from './env';
import { redis } from './lib/redis';
import { sdk } from './tracing';

let server: HttpServer;

app.get(
  '/openapi.json',
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        description: 'API for greeting users',
        title: 'Hono',
        version: '1.0.0',
      },
      servers: [
        {
          description: 'Local server',
          url: env.NEXT_PUBLIC_API_URL,
        },
      ],
    },
  })
);

app.get(
  '/docs',
  Scalar({
    theme: 'default',
    url: 'openapi.json',
  })
);

app.get('/health', async (c) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection
    const ping = await redis.ping();
    const redisHealthy = ping === 'PONG';

    return c.json({
      db: 'connected',
      status: 'healthy',
      redis: redisHealthy ? 'connected' : 'disconnected',
    });
  } catch {
    return c.json(
      {
        message: 'Health check failed',
        status: 'unhealthy',
      },
      503
    );
  }
});

// Basic metrics endpoint
app.get('/metrics', async (c) => {
  const metrics = await register.metrics();
  return c.text(metrics);
});

async function main() {
  // Initialize cron jobs
  await initializeCronJobs();

  // Create the HTTP server using the serve function
  const httpServer = serve({
    fetch: app.fetch,
    port: env.API_PORT,
    hostname: '0.0.0.0',
  }) as HttpServer;

  // Store the server for shutdown handling
  server = httpServer;
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Close all workers
  await Promise.all(Object.values(workers).map((worker) => worker.close()));

  // Close all queues
  await Promise.all(Object.values(queues).map((queue) => queue.close()));

  // Close schedulers
  await cleanupCronJobs();

  // shutdown open telemetry tracing
  await sdk.shutdown();

  // Close server
  if (server) {
    server.close();
  }

  logger.info('Graceful shutdown completed');
  process.exit(0);
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM').catch((error) => {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  });
});
process.on('SIGINT', () => {
  shutdown('SIGINT').catch((error) => {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  });
});

sdk.start();
main().catch((error) => {
  logger.error('Failed to start server');
  logger.error(error);
  process.exit(1);
});
