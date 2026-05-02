import { NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_COOKIE_DOMAIN, NODE_ENV } from '@env';
import { z } from 'zod';

// Define schema
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_COOKIE_DOMAIN: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

// Validate env at runtime
export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_COOKIE_DOMAIN,
  NODE_ENV,
});

// Optional helper
export const keys = () => ({
  NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_COOKIE_DOMAIN: env.NEXT_PUBLIC_COOKIE_DOMAIN,
  NODE_ENV: env.NODE_ENV,
});
