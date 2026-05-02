import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.cashier.dashboard.$get>;

export type DashboardTrip = ResponseType['upcomingTrips'][number];

export const useGetDashboard = () =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      const response = await client.api.cashier.dashboard.$get({});
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['dashboard'],
  });
