import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha)['agency-managers'][':identifier']['$get']>;
type RequestType = InferRequestType<(typeof client.api.alpha)['agency-managers'][':identifier']['$get']>;

export const useGetAgencyManager = (identifier: string) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.alpha['agency-managers'][':identifier'].$get({
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['agency-manager', identifier],
    enabled: !!identifier,
  });