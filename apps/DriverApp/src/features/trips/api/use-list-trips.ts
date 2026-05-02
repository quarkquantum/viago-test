import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { client } from '@/lib/hono';
import { useCachedInfiniteQuery } from '@/lib/use-cached-infinite-query';

type ResponseType = InferResponseType<typeof client.api.driver.trips.$get>;
type RequestType = InferRequestType<typeof client.api.driver.trips.$get>['query'];
export type Trip = ResponseType['data'][number];

export const useListTrips = (query: RequestType = {}) =>
  useCachedInfiniteQuery<ResponseType, Error>({
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client.api.driver.trips.$get({
        query: {
          ...query,
          page: String(pageParam),
        },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['trips', query],
    getNextPageParam: (lastPage) => {
      const { next } = lastPage.pagination;
      return next ?? undefined;
    },
    initialPageParam: 1,
  });
