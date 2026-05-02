import messaging from '@react-native-firebase/messaging';
import { client } from '@/lib/hono';

export const registerFcmToken = async () => {
  try {
    const permission = await messaging().requestPermission();
    const granted =
      permission === messaging.AuthorizationStatus.AUTHORIZED ||
      permission === messaging.AuthorizationStatus.PROVISIONAL;

    if (!granted) return;

    const token = await messaging().getToken();
    await client.api.app.me['fcm-token'].$patch({ json: { token } });
  } catch (error) {
    console.warn('FCM token registration failed:', error);
  }
};
