import { hcWithType } from '@repo/server/rpc';

const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Lazy client that reads the API URL at runtime
let _client: ReturnType<typeof hcWithType> | null = null;

export const client = new Proxy({} as ReturnType<typeof hcWithType>, {
  get(_, prop) {
    if (!_client) {
      _client = hcWithType(getApiUrl(), {
        init: {
          credentials: 'include',
        },
      });
    }
    return (_client as any)[prop];
  },
});
