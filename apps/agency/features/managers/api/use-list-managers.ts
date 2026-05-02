import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@repo/shared';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.agency.managers.$get>;
type RequestType = InferRequestType<typeof client.api.agency.managers.$get>['query'];
export type Manager = ResponseType['data'][number];

export const useListManagers = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.agency.managers.$get({ query });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['managers', query],
  });
