import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM,
      RESEND_TOKEN: process.env.RESEND_TOKEN,
    },
    server: {
      RESEND_FROM: z.email(),
      RESEND_TOKEN: z.string().startsWith('re_'),
    },
  });
