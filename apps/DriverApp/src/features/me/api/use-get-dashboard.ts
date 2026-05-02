import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { client } from '@/lib/hono';
import { useCachedQuery } from '@/lib/use-cached-query';

type ResponseType = InferResponseType<typeof client.api.driver.me.dashboard.$get>;
type RequestType = InferRequestType<typeof client.api.driver.me.dashboard.$get>;
export type UpcomingTrip = ResponseType['upcomingTrips'][number];
export type CurrentTrip = ResponseType['currentTrip'];
export type NextTrip = ResponseType['nextTrip'];

export const useGetDashboard = (query: RequestType = {}) =>
  useCachedQuery<ResponseType, Error>({
    queryKey: ['me', 'dashboard'],
    queryFn: async () => {
      const response = await client.api.driver.me.dashboard.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
  });
