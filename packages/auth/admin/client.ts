import { adminClient, customSessionClient, emailOTPClient, twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { keys } from '../keys';
import type { auth } from './server';

export const adminAuthClient = createAuthClient({
  basePath: '/api/admin/auth',
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [emailOTPClient(), customSessionClient<typeof auth>(), twoFactorClient(), adminClient()],
});
