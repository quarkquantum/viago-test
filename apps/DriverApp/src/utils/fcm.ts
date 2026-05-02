import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import { client } from '@/lib/hono';

export const registerFcmToken = async () => {
  try {
    const app = getApp();
    const messaging = getMessaging(app);
    await registerDeviceForRemoteMessages(messaging);
    const permission = await requestPermission(messaging);
    const granted = permission === AuthorizationStatus.AUTHORIZED || permission === AuthorizationStatus.PROVISIONAL;
    if (!granted) {
      return;
    }
    const token = await getToken(messaging);
    await client.api.driver.me['fcm-token'].$patch({ json: { token } });
  } catch (error) {
    console.warn('FCM token registration failed:', error);
  }
};
