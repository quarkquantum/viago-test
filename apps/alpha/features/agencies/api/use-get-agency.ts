import type { InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha.agencies)[':identifier']['$get']>;

export type AgencyType = ResponseType;

export const useGetAgency = (id: string) =>
  useQuery<AgencyType, Error>({
    queryFn: async () => {
      const response = await client.api.alpha.agencies[':identifier'].$get({
        param: { identifier: id },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['agency', { id }],
  });
