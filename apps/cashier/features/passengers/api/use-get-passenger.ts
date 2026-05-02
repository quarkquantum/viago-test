import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.cashier.passengers)[':identifier']['$get']>;
export type Passenger = ResponseType;

export const useGetPassenger = (identifier: string) =>
  useQuery<ResponseType, Error>({
    enabled: Boolean(identifier),
    queryFn: async () => {
      const response = await client.api.cashier.passengers[':identifier'].$get({
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['me', 'passenger', identifier],
  });
