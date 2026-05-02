import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.driver.tickets)[':key']['scan']['$post']>;

type ScanTicketVariables = {
  key: string;
  tripId?: string;
};

export const useScanTicket = () => {
  const queryClient = useQueryClient();

  return useMutation<ResponseType, ApiError, ScanTicketVariables>({
    mutationFn: async ({ key, tripId }) => {
      const response = await client.api.driver.tickets[':key'].scan.$post({
        param: {
          key,
        },
        query: tripId
          ? {
              tripId,
            }
          : undefined,
      });

      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate trips list to update counts/stats if needed
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};
