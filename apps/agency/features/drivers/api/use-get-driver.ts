import type { InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.agency.drivers)[':identifier']['$get'], 200>;
export type Driver = ResponseType;

export const useGetDriver = (identifier: string) =>
  useQuery<ResponseType, Error>({
    enabled: Boolean(identifier),
    queryFn: async () => {
      const response = await client.api.agency.drivers[':identifier'].$get({
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['me', 'driver', identifier],
  });
