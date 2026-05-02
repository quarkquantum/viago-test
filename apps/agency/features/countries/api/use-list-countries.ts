import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<typeof client.api.countries.$get>;
type RequestType = InferRequestType<typeof client.api.countries.$get>['query'];
export type Country = ResponseType['data'][number];

export const useListCountries = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.countries.$get({
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['countries', query],
  });
