import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type RequestType = InferRequestType<(typeof client.api.admin)['agency-requests']['$get']>['query'];
type ResponseType = InferResponseType<(typeof client.api.admin)['agency-requests']['$get']>;

export type AgencyRequest = ResponseType['data'][number];

export const useListAgencyRequests = (query: RequestType) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.admin['agency-requests'].$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['agency-requests', query],
  });
