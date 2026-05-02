import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.cashiers)[':identifier']['$get']>;
type RequestType = InferRequestType<(typeof client.api.admin.cashiers)[':identifier']['$get']>;
export type Cashier = ResponseType['cashier'];
export type Agency = ResponseType['cashier']['agency'];
export type Ticket = ResponseType['cashier']['user']['tickets'][number];

export const useGetCashier = (identifier: string, query: RequestType['query'] = {}) =>
  useQuery<ResponseType, Error>({
    enabled: Boolean(identifier),
    queryFn: async () => {
      const response = await client.api.admin.cashiers[':identifier'].$get({
        query,
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['cashier', identifier, query],
  });
