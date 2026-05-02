import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: process.env,
    server: {
      POSTGRES_URL: z.url(),
    },
  });
