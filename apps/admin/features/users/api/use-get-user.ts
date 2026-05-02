import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.users)[':identifier']['$get']>;
type RequestType = InferRequestType<typeof client.api.admin.users.$get>['query'];

export type User = ResponseType['data'];

export const useGetUser = (identifier: string, query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    enabled: Boolean(identifier),
    queryFn: async () => {
      const response = await client.api.admin.users[':identifier'].$get({
        param: { identifier },
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['user', identifier],
  });
