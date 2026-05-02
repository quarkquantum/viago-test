import type { InferResponseType } from '@repo/server/rpc';
import { useMutation } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.driver.me)['fcm-token']['$patch']>;

export const useUpdateFcmToken = () =>
  useMutation<ResponseType, Error, string>({
    mutationFn: async (token) => {
      const response = await client.api.driver.me['fcm-token'].$patch({ json: { token } });
      return (await response.json()) as ResponseType;
    },
  });
