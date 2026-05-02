import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.driver.notifications.$get>;
type RequestType = InferRequestType<typeof client.api.driver.notifications.$get>['query'];
export type NotificationItem = ResponseType['data'][number];

export const useListNotifications = (query: RequestType = {}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['me', 'dashboard'] });
  }, [queryClient]);

  return useInfiniteQuery<ResponseType, Error>({
    queryKey: ['notifications', query],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await client.api.driver.notifications.$get({
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
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
  });
};
