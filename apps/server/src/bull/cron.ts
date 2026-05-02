import { logger } from '@repo/logger';
import { Queue, Worker } from 'bullmq';
import { CronQueueNames } from '@/constants';
import { redis } from '@/lib/redis';
import { handleCronJobs } from './processors/cron';

export const CronJobTypes = {
  SEND_TRIP_REMINDER: 'send-trip-reminder',
} as const;

export type CronJobTypes = (typeof CronJobTypes)[keyof typeof CronJobTypes];
export const defaultCronWorker = new Worker(CronQueueNames.DEFAULT, handleCronJobs, {
  connection: redis,
  concurrency: 1,
});

export const defaultCronQueue = new Queue<unknown, unknown, string>(CronQueueNames.DEFAULT, {
  connection: redis,
  defaultJobOptions: {
    attempts: 1,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

type CronJob = {
  name: CronJobTypes;
  cron: string;
};

const cronJobs: CronJob[] = [
  {
    name: CronJobTypes.SEND_TRIP_REMINDER,
    cron: '*/30 * * * *', // run every 30 minutes
  },
  // Add more cron jobs here
];

export async function initializeCronJobs() {
  try {
    const currentJobNames = new Set(cronJobs.map((job) => `${job.name}`));

    const repeatableJobs = await defaultCronQueue.getJobSchedulers();
    if (repeatableJobs.length > 0) {
      // Find and remove outdated jobs
      const cleanupPromises = repeatableJobs
        .filter((job) => !currentJobNames.has(job.name))
        .map((job) => defaultCronQueue.removeJobScheduler(job.key));
      // Wait for all cleanup operations to complete
      const cleanupResults = await Promise.allSettled(cleanupPromises);
      // Log cleanup results
      for (const [index, result] of cleanupResults.entries()) {
        if (result.status === 'rejected') {
          logger.error(`Failed to remove outdated cron job: ${result.reason}`);
        } else {
          logger.info(`Successfully removed outdated cron job: ${repeatableJobs[index]?.name}`);
        }
      }
    }

    // Upsert current cron jobs
    const upsertResults = await Promise.allSettled(
      cronJobs.map((job) =>
        defaultCronQueue.upsertJobScheduler(
          `cron:${job.name}`,
          {
            pattern: job.cron,
          },
          {
            name: job.name,
            data: {
              type: job.name,
            },
          }
        )
      )
    );

    // Log results of current job initialization
    for (const result of upsertResults) {
      if (result.status === 'rejected') {
        logger.error(`Failed to start cron job: ${result.reason}`);
      } else {
        logger.info(`Cron job ${result.value.name} is running`);
      }
    }
  } catch (error) {
    logger.error({ error }, 'Failed to initialize cron jobs');
    throw error;
  }
}

// Clean up function for graceful shutdown
export async function cleanupCronJobs() {
  await defaultCronQueue.close();
  await defaultCronWorker.close();
}
export async function removeScheduledJob(name: CronJobTypes) {
  const jobId = `cron:${name}`;
  await defaultCronQueue.removeJobScheduler(jobId);
}
