import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.driver.me.stats.$get>;
type RequestType = InferRequestType<typeof client.api.driver.me.stats.$get>;

export const useGetStats = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryKey: ['me', 'stats'],
    queryFn: async () => {
      const response = await client.api.driver.me.stats.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
  });
