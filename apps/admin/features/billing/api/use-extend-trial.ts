import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.billing)[':id']['extend-trial']['$patch']>;
type RequestType = InferResponseType<(typeof client.api.admin.billing)[':id']['extend-trial']['$patch']>['json'];

export const useExtendTrial = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('common.toast');

  return useMutation<ResponseType, Error, RequestType & { id: string }>({
    mutationFn: async ({ id, ...json }) => {
      const response = await client.api.admin.billing[':id']['extend-trial'].$patch({
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
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      options?.onSuccess?.();
    },
  });
};
