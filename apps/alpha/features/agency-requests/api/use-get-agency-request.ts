import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.alpha)['agency-requests'][':identifier']['$get']>;
export type AgencyRequestDetail = ResponseType['data'];

export const useGetAgencyRequest = (identifier: string) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.alpha['agency-requests'][':identifier'].$get({
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['agency-request', identifier],
    enabled: !!identifier,
  });
