import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.cashier.agencies.$get>;
type RequestType = InferRequestType<typeof client.api.cashier.agencies.$get>['query'];
export type Agencies = ResponseType['data'][number];

export const useListAgencies = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.cashier.agencies.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['agencies', query],
  });
