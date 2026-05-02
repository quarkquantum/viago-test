import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ExtendTrialResponseType = InferResponseType<(typeof client.api.alpha.billing)[':id']['extend-trial']['$patch']>;
type ExtendTrialRequestType = InferResponseType<(typeof client.api.alpha.billing)[':id']['extend-trial']['$patch']>['json'];

export const useExtendTrial = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('common.toast');

  return useMutation<ExtendTrialResponseType, Error, ExtendTrialRequestType & { id: string }>({
    mutationFn: async ({ id, ...json }) => {
      const response = await client.api.alpha.billing[':id']['extend-trial'].$patch({
        param: { id },
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
      toast.success(t('trialExtended'));
      queryClient.invalidateQueries({ queryKey: ['alpha-billing', 'subscriptions'] });
      options?.onSuccess?.();
    },
  });
};