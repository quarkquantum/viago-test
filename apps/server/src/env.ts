import { keys as auth } from '@repo/auth/keys';

import { keys as database } from '@repo/database/keys';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { Env } from './constants';

export const env = createEnv({
  emptyStringAsUndefined: true,
  extends: [auth(), database()],
  runtimeEnv: process.env,
  server: {
    API_PORT: z.coerce.number().default(3003),
    API_URL: z.url().default('http://localhost'),
    NODE_ENV: z.enum(Env).default('development'),
    NOTCH_PAY_API_URL: z.url().default('https://api.notchpay.co'),
    NOTCH_PAY_HASH_KEY: z.string().min(1),
    NOTCH_PAY_PRIVATE_KEY: z.string().min(1),
    NOTCH_PAY_PUBLIC_KEY: z.string().min(1),
    SERVICE_NAME: z.string().default('api'),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().default(0),
    REDIS_CACHE_CONTAINER: z.string().default('cache'),

    TWILIO_API_KEY_SID: z.string(),
    TWILIO_API_SECRET_KEY: z.string(),
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_SMS_FROM: z.string().default('Viago'),
    TWILIO_WHATSAPP_FROM: z.string(),

    CLOUDFLARE_ACCOUNT_ID: z.string(),
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
    CLOUDFLARE_R2_ACCESS_KEY_SECRET: z.string(),
    CLOUDFLARE_R2_BUCKET_NAME: z.string().default('viago-mvp-bucket'),
    CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional(),
  },
});
