import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.app.me.$get>;
type RequestType = InferRequestType<typeof client.api.app.me.$get>;

export const useGetMe = (
  query: RequestType = {},
  options?: Omit<UseQueryOptions<ResponseType, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ResponseType, Error>({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await client.api.app.me.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    ...options,
  });
