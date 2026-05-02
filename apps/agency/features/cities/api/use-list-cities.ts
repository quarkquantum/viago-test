import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<typeof client.api.agency.cities.$get>;
type RequestType = InferRequestType<typeof client.api.agency.cities.$get>['query'];
export type City = ResponseType['data'][number];

export const useListCities = (query: RequestType = {}, options?: { enabled?: boolean }) =>
  useQuery<ResponseType, Error>({
    enabled: options?.enabled,
    queryFn: async () => {
      const response = await client.api.agency.cities.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['cities', query],
  });
