import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3001'),
  },
  server: {
    API_INTERNAL_URL: z.string().default('http://localhost:3000'),
  },
  extends: [auth(), database(), email()],
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    API_INTERNAL_URL: process.env.API_INTERNAL_URL,
  },
});
