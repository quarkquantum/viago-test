import { logger } from '@repo/logger';
import { Worker } from 'bullmq';
import { QueueNames } from '@/constants';
import { redis } from '@/lib/redis';
import { handleNotificationJobs } from '../processors/notifications';

export const notificationsWorker = new Worker(QueueNames.NOTIFICATIONS, handleNotificationJobs, {
  connection: redis,
  concurrency: 1,
});

export const workers = {
  [QueueNames.NOTIFICATIONS]: notificationsWorker,
};

// Setup error handling for all workers

for (const worker of Object.values(workers)) {
  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, name: job.name, queue: job.queueName }, 'Job completed successfully');
    // const tracer = trace.getTracer('bullmq');
    // tracer.startActiveSpan('bullmq.job.completed', (span) => {
    //   span.setAttributes({
    //     'bullmq.queue': job.queueName,
    //     'bullmq.job.id': String(job.id),
    //     'bullmq.job.name': job.name,
    //     'bullmq.event': 'completed',
    //   });
    //   span.end();
    // });
  });

  worker.on('failed', (job, error) => {
    logger.error({ jobId: job?.id, name: job?.name, queue: job?.queueName, err: error }, 'Job processing failed');
    // const tracer = trace.getTracer('bullmq');
    // tracer.startActiveSpan('bullmq.job.failed', (span) => {
    //   span.setAttributes({
    //     'bullmq.queue': job?.queueName ?? 'unknown',
    //     'bullmq.job.id': String(job?.id ?? ''),
    //     'bullmq.job.name': job?.name ?? 'unknown',
    //     'bullmq.event': 'failed',
    //   });
    //   span.recordException(error);
    //   span.end();
    // });
  });
}
