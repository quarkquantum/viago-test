import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({ id: 'viago-driver' });

export const StorageKeys = {
  LANGUAGE: 'language',
  CACHE_PREFIX: 'cache:',
  OFFLINE_QUEUE: 'offline-queue',
} as const;
