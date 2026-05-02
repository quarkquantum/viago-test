import { adminClient, customSessionClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { keys } from '../keys';
import type { auth } from './server';

export const authClient = createAuthClient({
  baseURL: keys().NEXT_PUBLIC_API_URL,
  basePath: '/api/alpha/auth',
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [customSessionClient<typeof auth>(), adminClient()],
});

export const twoFactor = {
  sendOtp: async () => ({ data: null, error: null }),
  verifyOtp: async () => ({ data: null, error: null }),
};

export const {
  admin: adminAuthClient,
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;
