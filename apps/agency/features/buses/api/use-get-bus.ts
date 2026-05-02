import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.agency.buses)[':identifier']['$get'], 200>;
type RequestType = InferRequestType<(typeof client.api.agency.buses)[':identifier']['$get']>['query'];
export type Bus = ResponseType;

export const useGetBus = (identifier: string, query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    enabled: Boolean(identifier),
    queryFn: async () => {
      const response = await client.api.agency.buses[':identifier'].$get({
        param: { identifier },
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['bus', identifier],
  });
