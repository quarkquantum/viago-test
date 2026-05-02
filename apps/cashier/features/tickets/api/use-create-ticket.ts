import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<typeof client.api.cashier.tickets.$post>;
type RequestType = InferRequestType<typeof client.api.cashier.tickets.$post>['json'];

export const useCreateTicket = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('common.toast');

  return useMutation<{ data?: { id: string }; message?: string }, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.cashier.tickets.$post({
        json,
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
      toast.success(t('ticketCreated'));
      options?.onSuccess?.();
    },
    onSettled: () => {
      // Invalidate and refetch tickets list after mutation completes
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.refetchQueries({ queryKey: ['tickets'] });
    },
  });
};
