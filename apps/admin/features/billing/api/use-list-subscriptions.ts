import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type RequestType = InferRequestType<typeof client.api.admin.billing.$get>['query'];
type ResponseType = InferResponseType<typeof client.api.admin.billing.$get>;

export type SubscriptionType = ResponseType['data'][number];

export const useListSubscriptions = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.admin.billing.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['billing', 'subscriptions', query],
  });
