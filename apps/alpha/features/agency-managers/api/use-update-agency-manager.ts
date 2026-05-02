import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';
import { useTranslations } from 'next-intl';

type ResponseType = InferResponseType<(typeof client.api.alpha)['agency-managers'][':identifier']['$patch']>;
type RequestType = InferRequestType<(typeof client.api.alpha)['agency-managers'][':identifier']['$patch']>['json'];

export const useUpdateAgencyManager = (
  identifier: string,
  options?: { onSuccess?: () => void; onError?: () => void }
) => {
  const t = useTranslations('agencyOwner');
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.alpha['agency-managers'][':identifier'].$patch({
        param: { identifier },
        json,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success(t('success.updated'));
      queryClient.invalidateQueries({ queryKey: ['agency-managers'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
  });
};