import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.cashier.tickets)[':identifier']['$delete']>;

export const useDeleteTicket = (identifier: string, options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('common.toast');

  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.cashier.tickets[':identifier'].$delete({
        param: { identifier },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
    onSuccess: () => {
      toast.success(t('ticketDeleted'));
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      // Invalidate all trips to refresh seat availability
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'trip'] });
      options?.onSuccess?.();
    },
  });
};
