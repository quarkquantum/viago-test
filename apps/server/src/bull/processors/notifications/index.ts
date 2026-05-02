import { NotificationDomain } from '@repo/shared';
import type { Job } from 'bullmq';
import { handleTripNotification, type TripNotificationJobData } from './trip';

export type NotificationJobData = TripNotificationJobData;
export type NotificationJobName = NotificationJobData['type'];

function handleDomainNotifications(jobData: NotificationJobData) {
  const { domain } = jobData;
  switch (domain) {
    case NotificationDomain.TRIP:
      return handleTripNotification(jobData);
    default: {
      throw new Error(`Unsupported notification domain: ${domain}`);
    }
  }
}

export async function handleNotificationJobs(job: Job<NotificationJobData>) {
  await handleDomainNotifications(job.data);
}
