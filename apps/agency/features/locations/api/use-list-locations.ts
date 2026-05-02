import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.agency.locations.$get>;
type RequestType = InferRequestType<typeof client.api.agency.locations.$get>['query'];

export const useListLocations = (query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.agency.locations.$get({ query });
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return await response.json();
    },
    queryKey: ['locations', query],
  });
