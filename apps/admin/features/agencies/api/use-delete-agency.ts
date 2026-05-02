import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.admin.agencies)[':identifier']['$delete']>;

export const useDeleteAgency = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('agencies');

  return useMutation<ResponseType, Error, string>({
    mutationFn: async (identifier) => {
      const response = await client.api.admin.agencies[':identifier'].$delete({
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
      toast.success(t('api.success.deleted'));
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      options?.onSuccess?.();
    },
  });
};
