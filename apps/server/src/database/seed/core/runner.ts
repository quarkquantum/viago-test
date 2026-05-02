import { logger } from '@repo/logger';

import type { SeedRunSummary, SeedTask, TaskSummary } from './types';
import { createTimer, formatDuration } from './utils';

/**
 * Seed Runner - Orchestrates multiple seed tasks with timing and logging
 */
export class SeedRunner {
  private readonly tasks: SeedTask[] = [];

  /**
   * Register a seed task
   */
  register(task: SeedTask): this {
    this.tasks.push(task);
    return this;
  }

  /**
   * Register multiple seed tasks
   */
  registerAll(tasks: SeedTask[]): this {
    for (const task of tasks) {
      this.register(task);
    }
    return this;
  }

  /**
   * Execute all registered tasks sequentially
   */
  async run(): Promise<SeedRunSummary> {
    const globalTimer = createTimer();
    const summaries: TaskSummary[] = [];

    logger.info('═══════════════════════════════════════════════════');
    logger.info('🚀 Starting database seeding...');
    logger.info(`📋 Registered tasks: ${this.tasks.length}`);
    logger.info('═══════════════════════════════════════════════════');

    for (const task of this.tasks) {
      const taskTimer = createTimer();
      const summary: TaskSummary = {
        name: task.name,
        status: 'skipped',
        durationMs: 0,
      };

      if (!task.shouldRun) {
        logger.info(`⏭️  Skipping: ${task.name}`);
        summary.durationMs = taskTimer.elapsed();
        summaries.push(summary);
        continue;
      }

      logger.info('───────────────────────────────────────────────────');
      logger.info(`▶️  Running: ${task.name}`);

      try {
        const result = await task.executor();
        summary.status = result.failed > 0 ? 'failed' : 'completed';
        summary.result = result;
        summary.durationMs = taskTimer.elapsed();

        logger.info(`✅ ${task.name} completed in ${formatDuration(summary.durationMs)}`);
      } catch (error) {
        summary.status = 'failed';
        summary.error = error instanceof Error ? error.message : String(error);
        summary.durationMs = taskTimer.elapsed();

        logger.error({ error }, `❌ ${task.name} failed after ${formatDuration(summary.durationMs)}`);
      }

      summaries.push(summary);
    }

    const totalDurationMs = globalTimer.elapsed();
    const completed = summaries.filter((s) => s.status === 'completed').length;
    const skipped = summaries.filter((s) => s.status === 'skipped').length;
    const failed = summaries.filter((s) => s.status === 'failed').length;

    this.printSummary({
      tasks: summaries,
      totalDurationMs,
      completed,
      skipped,
      failed,
    });

    return { tasks: summaries, totalDurationMs, completed, skipped, failed };
  }

  private printSummary(summary: SeedRunSummary): void {
    logger.info('═══════════════════════════════════════════════════');
    logger.info('📊 SEED RUN SUMMARY');
    logger.info('═══════════════════════════════════════════════════');

    logger.info('');
    logger.info('┌─────────────────────────────────┬──────────┬──────────┐');
    logger.info('│ Task                            │ Status   │ Duration │');
    logger.info('├─────────────────────────────────┼──────────┼──────────┤');

    for (const task of summary.tasks) {
      const statusIcon = task.status === 'completed' ? '✅' : task.status === 'skipped' ? '⏭️ ' : '❌';
      const name = task.name.padEnd(31).slice(0, 31);
      const status = `${statusIcon} ${task.status}`.padEnd(8);
      const duration = formatDuration(task.durationMs).padStart(8);

      logger.info(`│ ${name} │ ${status} │ ${duration} │`);
    }

    logger.info('└─────────────────────────────────┴──────────┴──────────┘');
    logger.info('');
    logger.info(
      `📈 Results: ✅ ${summary.completed} completed | ⏭️  ${summary.skipped} skipped | ❌ ${summary.failed} failed`
    );
    logger.info(`⏱️  Total time: ${formatDuration(summary.totalDurationMs)}`);
    logger.info('═══════════════════════════════════════════════════');
  }
}

export function createSeedRunner(): SeedRunner {
  return new SeedRunner();
}
