import { adminClient, customSessionClient, emailOTPClient, twoFactorClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './server';

// Lazy auth client that reads the API URL at runtime
let _authClient: ReturnType<typeof createAuthClient> | null = null;

const getAuthClient = () => {
  if (!_authClient) {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    _authClient = createAuthClient({
      basePath: '/api/admin/auth',
      baseURL,
      fetchOptions: {
        credentials: 'include', // Required for sending cookies cross-origin
      },
      plugins: [emailOTPClient(), customSessionClient<typeof auth>(), twoFactorClient(), adminClient()],
    });
  }
  return _authClient;
};

export const adminAuthClient = new Proxy({} as ReturnType<typeof createAuthClient>, {
  get(_, prop) {
    return (getAuthClient() as any)[prop];
  },
});
