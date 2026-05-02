import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha.drivers)[':identifier']['$get'], 200>;
type RequestType = InferRequestType<(typeof client.api.alpha.drivers)[':identifier']['$get']>['query'];
export type DriverResponse = ResponseType;
export type Driver = ResponseType['data'];
export type DriverAgency = ResponseType['data']['agency'];

export const useGetDriver = (identifier: string, query: RequestType = {}) =>
  useQuery<ResponseType, Error>({
    enabled: Boolean(identifier),
    queryFn: async () => {
      const response = await client.api.alpha.drivers[':identifier'].$get({
        param: { identifier },
        query,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['me', 'driver', identifier, query],
  });
