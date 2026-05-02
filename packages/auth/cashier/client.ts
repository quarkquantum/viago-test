import { customSessionClient, emailOTPClient, twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { keys } from '../keys';
import type { auth } from './server';

export const cashierAuthClient = createAuthClient({
  baseURL: keys().NEXT_PUBLIC_API_URL,
  basePath: '/api/cashier/auth',
  fetchOptions: {
    credentials: 'include', // Required for sending cookies cross-origin
  },
  plugins: [emailOTPClient(), customSessionClient<typeof auth>(), twoFactorClient()],
});
