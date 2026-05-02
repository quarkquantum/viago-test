import type { InferResponseType } from '@repo/server/rpc';
import { ApiError } from '@repo/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';

type DeleteResponse = InferResponseType<(typeof client.api.admin.users)[':identifier']['$delete']>;

export const useDeleteUser = (options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('users');

  return useMutation<DeleteResponse, Error, string>({
    mutationFn: async (identifier: string) => {
      const response = await client.api.admin.users[':identifier'].$delete({
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
      toast.success(t('api.success.deleted'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', identifier] });
      options?.onSuccess?.();
    },
  });
};
