import type { InferResponseType } from '@repo/server/rpc';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<typeof client.api.agency.dashboard.$get>;

export const useGetDashboard = () =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.agency.dashboard.$get();
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['dashboard'],
  });
