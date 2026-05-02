import type { RepeatOptions } from 'bullmq';
import { QueueNames } from '@/constants';
import type { NotificationJobData, NotificationJobName } from './processors/notifications';
import { queues } from './queues';

type JobTypes = {
  [QueueNames.NOTIFICATIONS]: {
    name: NotificationJobName;
    data: NotificationJobData;
  };
};

export async function createJob<T extends keyof JobTypes>(
  queueName: T,
  jobData: JobTypes[T],
  options: {
    delay?: number;
    priority?: number;
    attempts?: number;
    backoff?: {
      type: 'exponential' | 'fixed';
      delay: number;
    };
    jobId?: string;
    repeat?: RepeatOptions;
  } = {}
) {
  const queue = queues[queueName];

  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  const finalOptions = { ...options } as typeof options;
  if (finalOptions.repeat && !finalOptions.repeat.tz) {
    finalOptions.repeat = { ...finalOptions.repeat, tz: 'UTC' };
  }
  return await queue.add(jobData.name, jobData.data, finalOptions);
}

export async function getJob<T extends keyof JobTypes>(queueName: T, jobId: string) {
  const queue = queues[queueName];

  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }

  return await queue.getJob(jobId);
}

export async function removeJob<T extends keyof JobTypes>(queueName: T, jobId: string) {
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Queue ${queueName} not found`);
  }
  const job = await queue.getJob(jobId);
  if (job) {
    await job.remove();
  }
}
