import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.cashier.tickets)[':id']['cancel']['$post']>;

export const useCancelTicket = (id: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations('common.toast');

  return useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.cashier.tickets[':id'].cancel.$post({
        param: { id },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success(t('ticketCancelled'));
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['me', 'trip'] });
    },
  });
};
