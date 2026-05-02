import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha)['agency-managers']['$get']>;
type RequestType = InferRequestType<(typeof client.api.alpha)['agency-managers']['$get']>['query'];
export type AgencyManager = ResponseType['data'][number];

export const useListAgencyManagers = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.alpha['agency-managers'].$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['agency-managers', query],
  });