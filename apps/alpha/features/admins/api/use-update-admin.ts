import type { InferRequestType, InferResponseType } from '@repo/server/rpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { client } from '@/lib/hono';
import { ApiError } from '@repo/shared';

type ResponseType = InferResponseType<(typeof client.api.alpha.admins)[':identifier']['$patch']>;
type RequestType = InferRequestType<(typeof client.api.alpha.admins)[':identifier']['$patch']>['json'];

export const useUpdateAdmin = (id: string, options?: { onSuccess?: () => void; onError?: () => void }) => {
  const queryClient = useQueryClient();
  const t = useTranslations('admins');

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.alpha.admins[':identifier'].$patch({
        param: { identifier: id },
        json,
      });
      if (!response.ok) {
        throw await ApiError.handleResponse(response);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'));
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      queryClient.invalidateQueries({ queryKey: ['admin', { id }] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
      options?.onError?.();
    },
  });
};
