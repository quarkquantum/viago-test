import type { PrismaClient } from '@repo/database';

/**
 * Configuration for a generic seeder
 */
export interface SeederConfig<T> {
  /** Unique name for this seeder (used in logs) */
  name: string;
  /** Data items to seed */
  data: readonly T[];
  /** Number of items to process concurrently (default: 50) */
  batchSize?: number;
  /** Log progress every N items (default: 50) */
  progressInterval?: number;
  /** Processor function for each item */
  processor: (item: T, index: number, prisma: PrismaClient) => Promise<void>;
}

/**
 * Result metrics from a seeder run
 */
export interface SeederResult {
  success: number;
  failed: number;
  skipped: number;
  durationMs: number;
  errors: SeederError[];
}

/**
 * Error details for failed items
 */
export interface SeederError {
  item: unknown;
  error: string;
}

/**
 * A single seed task definition
 */
export interface SeedTask {
  /** Task name for logging */
  name: string;
  /** Condition to run this task (typically env-based) */
  shouldRun: boolean;
  /** The seeder function to execute */
  executor: () => Promise<SeederResult>;
}

/**
 * Summary of a completed task
 */
export interface TaskSummary {
  name: string;
  status: 'completed' | 'skipped' | 'failed';
  result?: SeederResult;
  durationMs: number;
  error?: string;
}

/**
 * Final summary of all seed tasks
 */
export interface SeedRunSummary {
  tasks: TaskSummary[];
  totalDurationMs: number;
  completed: number;
  skipped: number;
  failed: number;
}
