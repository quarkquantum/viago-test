import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

export type Location = {
  id: string;
  name: string;
  city: { id: string; name: string };
};

export const useListLocations = (query: { limit?: string } = {}) =>
  useQuery<{ data: Location[]; pagination: { total: number } }, Error>({
    queryFn: async () => {
      const response = await client.api.cashier.locations.$get({
        query: {
          limit: query.limit || '50',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      return await response.json();
    },
    queryKey: ['locations', query],
  });
