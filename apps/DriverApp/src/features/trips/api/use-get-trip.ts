import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { client } from '@/lib/hono';
import { useCachedQuery } from '@/lib/use-cached-query';

type ResponseType = InferResponseType<(typeof client.api.driver.trips)[':identifier']['$get']>;
export type Trip = NonNullable<ResponseType>;
export type Station = Trip['stations'][number];

export const useGetTrip = (tripId: string) =>
  useCachedQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.driver.trips[':identifier'].$get({
        param: { identifier: tripId },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['trip', tripId],
    enabled: !!tripId,
    refetchInterval: 3000,
  });
