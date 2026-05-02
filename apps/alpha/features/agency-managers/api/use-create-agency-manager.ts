import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';
import { useTranslations } from 'next-intl';

type ResponseType = InferResponseType<(typeof client.api.alpha)['agency-managers']['$post']>;
type RequestType = InferRequestType<(typeof client.api.alpha)['agency-managers']['$post']>['json'];

export const useCreateAgencyManager = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const t = useTranslations('agencyOwner');
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.alpha['agency-managers'].$post({
        json,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success(t('success.created'));
      queryClient.invalidateQueries({ queryKey: ['agency-managers'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
  });
};