import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.cashier.tickets)[':id']['pay']['$post']>;

export const usePayTicket = (ticketId: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations('common.toast');

  return useMutation<ResponseType, Error, void>({
    mutationFn: async () => {
      const response = await client.api.cashier.tickets[':id'].pay.$post({
        param: { id: ticketId },
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success(t('ticketPaid'));
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
    },
    onError: (error) => {
      toast.error(error.message || t('ticketPayFailed'));
    },
  });
};
