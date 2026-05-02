import type { InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha.drivers)[':identifier']['$delete']>;

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('drivers');

  return useMutation<ResponseType, Error, string>({
    mutationFn: async (identifier) => {
      const response = await client.api.alpha.drivers[':identifier'].$delete({
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
      toast.success(t('deleteSuccess'));
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
};
