import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.agencies)[':identifier']['deactivate']['$patch']>;

export const useDeactivateAgency = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('agencies');

  return useMutation<ResponseType, Error, string>({
    mutationFn: async (identifier) => {
      const response = await client.api.admin.agencies[':identifier'].deactivate.$patch({
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
    onSuccess: (_, identifier) => {
      toast.success(t('api.success.deactivated'));
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      queryClient.invalidateQueries({ queryKey: ['agency', identifier] });
      options?.onSuccess?.();
    },
  });
};
