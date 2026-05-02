import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.app.me.tickets.$get>;
type RequestType = InferRequestType<typeof client.api.app.me.tickets.$get>['query'];
export type Route = ResponseType['data'][number];

export const useListMyTickets = (
  query: RequestType = {},
  options?: Omit<UseQueryOptions<ResponseType, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.app.me.tickets.$get({ query });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['me', 'tickets', query],
    ...options,
  });
