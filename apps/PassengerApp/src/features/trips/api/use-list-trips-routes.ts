import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.app.trips.routes.$get>;
type RequestType = InferRequestType<typeof client.api.app.trips.routes.$get>['query'];
export type Route = NonNullable<ResponseType['data'][number]>;

export const useListTripsRoutes = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.app.trips.routes.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['trips', query],
  });
