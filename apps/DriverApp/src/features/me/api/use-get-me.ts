import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.driver.me.$get>;

export const useGetMe = (options?: Omit<UseQueryOptions<ResponseType, Error>, 'queryKey' | 'queryFn'>) => {
  const query = useQuery<ResponseType, Error>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await client.api.driver.me.$get();

      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }

      return response.json();
    },
    // refetchInterval: 2000,
    ...options,
  });

  return query;
};
