import { logger } from '@repo/logger';
import { safeDestr } from 'destr';
import { env } from '@/env';

import { redis } from './client';
import type { CachePrefix } from './types';

export class RedisCache {
  private readonly container: string;

  constructor(container = env.REDIS_CACHE_CONTAINER) {
    this.container = container;
  }

  private getKey(key: string, prefix: CachePrefix): string {
    return `${this.container}:${prefix}:${key}`;
  }

  async get<T>(key: string, prefix: CachePrefix): Promise<T | null> {
    try {
      const cached = await redis.get(this.getKey(key, prefix));
      return cached ? await safeDestr<T>(cached) : null;
    } catch (err) {
      logger.error({ err, key }, 'Cache get error');
      return null;
    }
  }

  async set(key: string, value: unknown, prefix: CachePrefix, ttl?: number): Promise<void> {
    const fullKey = this.getKey(key, prefix);
    const serialized = JSON.stringify(value);

    if (ttl) {
      await redis.setex(fullKey, ttl, serialized);
    } else {
      await redis.set(fullKey, serialized);
    }
  }

  async delete(key: string, prefix: CachePrefix): Promise<void> {
    await redis.del(this.getKey(key, prefix));
  }

  async deletePattern(pattern: string, prefix: CachePrefix): Promise<void> {
    try {
      const keys = await redis.keys(this.getKey(pattern, prefix));
      if (keys.length) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.error({ err, pattern, prefix }, 'Redis delete pattern error');
      throw err;
    }
  }

  async flushAll(prefix?: CachePrefix): Promise<void> {
    try {
      if (prefix) {
        this.deletePattern('*', prefix);
      } else {
        await redis.flushall();
      }
    } catch (err) {
      logger.error({ err }, 'Redis clear cache error');
      throw err;
    }
  }
}
