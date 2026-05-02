import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.app.payments.init)[':reference']['$get']>;

export const useCheckPaymentStatus = (
  reference: string,
  options?: Omit<UseQueryOptions<ResponseType, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ResponseType, Error>({
    queryKey: ['payment-status', reference],
    queryFn: async () => {
      const response = await client.api.app.payments.init[':reference'].$get({
        param: { reference },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    enabled: Boolean(reference),
    ...options,
  });
