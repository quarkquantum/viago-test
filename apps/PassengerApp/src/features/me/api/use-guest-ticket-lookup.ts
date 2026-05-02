import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/hono';

// biome-ignore lint/suspicious/noExplicitAny: RPC types require server rebuild to reflect new endpoint
type ResponseType = Awaited<ReturnType<Awaited<ReturnType<typeof client.api.app.tickets.lookup.$get>>['json']>>;

export const useGuestTicketLookup = (
  identifier: string,
  options?: Omit<UseQueryOptions<ResponseType, Error>, 'queryKey' | 'queryFn'>
) =>
  useQuery<ResponseType, Error>({
    queryFn: async () => {
      // biome-ignore lint/suspicious/noExplicitAny: new endpoint not yet in compiled RPC types
      const response = await (client.api.app.tickets as any).lookup.$get({
        query: { identifier },
      });
      if (!response.ok) {
        throw new Error('Failed to lookup tickets');
      }
      return await response.json();
    },
    queryKey: ['tickets', 'guest', identifier],
    ...options,
  });
