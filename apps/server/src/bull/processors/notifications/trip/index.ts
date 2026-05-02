import { type NotificationDomain, NotificationType } from '@repo/shared';
import { handleNewTripNotification } from '@/bull/jobs/notifications/trip';

type BaseTripNotificationJobData = {
  recipientId: string;
  actorId: string;
  domain: typeof NotificationDomain.TRIP;
};

export type NewTripJobData = BaseTripNotificationJobData & {
  type: typeof NotificationType.NEW_TRIP;
  tripId: string;
};

export type TripNotificationJobData = NewTripJobData;

export function handleTripNotification(jobData: TripNotificationJobData) {
  const { type, domain } = jobData;
  switch (type) {
    case NotificationType.NEW_TRIP:
      return handleNewTripNotification(jobData);
    default: {
      const _exhaustiveCheck: never = type;
      throw new Error(`Unhandled ${domain} notification type ${_exhaustiveCheck}`);
    }
  }
}
