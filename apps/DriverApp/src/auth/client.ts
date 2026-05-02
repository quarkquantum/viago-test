import { createAuthClient } from 'better-auth/client';
// Import { customSessionClient } from 'better-auth/client/plugins';
import { emailOTPClient } from 'better-auth/client/plugins';

import { keys } from '@/keys';

export const driverAuthClient = createAuthClient({
  basePath: '/api/driver/auth',
  baseURL: keys().NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: 'include',
    headers: {
      Origin: keys().NEXT_PUBLIC_API_URL,
    },
  },
  plugins: [emailOTPClient()],
});
