import { logger } from '@repo/logger';
import Redis from 'ioredis';
import { env } from '@/env';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: null,
});

redis.on('connect', () => logger.info('Connected to Redis'));
redis.on('error', (err) => logger.error({ err }, 'Redis error'));

export { redis as default };
