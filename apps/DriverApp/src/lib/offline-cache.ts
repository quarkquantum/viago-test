import { StorageKeys, storage } from './storage';

function cacheKey(queryKey: readonly unknown[]): string {
  return `${StorageKeys.CACHE_PREFIX}${JSON.stringify(queryKey)}`;
}

export function writeCache(queryKey: readonly unknown[], data: unknown): void {
  try {
    storage.set(cacheKey(queryKey), JSON.stringify(data));
  } catch {
    // Silently fail on write errors
  }
}

export function readCache<T>(queryKey: readonly unknown[]): T | undefined {
  try {
    const raw = storage.getString(cacheKey(queryKey));
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // Silently fail on read/parse errors
  }
  return undefined;
}

export function clearCache(queryKey: readonly unknown[]): void {
  try {
    storage.remove(cacheKey(queryKey));
  } catch {
    // Silently fail on delete errors
  }
}
