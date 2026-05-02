import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type SuspendResponseType = InferResponseType<(typeof client.api.alpha.billing)[':id']['suspend']['$patch']>;

export const useSuspendSubscription = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('common.toast');

  return useMutation<SuspendResponseType, Error, string>({
    mutationFn: async (id) => {
      const response = await client.api.alpha.billing[':id'].suspend.$patch({
        param: { id },
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
      toast.success(t('subscriptionSuspended'));
      queryClient.invalidateQueries({ queryKey: ['alpha-billing', 'subscriptions'] });
      options?.onSuccess?.();
    },
  });
};