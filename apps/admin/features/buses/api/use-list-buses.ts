import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.admin.buses.$get>;
type RequestType = InferRequestType<typeof client.api.admin.buses.$get>['query'];
export type Bus = ResponseType['data'][number];

export const useListBuses = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.admin.buses.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['buses', query],
  });
