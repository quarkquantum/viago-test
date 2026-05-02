import admin from 'firebase-admin';
import { logger } from '@repo/logger';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      logger.error({ error }, 'Failed to parse FIREBASE_SERVICE_ACCOUNT');
    }
  } else {
    logger.warn('FIREBASE_SERVICE_ACCOUNT not set — push notifications disabled');
  }
}

export const firebaseAdmin = admin;
