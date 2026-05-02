import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin)['agency-managers']['$get']>;
type RequestType = InferRequestType<(typeof client.api.admin)['agency-managers']['$get']>['query'];

export type AgencyManagerType = ResponseType['data'][number];

export const useListAgencyManagers = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.admin['agency-managers'].$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['agency-managers', query],
  });
