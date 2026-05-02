import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.admin.revenues.$get>;

export type RevenueRow = ResponseType['data']['daily'][number];

export const useRevenueStats = () =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.admin.revenues.$get();
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['revenues', 'stats'],
  });
