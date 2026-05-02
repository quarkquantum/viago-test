import { keys as email } from '@repo/email/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_API_URL: z.url(),
      NEXT_PUBLIC_APP_URL: z.url(),
      NEXT_PUBLIC_COOKIE_DOMAIN: z.string().default('localhost'),
    },
    extends: [email()],
    runtimeEnv: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      DISABLE_SIGNUP: process.env.DISABLE_SIGNUP,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      NODE_ENV: process.env.NODE_ENV,
      NOTCH_PAY_HASH_KEY: process.env.NOTCH_PAY_HASH_KEY,
      NOTCH_PAY_PRIVATE_KEY: process.env.NOTCH_PAY_PRIVATE_KEY,
      NOTCH_PAY_PUBLIC_KEY: process.env.NOTCH_PAY_PUBLIC_KEY,
    },
    server: {
      BETTER_AUTH_SECRET: z.string().min(1),
      DISABLE_SIGNUP: z
        .string()
        .optional()
        .transform((val) => val === 'true')
        .default(false),
      NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
      NOTCH_PAY_HASH_KEY: z.string().min(1),
      NOTCH_PAY_PRIVATE_KEY: z.string().min(1),
      NOTCH_PAY_PUBLIC_KEY: z.string().min(1),
    },
  });
