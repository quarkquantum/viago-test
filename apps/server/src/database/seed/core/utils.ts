import { logger } from '@repo/logger';

/**
 * Format duration in a human-readable way
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60_000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(1);
  return `${minutes}m ${seconds}s`;
}

/**
 * Process items in batches with configurable concurrency
 */
export async function processInBatches<T>(
  items: readonly T[],
  batchSize: number,
  processor: (item: T, index: number) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map((item, batchIndex) => processor(item, i + batchIndex)));
  }
}

/**
 * Create a progress tracker that logs at specified intervals
 */
export function createProgressTracker(total: number, name: string, interval: number) {
  let processed = 0;
  const startTime = Date.now();

  return {
    tick(): void {
      processed++;
      if (processed % interval === 0 || processed === total) {
        const elapsed = Date.now() - startTime;
        const rate = processed / (elapsed / 1000);
        const pct = ((processed / total) * 100).toFixed(1);
        logger.info(`📊 ${name}: ${processed}/${total} (${pct}%) - ${rate.toFixed(1)} items/s`);
      }
    },
    done(stats: { success: number; failed: number; skipped: number }): void {
      const elapsed = Date.now() - startTime;
      const rate = total / (elapsed / 1000);
      logger.info(
        `📊 ${name}: Completed ${total} items in ${formatDuration(elapsed)} (${rate.toFixed(1)} items/s) | ✅ ${stats.success} | ❌ ${stats.failed} | ⏭️ ${stats.skipped}`
      );
    },
  };
}

/**
 * Create a high-resolution timer
 */
export function createTimer() {
  const start = Date.now();
  return {
    elapsed(): number {
      return Date.now() - start;
    },
    formatted(): string {
      return formatDuration(this.elapsed());
    },
  };
}
