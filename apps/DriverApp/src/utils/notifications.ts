import notifee, { AndroidImportance } from '@notifee/react-native';
import { StationStatus } from '@repo/shared';
// Import i18n instance directly to use outside of components
import i18n from '../i18n';

const CHANNEL_ID = 'trip-updates';
const CHANNEL_NAME = 'Trip Updates';

export const initializeNotifications = async () => {
  await notifee.requestPermission();
  await createChannel();
};

export const createChannel = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
};

export const sendPushNotification = async (title: string, body: string) => {
  try {
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

export const notifyTripStart = async () => {
  await sendPushNotification(i18n.t('notifications.trip.start.title'), i18n.t('notifications.trip.start.body'));
};

export const notifyTripCompletion = async () => {
  await sendPushNotification(i18n.t('notifications.trip.complete.title'), i18n.t('notifications.trip.complete.body'));
};

export const notifyStationUpdate = async (status: StationStatus, stationName?: string) => {
  const namePart = stationName ? ` ${stationName}` : '';

  switch (status) {
    case StationStatus.BOARDING:
      await sendPushNotification(
        i18n.t('notifications.station.boarding.title'),
        i18n.t('notifications.station.boarding.body', { stationName: namePart })
      );
      break;
    case StationStatus.ACTIVE:
      await sendPushNotification(
        i18n.t('notifications.station.departed.title'),
        i18n.t('notifications.station.departed.body', { stationName: namePart })
      );
      break;
    case StationStatus.COMPLETED:
      await sendPushNotification(
        i18n.t('notifications.station.completed.title'),
        i18n.t('notifications.station.completed.body', { stationName: namePart })
      );
      break;
    default:
      break;
  }
};
