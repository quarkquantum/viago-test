import { createAuthClient } from 'better-auth/client';
// Import { customSessionClient } from 'better-auth/client/plugins';
import { emailOTPClient } from 'better-auth/client/plugins';

import { env } from '@/keys';

export const appAuthClient = createAuthClient({
  basePath: '/api/app/auth',
  baseURL: env.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [emailOTPClient()],
});
