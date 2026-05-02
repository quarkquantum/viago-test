import type { InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ApiError } from '@repo/shared';
import { client } from '@/lib/hono';

type ResponseType = InferResponseType<(typeof client.api.agency.managers)[':identifier']['$delete']>;

export const useDeleteManager = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('managers');

  return useMutation<ResponseType, Error, string>({
    mutationFn: async (identifier) => {
      const response = await client.api.agency.managers[':identifier'].$delete({
        param: { identifier },
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
      toast.success(t('api.success.deleted'));
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      options?.onSuccess?.();
    },
  });
};
