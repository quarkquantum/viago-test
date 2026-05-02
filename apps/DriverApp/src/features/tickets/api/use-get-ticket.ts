import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.driver.tickets)[':identifier']['$get']>;
export type Ticket = ResponseType;

export const useGetTicket = (identifier: string) =>
  useQuery<ResponseType, ApiError>({
    enabled: Boolean(identifier),
    queryFn: async () => {
      const response = await client.api.driver.tickets[':identifier'].$get({
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['tickets', identifier],
  });
