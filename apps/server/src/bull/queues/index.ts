import { Queue } from 'bullmq';
import { QueueNames } from '@/constants';
import { redis } from '@/lib/redis';
import type { NotificationJobData } from '../processors/notifications';

export const notificationsQueue = new Queue<NotificationJobData, object, string>(QueueNames.NOTIFICATIONS, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: { age: 60 * 60 * 24 * 7 },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const queues: Record<QueueNames, Queue> = {
  notifications: notificationsQueue,
};
