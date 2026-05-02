import { RedisCache } from './cache';

export { redis } from './client';
export * from './types';

export const cache = new RedisCache();
