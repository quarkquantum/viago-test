import { hcWithType } from '@repo/server/rpc';
import { env } from '@/keys';

export const client = hcWithType(env.NEXT_PUBLIC_API_URL, {
  init: {
    credentials: 'include',
  },
});
