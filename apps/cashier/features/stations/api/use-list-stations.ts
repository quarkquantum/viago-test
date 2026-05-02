import { ApiError } from '@repo/shared';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export type Station = {
  id: string;
  name: string;
  order: number;
  city?: { name: string };
};

export const useListStations = (query: { search?: string; limit?: string } = {}) =>
  useQuery<{ data: Station[]; pagination: { total: number } }, Error>({
    queryFn: async () => {
      const response = await client.api.cashier.stations.$get({
        query: {
          search: query.search,
          limit: query.limit || '20',
        },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    queryKey: ['stations', query],
    enabled: !!query.search && query.search.length >= 2,
  });