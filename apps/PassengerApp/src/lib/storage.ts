import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'viago-passenger' });

export const StorageKeys = {
  LANGUAGE: 'language',
  OFFLINE_QUEUE: 'offline-queue',
} as const;
