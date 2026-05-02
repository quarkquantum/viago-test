import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.cashier.trips.$get>;
type RequestType = InferRequestType<typeof client.api.cashier.trips.$get>['query'];
export type Route = ResponseType['data'][number];

export const useListTripsRoutes = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.cashier.trips.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['trips', query],
  });
