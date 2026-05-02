import { prisma } from '@repo/database';
import { logger } from '@repo/logger';

import type { SeederConfig, SeederResult } from './types';
import { createProgressTracker, createTimer, formatDuration, processInBatches } from './utils';

/**
 * Generic Seeder class for database seeding
 *
 * @example
 * ```typescript
 * const seeder = new Seeder({
 *   name: 'countries',
 *   data: countriesData,
 *   batchSize: 50,
 *   progressInterval: 50,
 *   processor: async (item, _index, prisma) => {
 *     await prisma.country.upsert({ ... });
 *   },
 * });
 *
 * const result = await seeder.run();
 * ```
 */
export class Seeder<T> {
  private readonly config: SeederConfig<T>;

  constructor(config: SeederConfig<T>) {
    this.config = config;
  }

  async run(): Promise<SeederResult> {
    const { name, data, batchSize = 50, progressInterval = 50 } = this.config;

    const result: SeederResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0,
      errors: [],
    };

    const timer = createTimer();
    const total = data.length;

    logger.info(`🌱 Starting ${name} seeder (${total} items)`);

    if (total === 0) {
      logger.info(`⏭️  ${name}: No items to seed`);
      result.durationMs = timer.elapsed();
      return result;
    }

    const progress = createProgressTracker(total, name, progressInterval);

    try {
      await processInBatches(data, batchSize, async (item, index) => {
        try {
          await this.config.processor(item, index, prisma);
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            item,
            error: error instanceof Error ? error.message : String(error),
          });
          logger.error({ error, item, index }, `Error seeding ${name} item`);
        }
        progress.tick();
      });

      result.durationMs = timer.elapsed();

      progress.done({
        success: result.success,
        failed: result.failed,
        skipped: result.skipped,
      });

      if (result.failed === 0) {
        logger.info(`✅ ${name} seeded successfully in ${formatDuration(result.durationMs)} (${result.success} items)`);
      } else {
        logger.warn(
          `⚠️  ${name} completed with errors in ${formatDuration(result.durationMs)} (${result.success} success, ${result.failed} failed)`
        );
      }

      return result;
    } catch (error) {
      result.durationMs = timer.elapsed();
      logger.error(error, `❌ Fatal error seeding ${name}`);
      throw error;
    }
  }
}
